'use client';

import { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
     Search,
     Settings,
     FileText,
     Star,
     MoreHorizontal,
     Trash2,
     PanelLeftClose,
     X,
     Pin,
     PinOff,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotesStore } from '@/stores/notesStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';

// ==========================================================================
// SEARCH MODAL
// ==========================================================================
function SearchModal({ onClose }: { onClose: () => void }) {
     const { notes, openNote } = useNotesStore();
     const [query, setQuery] = useState('');
     const inputRef = useRef<HTMLInputElement>(null);

     useEffect(() => {
          inputRef.current?.focus();
          const handler = (e: KeyboardEvent) => {
               if (e.key === 'Escape') onClose();
          };
          window.addEventListener('keydown', handler);
          return () => window.removeEventListener('keydown', handler);
     }, [onClose]);

     const results = useMemo(() => {
          if (!query.trim()) return Array.from(notes.values()).slice(0, 8);
          const q = query.toLowerCase();
          return Array.from(notes.values())
               .filter(n =>
                    n.title.toLowerCase().includes(q) ||
                    n.content.toLowerCase().includes(q) ||
                    n.tags.some(t => t.toLowerCase().includes(q))
               )
               .slice(0, 10);
     }, [notes, query]);

     const empty = query.length > 0 && results.length === 0;

     const handleSelect = (noteId: string) => {
          openNote(noteId);
          onClose();
     };

     return (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
               <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
               />
               <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="relative w-full max-w-lg mx-4 flex flex-col items-stretch"
               >
                    <div className="w-full self-start overflow-hidden rounded-xl bg-popover border border-border shadow-2xl">
                         {/* input row */}
                         <div className="flex h-12 items-center gap-2 border-b border-border/50 px-3 transition-colors duration-100 hover:bg-muted/30">
                              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                              <input
                                   ref={inputRef}
                                   value={query}
                                   onChange={(event) => setQuery(event.target.value)}
                                   placeholder="Search notes..."
                                   aria-label="Search notes"
                                   className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/70"
                              />
                              {query && (
                                   <button
                                        aria-label="Clear search"
                                        type="button"
                                        onClick={() => {
                                             setQuery("");
                                             inputRef.current?.focus();
                                        }}
                                        className="flex size-5.5 items-center justify-center rounded-full text-muted-foreground transition-colors duration-100 hover:bg-muted hover:text-foreground"
                                        style={{ animation: "fadeIn 150ms ease-out both" }}
                                   >
                                        <X className="h-3.5 w-3.5" />
                                   </button>
                              )}
                         </div>

                         {/* results / empty state */}
                         {empty ? (
                              <div className="flex flex-col items-center justify-center gap-1 px-4 py-8" style={{ animation: "fadeIn 250ms ease-out both" }}>
                                   <span className="mb-1.5 flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground shadow-sm">
                                        <Search className="h-4 w-4" />
                                   </span>
                                   <span className="text-[13px] font-medium text-foreground">No notes found</span>
                                   <span className="text-[12px] text-muted-foreground">Adjust your search to try again</span>
                              </div>
                         ) : (
                              <div className="max-h-72 overflow-y-auto p-1">
                                   {results.map((note) => (
                                        <button
                                             key={note.id}
                                             type="button"
                                             onClick={() => handleSelect(note.id)}
                                             className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-[13px] text-foreground transition-colors duration-100 hover:bg-muted group"
                                             style={{ animation: "fadeIn 200ms ease-out both" }}
                                        >
                                             <FileText className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground/70 transition-colors" />
                                             <div className="flex-1 min-w-0">
                                                  <p className="font-medium truncate">{note.title || 'Untitled'}</p>
                                                  {note.excerpt && (
                                                       <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                                            {note.excerpt}
                                                       </p>
                                                  )}
                                             </div>
                                             {note.isPinned && (
                                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                                             )}
                                        </button>
                                   ))}
                              </div>
                         )}

                         {/* Footer hint */}
                         <div className="border-t border-border/50 px-4 py-2 flex items-center justify-between bg-muted/10">
                              <div className="flex items-center gap-3">
                                   <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
                                        <kbd className="bg-muted px-1 py-0.5 rounded border border-border/50 text-[9px] font-sans">↵</kbd> to open
                                   </span>
                                   <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
                                        <kbd className="bg-muted px-1 py-0.5 rounded border border-border/50 text-[9px] font-sans">esc</kbd> to close
                                   </span>
                              </div>
                         </div>
                    </div>
               </motion.div>
          </div>
     );
}

