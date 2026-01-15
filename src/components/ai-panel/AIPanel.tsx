'use client';

// ==========================================================================
// AI PANEL - Action-Focused Design with Diff Review
// ==========================================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
     Sparkles,
     Wand2,
     Expand,
     ArrowRight,
     Link,
     Hash,
     Lightbulb,
     Loader2,
     X,
     Check,
     Copy,
     RefreshCw,
     ChevronDown,
     ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUIStore } from '@/stores/uiStore';
import { useNotesStore } from '@/stores/notesStore';
import { enhanceWriting, expandContent, continueWriting, suggestLinks, suggestTags } from '@/lib/ai';
import { cn } from '@/lib/utils';
import { nanoid } from 'nanoid';

// ==========================================================================
// AI ACTION CARD
// ==========================================================================
function AIActionCard({
     icon: Icon,
     title,
     description,
     onClick,
     isLoading = false,
     disabled = false
}: {
     icon: React.ElementType;
     title: string;
     description: string;
     onClick: () => void;
     isLoading?: boolean;
     disabled?: boolean;
}) {
     return (
          <button
               onClick={onClick}
               disabled={isLoading || disabled}
               className={cn(
                    'group relative w-full rounded-lg border border-border/50 bg-card p-4 text-left transition-all',
                    'hover:border-ai/50 hover:bg-ai/5 hover:shadow-sm',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border/50 disabled:hover:bg-card'
               )}
          >
               <div className="flex items-start gap-3">
                    <div className={cn(
                         'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                         isLoading ? 'bg-ai/20' : 'bg-ai/10 group-hover:bg-ai/20'
                    )}>
                         {isLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin text-ai" />
                         ) : (
                              <Icon className="h-5 w-5 text-ai" />
                         )}
                    </div>
                    <div className="flex-1 min-w-0">
                         <h4 className="font-medium text-sm mb-1">{title}</h4>
                         <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
               </div>
          </button>
     );
}

// ==========================================================================
// SUGGESTION ITEM
// ==========================================================================
function SuggestionItem({
     text,
     onCopy,
     onInsert
}: {
     text: string;
     onCopy: () => void;
     onInsert: () => void;
}) {
     const [copied, setCopied] = useState(false);

     const handleCopy = () => {
          onCopy();
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
     };

     return (
          <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="rounded-lg border border-border/50 bg-muted/30 p-3"
          >
               <p className="text-sm mb-3 whitespace-pre-wrap">{text}</p>
               <div className="flex items-center gap-2">
                    <Button
                         size="sm"
                         variant="ghost"
                         onClick={handleCopy}
                         className="h-7 text-xs"
                    >
                         {copied ? (
                              <>
                                   <Check className="h-3 w-3 mr-1" />
                                   Copied
                              </>
                         ) : (
                              <>
                                   <Copy className="h-3 w-3 mr-1" />
                                   Copy
                              </>
                         )}
                    </Button>
                    <Button
                         size="sm"
                         onClick={onInsert}
                         className="h-7 text-xs bg-ai hover:bg-ai/90"
                    >
                         <Check className="h-3 w-3 mr-1" />
                         Insert
                    </Button>
               </div>
          </motion.div>
     );
}

