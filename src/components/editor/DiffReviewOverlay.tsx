'use client';

// ==========================================================================
// DIFF REVIEW OVERLAY - Minimal, Premium AI Suggestion UI
// ==========================================================================
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useNotesStore } from '@/stores/notesStore';

// ==========================================================================
// COMPONENT
// ==========================================================================
export function DiffReviewOverlay() {
     const { pendingAISuggestion, clearAISuggestion } = useUIStore();
     const { currentNoteId, updateNote, notes } = useNotesStore();

     if (!pendingAISuggestion || !currentNoteId) return null;

     const currentNote = notes.get(currentNoteId);
     if (!currentNote) return null;

     const handleAccept = async () => {
          let newContent = currentNote.content;

          switch (pendingAISuggestion.type) {
               case 'replace':
                    newContent = pendingAISuggestion.suggestedText;
                    break;
               case 'append':
               case 'insert':
                    newContent = currentNote.content + '\n\n' + pendingAISuggestion.suggestedText;
                    break;
          }

          await updateNote(currentNoteId, { content: newContent });
          clearAISuggestion();
     };

     const handleReject = () => {
          clearAISuggestion();
     };

     const previewText = pendingAISuggestion.suggestedText.length > 200
          ? pendingAISuggestion.suggestedText.substring(0, 200) + '...'
          : pendingAISuggestion.suggestedText;

     return (
          <AnimatePresence>
               <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="fixed bottom-6 right-6 z-50 w-80"
               >
                    <div className="bg-card/95 backdrop-blur-md border border-border/60 rounded-xl shadow-xl overflow-hidden">
                         {/* Header - Ultra minimal */}
                         <div className="px-4 py-3 border-b border-border/40 flex items-center gap-3">
                              <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                                   <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-sm font-medium text-foreground/90">{pendingAISuggestion.actionName}</span>
                         </div>

                         {/* Preview - Clean and simple */}
                         <div className="p-4">
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                                   {previewText}
                              </p>
                         </div>

                         {/* Actions - Minimal buttons */}
                         <div className="px-4 pb-4 flex gap-2">
                              <button
                                   onClick={handleReject}
                                   className="flex-1 h-9 rounded-lg border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5"
                              >
                                   <X className="h-3.5 w-3.5" />
                                   Dismiss
                              </button>
                              <button
                                   onClick={handleAccept}
                                   className="flex-1 h-9 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-1.5"
                              >
                                   <Check className="h-3.5 w-3.5" />
                                   Accept
                              </button>
                         </div>
                    </div>
               </motion.div>
          </AnimatePresence>
     );
}