// ==========================================================================
// MAIN SIDEBAR
// ==========================================================================
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';

export function Sidebar() {
     const { openSettings, toggleSidebar } = useUIStore();
     const { notes, currentNoteId, openNote, createNote, deleteNote, pinNote, unpinNote, updateNote } = useNotesStore();

     const [searchOpen, setSearchOpen] = useState(false);
     const [hovered, setHovered] = useState<string | null>(null);
     const [box, setBox] = useState<{ top: number; height: number } | null>(null);
     
     // Dialog states
     const [noteToRename, setNoteToRename] = useState<Note | null>(null);
     const [renameValue, setRenameValue] = useState('');
     const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

     const navRef = useRef<HTMLDivElement>(null);
     const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

     const pinnedNotes = useMemo(
          () =>
               Array.from(notes.values())
                    .filter(n => n.isPinned)
                    .sort(
                         (a, b) =>
                              new Date(b.metadata.updatedAt).getTime() -
                              new Date(a.metadata.updatedAt).getTime()
                    ),
          [notes]
     );

     const unpinnedNotes = useMemo(
          () =>
               Array.from(notes.values())
                    .filter(n => !n.isPinned)
                    .sort(
                         (a, b) =>
                              new Date(b.metadata.updatedAt).getTime() -
                              new Date(a.metadata.updatedAt).getTime()
                    ),
          [notes]
     );

     // Handle rename value syncing
     useEffect(() => {
          if (noteToRename) {
               setRenameValue(noteToRename.title || '');
          }
     }, [noteToRename]);

     const handleConfirmDelete = async () => {
          if (noteToDelete) {
               await deleteNote(noteToDelete.id);
               setNoteToDelete(null);
          }
     };

     const handleConfirmRename = async () => {
          if (noteToRename && renameValue.trim()) {
               await updateNote(noteToRename.id, { title: renameValue.trim() });
          }
          setNoteToRename(null);
     };

     const handleTogglePin = (note: Note) => {
          note.isPinned ? unpinNote(note.id) : pinNote(note.id);
     };

     // Open search on Cmd+K
     useEffect(() => {
          const handler = (e: KeyboardEvent) => {
               if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    setSearchOpen(true);
               }
          };
          window.addEventListener('keydown', handler);
          return () => window.removeEventListener('keydown', handler);
     }, []);

     useLayoutEffect(() => {
          const container = navRef.current;
          const target = itemRefs.current[hovered ?? currentNoteId ?? ''];
          if (!container || !target) return;

          const containerRect = container.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          setBox({
               top: targetRect.top - containerRect.top,
               height: targetRect.height,
          });
     }, [hovered, currentNoteId, pinnedNotes, unpinnedNotes]);

     const sections = [
          { label: "Pinned", items: pinnedNotes },
          { label: "Notes", items: unpinnedNotes }
     ].filter(s => s.items.length > 0);

     return (
          <>
               <div className="flex h-full flex-col bg-sidebar overflow-hidden w-full p-2">
                    {/* workspace row */}
                    <div className="mb-2 flex w-full justify-end px-1 pt-1">
                         <button
                              type="button"
                              onClick={toggleSidebar}
                              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              aria-label="Close sidebar"
                         >
                              <PanelLeftClose className="h-4 w-4" />
                         </button>
                    </div>

                    {/* quick search */}
                    <button
                         type="button"
                         onClick={() => setSearchOpen(true)}
                         className="mb-1 flex h-8 items-center gap-2 rounded-lg bg-muted/50 px-2.5 shadow-sm w-full transition-colors hover:bg-muted"
                    >
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-muted-foreground" strokeWidth="2" strokeLinecap="round">
                              <circle cx="11" cy="11" r="7" />
                              <path d="M21 21l-4.3-4.3" />
                         </svg>
                         <span className="min-w-0 flex-1 text-left bg-transparent text-[12.5px] text-muted-foreground">
                              Quick search
                         </span>
                         <kbd className="flex size-4.5 items-center justify-center rounded-[5px] bg-background text-[10px] text-muted-foreground shadow-sm px-1.5">
                              ⌘K
                         </kbd>
                    </button>

                    {/* accent action */}
                    <button
                         type="button"
                         onClick={() => createNote()}
                         className="mb-2 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium text-primary transition-[background-color,transform] duration-100 hover:bg-primary/10 active:scale-[0.96]"
                    >
                         <span className="min-w-0 flex-1 truncate text-left">New note</span>
                         <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                   <path d="M12 5v14M5 12h14" />
                              </svg>
                         </span>
                    </button>

                    {/* items */}
                    <ScrollArea className="flex-1 min-h-0">
                         <div
                              ref={navRef}
                              onMouseLeave={() => setHovered(null)}
                              className="relative flex flex-col gap-2 pb-2"
                         >
                              {sections.length > 0 && (
                                   <span
                                        aria-hidden
                                        className="pointer-events-none absolute inset-x-0 rounded-[7px] bg-muted"
                                        style={{
                                             top: box?.top ?? 0,
                                             height: box?.height ?? 0,
                                             opacity: box ? 1 : 0,
                                             transition:
                                                  "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
                                        }}
                                   />
                              )}

                              {sections.length === 0 && (
                                   <div className="px-3 py-6 text-center">
                                        <FileText className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground/40">No notes yet</p>
                                   </div>
                              )}

                              {sections.map((section) => (
                                   <div key={section.label}>
                                        <div className="px-2 pb-1 pt-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                                             {section.label}
                                        </div>
                                        <div className="flex flex-col gap-px">
                                             {section.items.map((item) => {
                                                  const isActive = item.id === currentNoteId;
                                                  return (
                                                       <div
                                                            key={item.id}
                                                            ref={(el) => {
                                                                 // @ts-ignore
                                                                 itemRefs.current[item.id] = el;
                                                            }}
                                                            onMouseEnter={() => setHovered(item.id)}
                                                            onFocus={() => setHovered(item.id)}
                                                            onBlur={() => setHovered(null)}
                                                            className="group relative z-10 flex w-full items-center gap-2 rounded-[7px] px-2 py-1.5 text-left transition-[color,transform] duration-150"
                                                       >
                                                            {/* Main clickable area for the note */}
                                                            <div 
                                                                 role="button"
                                                                 tabIndex={0}
                                                                 onClick={() => openNote(item.id)}
                                                                 onKeyDown={(e) => {
                                                                      if (e.key === 'Enter' || e.key === ' ') {
                                                                           e.preventDefault();
                                                                           openNote(item.id);
                                                                      }
                                                                 }}
                                                                 className="flex-1 flex items-center min-w-0 h-full cursor-pointer outline-none"
                                                            >
                                                                 <span
                                                                      className={cn(
                                                                           "min-w-0 flex-1 truncate text-[13px] transition-colors duration-150",
                                                                           isActive ? "font-medium text-foreground" : "text-foreground/80"
                                                                      )}
                                                                 >
                                                                      {item.title || 'Untitled'}
                                                                 </span>
                                                                 {item.isPinned && (
                                                                      <Star className="ml-2 h-3 w-3 fill-amber-400 text-amber-400 shrink-0 opacity-80" />
                                                                 )}
                                                            </div>
                                                            
                                                            {/* Three-dot menu */}
                                                            <div className={cn(
                                                                 "shrink-0 flex items-center justify-center transition-opacity duration-100",
                                                                 isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                                                            )}>
                                                                 <DropdownMenu>
                                                                      <DropdownMenuTrigger asChild>
                                                                           <div
                                                                                role="button"
                                                                                tabIndex={0}
                                                                                className="p-0.5 rounded text-muted-foreground hover:bg-background/50 hover:text-foreground cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                                           >
                                                                                <MoreHorizontal className="h-3.5 w-3.5" />
                                                                           </div>
                                                                      </DropdownMenuTrigger>
                                                                      <DropdownMenuContent align="end" className="w-44" onClick={e => e.stopPropagation()}>
                                                                           <DropdownMenuItem onClick={() => setNoteToRename(item)}>
                                                                                <Pencil className="mr-2 h-3.5 w-3.5" /> Rename
                                                                           </DropdownMenuItem>
                                                                           <DropdownMenuItem onClick={() => handleTogglePin(item)}>
                                                                                {item.isPinned ? (
                                                                                     <><PinOff className="mr-2 h-3.5 w-3.5" /> Unfavourite</>
                                                                                ) : (
                                                                                     <><Pin className="mr-2 h-3.5 w-3.5" /> Favourite</>
                                                                                )}
                                                                           </DropdownMenuItem>
                                                                           <DropdownMenuSeparator />
                                                                           <DropdownMenuItem onClick={() => setNoteToDelete(item)} className="text-destructive focus:text-destructive">
                                                                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                                                Delete
                                                                           </DropdownMenuItem>
                                                                      </DropdownMenuContent>
                                                                 </DropdownMenu>
                                                            </div>
                                                       </div>
                                                  );
                                             })}
                                        </div>
                                   </div>
                              ))}
                         </div>
                    </ScrollArea>

                    {/* Bottom settings */}
                    <button
                         type="button"
                         onClick={openSettings}
                         className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-[background-color,transform] duration-100 hover:bg-muted active:scale-[0.96]"
                    >
                         <span className="text-muted-foreground">
                              <Settings className="h-[13px] w-[13px]" />
                         </span>
                         <span className="min-w-0 flex-1 truncate text-[13px] text-foreground/80 font-medium">
                              Settings
                         </span>
                    </button>
               </div>

               {/* Search Modal */}
               <AnimatePresence>
                    {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
               </AnimatePresence>

               {/* Rename Dialog */}
               <Dialog open={!!noteToRename} onOpenChange={(open) => !open && setNoteToRename(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                         <DialogHeader>
                              <DialogTitle>Rename Note</DialogTitle>
                              <DialogDescription>
                                   Enter a new name for your note.
                              </DialogDescription>
                         </DialogHeader>
                         <div className="py-4">
                              <Input
                                   id="name"
                                   value={renameValue}
                                   onChange={(e) => setRenameValue(e.target.value)}
                                   onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleConfirmRename();
                                   }}
                                   autoFocus
                              />
                         </div>
                         <DialogFooter>
                              <Button variant="outline" onClick={() => setNoteToRename(null)}>Cancel</Button>
                              <Button onClick={handleConfirmRename}>Save changes</Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>

               {/* Delete Confirmation Dialog */}
               <Dialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                         <DialogHeader>
                              <DialogTitle>Delete Note</DialogTitle>
                              <DialogDescription>
                                   Are you sure you want to delete this note? This action cannot be undone.
                              </DialogDescription>
                         </DialogHeader>
                         <DialogFooter className="mt-4">
                              <Button variant="outline" onClick={() => setNoteToDelete(null)}>Cancel</Button>
                              <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>
          </>
     );
}
