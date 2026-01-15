'use client';

// ==========================================================================
// EDITOR PAGE - Standard Background
// ==========================================================================
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import debounce from 'lodash.debounce';
import {
     FileText,
     Clock,
     Hash,
     Link,
     MoreHorizontal,
     Trash2,
     Star,
     Archive,
     Copy,
     Search,
     Pencil,
     FolderInput,
     ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TipTapEditor, markdownToHtml, htmlToMarkdown } from '@/components/editor/TipTapEditor';
import { useNotesStore } from '@/stores/notesStore';
import { useUIStore } from '@/stores/uiStore';
import { fadeInUp } from '@/lib/animations';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';

// ==========================================================================
// BACKLINKS PANEL
// ==========================================================================
function BacklinksPanel({ note }: { note: Note }) {
     const { notes, openNote } = useNotesStore();

     const backlinks = useMemo(() => {
          return note.backlinks
               .map(id => notes.get(id))
               .filter((n): n is Note => n !== undefined);
     }, [note.backlinks, notes]);

     if (backlinks.length === 0) return null;

     return (
          <div className="rounded-lg border border-border bg-card p-4">
               <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Link className="h-4 w-4" />
                    Linked Mentions ({backlinks.length})
               </h3>
               <div className="space-y-2">
                    {backlinks.map(linkedNote => (
                         <button
                              key={linkedNote.id}
                              onClick={() => openNote(linkedNote.id)}
                              className="flex items-center gap-2 w-full text-left rounded-md p-2 hover:bg-muted transition-colors"
                         >
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm truncate">{linkedNote.title}</span>
                         </button>
                    ))}
               </div>
          </div>
     );
}