// ==========================================================================
// MAIN AI PANEL
// ==========================================================================
export function AIPanel() {
     const { toggleAIPanel, setAISuggestion, pendingAISuggestion } = useUIStore();
     const { currentNoteId, notes, updateNote } = useNotesStore();

     const currentNote = currentNoteId ? notes.get(currentNoteId) : undefined;

     const [isLoading, setIsLoading] = useState(false);
     const [loadingAction, setLoadingAction] = useState<string | null>(null);
     const [suggestions, setSuggestions] = useState<string[]>([]);
     const [showSuggestions, setShowSuggestions] = useState(true);

     // Handle enhance - now sends to diff review
     const handleEnhance = async () => {
          if (!currentNote) return;

          setIsLoading(true);
          setLoadingAction('enhance');

          try {
               const enhanced = await enhanceWriting(currentNote.content);
               setAISuggestion({
                    id: nanoid(),
                    type: 'replace',
                    originalText: currentNote.content,
                    suggestedText: enhanced,
                    actionName: 'Enhance Writing'
               });
          } catch (error) {
               console.error('Failed to enhance:', error);
          } finally {
               setIsLoading(false);
               setLoadingAction(null);
          }
     };

     // Handle expand - now sends to diff review
     const handleExpand = async () => {
          if (!currentNote) return;

          setIsLoading(true);
          setLoadingAction('expand');

          try {
               const expanded = await expandContent(currentNote.content);
               setAISuggestion({
                    id: nanoid(),
                    type: 'append',
                    originalText: '',
                    suggestedText: expanded,
                    actionName: 'Expand Content'
               });
          } catch (error) {
               console.error('Failed to expand:', error);
          } finally {
               setIsLoading(false);
               setLoadingAction(null);
          }
     };

     // Handle continue - now sends to diff review
     const handleContinue = async () => {
          if (!currentNote) return;

          setIsLoading(true);
          setLoadingAction('continue');

          try {
               const continued = await continueWriting(currentNote.content);
               setAISuggestion({
                    id: nanoid(),
                    type: 'append',
                    originalText: '',
                    suggestedText: continued,
                    actionName: 'Continue Writing'
               });
          } catch (error) {
               console.error('Failed to continue:', error);
          } finally {
               setIsLoading(false);
               setLoadingAction(null);
          }
     };

     // Handle suggest links
     const handleSuggestLinks = async () => {
          if (!currentNote) return;

          setIsLoading(true);
          setLoadingAction('links');
          setSuggestions([]);

          try {
               const otherNotes = Array.from(notes.values())
                    .filter(n => n.id !== currentNote.id)
                    .map(n => ({ id: n.id, title: n.title, excerpt: n.excerpt || '' }));

               const linkSuggestions = await suggestLinks(currentNote.content, otherNotes);

               if (linkSuggestions.length > 0) {
                    setSuggestions(linkSuggestions.map(s => `[[${s.content}]]`));
                    setShowSuggestions(true);
               }
          } catch (error) {
               console.error('Failed to suggest links:', error);
          } finally {
               setIsLoading(false);
               setLoadingAction(null);
          }
     };

     // Handle suggest tags
     const handleSuggestTags = async () => {
          if (!currentNote) return;

          setIsLoading(true);
          setLoadingAction('tags');
          setSuggestions([]);

          try {
               const allTags: string[] = [];
               notes.forEach(n => n.tags.forEach(t => allTags.push(t)));

               const tagSuggestions = await suggestTags(currentNote.content, [...new Set(allTags)]);

               if (tagSuggestions.length > 0) {
                    setSuggestions(tagSuggestions.map(t => `#${t}`));
                    setShowSuggestions(true);
               }
          } catch (error) {
               console.error('Failed to suggest tags:', error);
          } finally {
               setIsLoading(false);
               setLoadingAction(null);
          }
     };

     // Copy to clipboard
     const handleCopy = (text: string) => {
          navigator.clipboard.writeText(text);
     };

     // Insert into note
     const handleInsert = (text: string) => {
          if (!currentNote) return;
          updateNote(currentNote.id, {
               content: currentNote.content + '\n\n' + text
          });
     };

     // Clear suggestions
     const handleClear = () => {
          setSuggestions([]);
     };

     // Check if there's an active pending suggestion
     const hasPendingSuggestion = !!pendingAISuggestion;

     return (
          <div className="flex h-full flex-col">
               {/* Header */}
               <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                         <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai/10">
                              <Sparkles className="h-4 w-4 text-ai" />
                         </div>
                         <h3 className="font-semibold text-sm">AI Assistant</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleAIPanel}>
                         <X className="h-4 w-4" />
                    </Button>
               </div>

               <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                         {/* Current Context */}
                         {currentNote ? (
                              <div className="rounded-lg bg-muted/50 p-3 text-xs">
                                   <span className="text-muted-foreground">Editing: </span>
                                   <span className="font-medium">{currentNote.title}</span>
                                   <div className="mt-1 text-muted-foreground">
                                        {currentNote.metadata.wordCount} words
                                   </div>
                              </div>
                         ) : (
                              <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                                   Open a note to use AI features
                              </div>
                         )}

                         {/* Quick Actions */}
                         <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                   <Wand2 className="h-3.5 w-3.5" />
                                   QUICK ACTIONS
                              </h4>
                              <div className="space-y-2">
                                   <AIActionCard
                                        icon={Sparkles}
                                        title="Enhance Writing"
                                        description="Improve clarity, style, and grammar"
                                        onClick={handleEnhance}
                                        isLoading={loadingAction === 'enhance'}
                                        disabled={!currentNote}
                                   />
                                   <AIActionCard
                                        icon={Expand}
                                        title="Expand Content"
                                        description="Add more detail and examples"
                                        onClick={handleExpand}
                                        isLoading={loadingAction === 'expand'}
                                        disabled={!currentNote}
                                   />
                                   <AIActionCard
                                        icon={ArrowRight}
                                        title="Continue Writing"
                                        description="Generate next paragraphs"
                                        onClick={handleContinue}
                                        isLoading={loadingAction === 'continue'}
                                        disabled={!currentNote}
                                   />
                              </div>
                         </div>

                         {/* Organization */}
                         <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                   <Lightbulb className="h-3.5 w-3.5" />
                                   ORGANIZATION
                              </h4>
                              <div className="space-y-2">
                                   <AIActionCard
                                        icon={Link}
                                        title="Suggest Links"
                                        description="Find related notes to connect"
                                        onClick={handleSuggestLinks}
                                        isLoading={loadingAction === 'links'}
                                        disabled={!currentNote}
                                   />
                                   <AIActionCard
                                        icon={Hash}
                                        title="Suggest Tags"
                                        description="Auto-tag based on content"
                                        onClick={handleSuggestTags}
                                        isLoading={loadingAction === 'tags'}
                                        disabled={!currentNote}
                                   />
                              </div>
                         </div>

                         {/* Suggestions */}
                         {suggestions.length > 0 && (
                              <div>
                                   <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                             <Sparkles className="h-3.5 w-3.5" />
                                             SUGGESTIONS
                                        </h4>
                                        <div className="flex items-center gap-1">
                                             <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6"
                                                  onClick={() => setShowSuggestions(!showSuggestions)}
                                             >
                                                  {showSuggestions ? (
                                                       <ChevronUp className="h-3.5 w-3.5" />
                                                  ) : (
                                                       <ChevronDown className="h-3.5 w-3.5" />
                                                  )}
                                             </Button>
                                             <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6"
                                                  onClick={handleClear}
                                             >
                                                  <X className="h-3.5 w-3.5" />
                                             </Button>
                                        </div>
                                   </div>

                                   <AnimatePresence>
                                        {showSuggestions && (
                                             <motion.div
                                                  initial={{ height: 0, opacity: 0 }}
                                                  animate={{ height: 'auto', opacity: 1 }}
                                                  exit={{ height: 0, opacity: 0 }}
                                                  className="space-y-2 overflow-hidden"
                                             >
                                                  {suggestions.map((s, i) => (
                                                       <SuggestionItem
                                                            key={i}
                                                            text={s}
                                                            onCopy={() => handleCopy(s)}
                                                            onInsert={() => handleInsert(s)}
                                                       />
                                                  ))}
                                             </motion.div>
                                        )}
                                   </AnimatePresence>
                              </div>
                         )}
                    </div>
               </ScrollArea>

               {/* Footer */}
               <div className="border-t border-border p-3">
                    <p className="text-xs text-center text-muted-foreground">
                         Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">⌘/</kbd> to toggle
                    </p>
               </div>
          </div>
     );
}