// ==========================================================================
// FIND IN NOTE
// ==========================================================================
function FindInNote({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
     const [query, setQuery] = useState('');

     useEffect(() => {
          if (!isOpen) return;
          const handleKeyDown = (e: KeyboardEvent) => {
               if (e.key === 'Escape') onClose();
          };
          window.addEventListener('keydown', handleKeyDown);
          return () => window.removeEventListener('keydown', handleKeyDown);
     }, [isOpen, onClose]);

     if (!isOpen) return null;

     return (
          <motion.div
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="absolute top-0 right-0 z-20 flex items-center gap-2 bg-popover border border-border rounded-lg p-2 shadow-lg"
          >
               <Search className="h-4 w-4 text-muted-foreground" />
               <input
                    type="text"
                    placeholder="Find in note..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-transparent text-sm outline-none w-48"
                    autoFocus
               />
               <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    ×
               </button>
          </motion.div>
     );
}

// ==========================================================================
// MAIN EDITOR PAGE
// ==========================================================================
export default function EditorPage() {
     const { currentNoteId, notes, updateNote, deleteNote, pinNote, unpinNote } = useNotesStore();
     const { settings } = useUIStore();

     const currentNote = currentNoteId ? notes.get(currentNoteId) : undefined;

     const [title, setTitle] = useState(currentNote?.title || '');
     const [content, setContent] = useState(currentNote?.content || '');
     const [isSaving, setIsSaving] = useState(false);
     const [showFind, setShowFind] = useState(false);

     useEffect(() => {
          if (currentNote) {
               setTitle(currentNote.title);
               setContent(currentNote.content);
          }
     }, [currentNote?.id]);

     useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
               if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                    e.preventDefault();
                    setShowFind(true);
               }
          };
          window.addEventListener('keydown', handleKeyDown);
          return () => window.removeEventListener('keydown', handleKeyDown);
     }, []);

     const debouncedSave = useMemo(
          () =>
               debounce(async (id: string, updates: Partial<Note>) => {
                    setIsSaving(true);
                    await updateNote(id, updates);
                    setIsSaving(false);
               }, 1000),
          [updateNote]
     );

     const handleTitleChange = useCallback((newTitle: string) => {
          setTitle(newTitle);
          if (currentNote) {
               debouncedSave(currentNote.id, { title: newTitle });
          }
     }, [currentNote, debouncedSave]);

     const handleContentChange = useCallback((newContent: string) => {
          setContent(newContent);
          if (currentNote) {
               debouncedSave(currentNote.id, { content: htmlToMarkdown(newContent) });
          }
     }, [currentNote, debouncedSave]);

     const handleDelete = async () => {
          if (currentNote && confirm('Are you sure you want to delete this note?')) {
               await deleteNote(currentNote.id);
          }
     };

     const handleTogglePin = () => {
          if (currentNote) {
               if (currentNote.isPinned) {
                    unpinNote(currentNote.id);
               } else {
                    pinNote(currentNote.id);
               }
          }
     };

     const handleRename = () => {
          const newTitle = prompt('Enter new title:', currentNote?.title);
          if (newTitle && currentNote) {
               handleTitleChange(newTitle);
          }
     };

     // No note selected
     if (!currentNote) {
          return (
               <div className="flex h-full items-center justify-center bg-background">
                    <div className="text-center">
                         <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                         <h2 className="text-xl font-semibold mb-2">No Note Selected</h2>
                         <p className="text-muted-foreground">
                              Select a note from the sidebar or create a new one
                         </p>
                    </div>
               </div>
          );
     }

     const wordCount = currentNote.metadata.wordCount;
     const readTime = currentNote.metadata.readTime;
     const updatedAt = new Date(currentNote.metadata.updatedAt);

     return (
          <ScrollArea className="h-full bg-background">
               <motion.div
                    key={currentNote.id}
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    className="mx-auto py-8 relative"
                    style={{ maxWidth: settings.editorWidth }}
               >
                    {showFind && (
                         <FindInNote isOpen={showFind} onClose={() => setShowFind(false)} />
                    )}

                    {/* Header */}
                    <div className="px-4 mb-6">
                         <input
                              type="text"
                              value={title}
                              onChange={(e) => handleTitleChange(e.target.value)}
                              placeholder="Untitled"
                              className="w-full text-3xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground"
                         />

                         {/* Metadata */}
                         <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                   <Clock className="h-3.5 w-3.5" />
                                   {updatedAt.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                   })}
                              </span>
                              <span className="flex items-center gap-1.5">
                                   <FileText className="h-3.5 w-3.5" />
                                   {wordCount} words
                              </span>
                              <span>{readTime} min read</span>

                              {isSaving && (
                                   <span className="text-violet-400 animate-pulse">Saving...</span>
                              )}

                              {currentNote.tags.length > 0 && (
                                   <div className="flex items-center gap-1.5">
                                        <Hash className="h-3.5 w-3.5" />
                                        {currentNote.tags.slice(0, 3).map(tag => (
                                             <span key={tag} className="bg-muted px-2 py-0.5 rounded text-xs">
                                                  {tag}
                                             </span>
                                        ))}
                                        {currentNote.tags.length > 3 && (
                                             <span className="text-xs">+{currentNote.tags.length - 3}</span>
                                        )}
                                   </div>
                              )}

                              <div className="ml-auto flex items-center gap-1">
                                   <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={handleTogglePin}
                                   >
                                        <Star className={cn(
                                             "h-4 w-4",
                                             currentNote.isPinned && "fill-amber-400 text-amber-400"
                                        )} />
                                   </Button>

                                   <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-8 w-8">
                                                  <MoreHorizontal className="h-4 w-4" />
                                             </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                             <DropdownMenuItem onClick={() => setShowFind(true)}>
                                                  <Search className="mr-2 h-4 w-4" />
                                                  Find in note
                                                  <span className="ml-auto text-xs text-muted-foreground">⌘F</span>
                                             </DropdownMenuItem>
                                             <DropdownMenuItem onClick={handleRename}>
                                                  <Pencil className="mr-2 h-4 w-4" />
                                                  Rename
                                             </DropdownMenuItem>
                                             <DropdownMenuItem>
                                                  <FolderInput className="mr-2 h-4 w-4" />
                                                  Move to...
                                             </DropdownMenuItem>
                                             <DropdownMenuItem>
                                                  <ExternalLink className="mr-2 h-4 w-4" />
                                                  Open in new window
                                             </DropdownMenuItem>
                                             <DropdownMenuSeparator />
                                             <DropdownMenuItem onClick={() => navigator.clipboard.writeText(currentNote.content)}>
                                                  <Copy className="mr-2 h-4 w-4" />
                                                  Copy content
                                             </DropdownMenuItem>
                                             <DropdownMenuItem>
                                                  <Archive className="mr-2 h-4 w-4" />
                                                  Archive
                                             </DropdownMenuItem>
                                             <DropdownMenuSeparator />
                                             <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                                  <Trash2 className="mr-2 h-4 w-4" />
                                                  Delete
                                             </DropdownMenuItem>
                                        </DropdownMenuContent>
                                   </DropdownMenu>
                              </div>
                         </div>
                    </div>

                    <Separator className="mb-6" />

                    {/* Editor Content - No wrapper div */}
                    <div className="px-4">
                         <TipTapEditor
                              content={markdownToHtml(content)}
                              onChange={handleContentChange}
                              placeholder="Start writing, or right-click for formatting options..."
                         />
                    </div>

                    {/* Backlinks */}
                    <div className="px-4 mt-12">
                         <BacklinksPanel note={currentNote} />
                    </div>
               </motion.div>
          </ScrollArea>
     );
}
