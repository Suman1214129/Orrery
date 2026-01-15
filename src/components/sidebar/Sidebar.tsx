'use client';

// ==========================================================================
// SIDEBAR - Standard Compact File Tree
// ==========================================================================
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
     Search,
     Plus,
     FolderPlus,
     Settings,
     FileText,
     Folder,
     FolderOpen,
     Star,
     ChevronRight,
     ChevronDown,
     MoreHorizontal,
     Trash2,
     PanelLeftClose,
     X
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
function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
     const { notes, openNote } = useNotesStore();
     const [query, setQuery] = useState('');

     const results = useMemo(() => {
          if (!query.trim()) return [];
          const q = query.toLowerCase();
          return Array.from(notes.values())
               .filter(note =>
                    note.title.toLowerCase().includes(q) ||
                    note.content.toLowerCase().includes(q) ||
                    note.tags.some(tag => tag.toLowerCase().includes(q))
               )
               .slice(0, 10);
     }, [notes, query]);

     const handleSelect = (noteId: string) => {
          openNote(noteId);
          onClose();
          setQuery('');
     };

     if (!isOpen) return null;

     return (
          <>
               <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
               />
               <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="fixed left-1/2 top-[20%] z-50 w-full max-w-md -translate-x-1/2"
               >
                    <div className="rounded-lg border border-border/40 bg-popover shadow-2xl overflow-hidden">
                         <div className="flex items-center border-b border-border/30 px-4">
                              <Search className="h-4 w-4 text-muted-foreground mr-3" />
                              <input
                                   type="text"
                                   placeholder="Search notes..."
                                   value={query}
                                   onChange={(e) => setQuery(e.target.value)}
                                   className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                                   autoFocus
                              />
                              <button onClick={onClose} className="p-1 hover:bg-muted rounded text-muted-foreground">
                                   <X className="h-4 w-4" />
                              </button>
                         </div>
                         <div className="max-h-[280px] overflow-y-auto p-2">
                              {query && results.length === 0 && (
                                   <div className="py-6 text-center text-sm text-muted-foreground">
                                        No results
                                   </div>
                              )}
                              {results.map(note => (
                                   <button
                                        key={note.id}
                                        onClick={() => handleSelect(note.id)}
                                        className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                                   >
                                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 overflow-hidden">
                                             <p className="truncate text-sm font-medium">{note.title}</p>
                                        </div>
                                   </button>
                              ))}
                              {!query && (
                                   <div className="py-6 text-center text-sm text-muted-foreground/60">
                                        Type to search...
                                   </div>
                              )}
                         </div>
                    </div>
               </motion.div>
          </>
     );
}

// ==========================================================================
// FILE ITEM (with drag support)
// ==========================================================================
function FileItem({
     note,
     isActive,
     isFavorite,
     onOpen,
     onDelete,
     onToggleFavorite
}: {
     note: Note;
     isActive: boolean;
     isFavorite: boolean;
     onOpen: () => void;
     onDelete: () => void;
     onToggleFavorite: () => void;
}) {
     const handleDragStart = (e: React.DragEvent) => {
          e.dataTransfer.setData('noteId', note.id);
          e.dataTransfer.effectAllowed = 'move';
     };

     return (
          <div
               draggable
               onDragStart={handleDragStart}
               className={cn(
                    'group flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-all text-[13px]',
                    isActive
                         ? 'bg-primary/10 text-primary font-medium'
                         : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
               )}
               onClick={onOpen}
          >
               <FileText className="h-4 w-4 opacity-50 flex-shrink-0" />
               <span className="flex-1 truncate">{note.title || 'Untitled'}</span>

               {isFavorite && (
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />
               )}

               <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <button
                              onClick={(e) => e.stopPropagation()}
                              className="opacity-0 group-hover:opacity-50 hover:!opacity-100 p-0.5 rounded"
                         >
                              <MoreHorizontal className="h-4 w-4" />
                         </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                         <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}>
                              <Star className={cn("mr-2 h-4 w-4", isFavorite && "fill-amber-400 text-amber-400")} />
                              {isFavorite ? 'Unfavorite' : 'Favorite'}
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); onDelete(); }}
                              className="text-destructive"
                         >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                         </DropdownMenuItem>
                    </DropdownMenuContent>
               </DropdownMenu>
          </div>
     );
}

// FOLDER ITEM (with drop support)
// ==========================================================================
function FolderItem({
     name,
     isExpanded,
     onToggle,
     onDrop,
     children
}: {
     name: string;
     isExpanded: boolean;
     onToggle: () => void;
     onDrop?: (noteId: string) => void;
     children: React.ReactNode;
}) {
     const [isDragOver, setIsDragOver] = useState(false);

     const handleDragOver = (e: React.DragEvent) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          setIsDragOver(true);
     };

     const handleDragLeave = () => {
          setIsDragOver(false);
     };

     const handleDrop = (e: React.DragEvent) => {
          e.preventDefault();
          setIsDragOver(false);
          const noteId = e.dataTransfer.getData('noteId');
          if (noteId && onDrop) {
               onDrop(noteId);
          }
     };

     return (
          <div
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
          >
               <button
                    onClick={onToggle}
                    className={cn(
                         'flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-md transition-colors uppercase tracking-wider font-medium',
                         isDragOver && 'bg-primary/10 ring-1 ring-primary/30'
                    )}
               >
                    {isExpanded ? (
                         <ChevronDown className="h-3 w-3 opacity-60" />
                    ) : (
                         <ChevronRight className="h-3 w-3 opacity-60" />
                    )}
                    {isExpanded ? (
                         <FolderOpen className="h-4 w-4 opacity-60" />
                    ) : (
                         <Folder className="h-4 w-4 opacity-60" />
                    )}
                    <span className="flex-1 text-left">{name}</span>
               </button>

               <AnimatePresence>
                    {isExpanded && (
                         <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="ml-3 overflow-hidden"
                         >
                              {children}
                         </motion.div>
                    )}
               </AnimatePresence>
          </div>
     );
}

// ==========================================================================
// MAIN SIDEBAR
// ==========================================================================
export function Sidebar() {
     const { openSettings, toggleSidebar } = useUIStore();
     const {
          notes,
          currentNoteId,
          openNote,
          createNote,
          deleteNote,
          pinNote,
          unpinNote
     } = useNotesStore();

     const [searchOpen, setSearchOpen] = useState(false);
     const [folderDialogOpen, setFolderDialogOpen] = useState(false);
     const [newFolderName, setNewFolderName] = useState('');
     const [userFolders, setUserFolders] = useState<string[]>([]);
     const [noteToFolder, setNoteToFolder] = useState<Record<string, string>>({});
     const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['favorites', 'notes']));

     // Get favorites (pinned notes)
     const favorites = useMemo(() => {
          return Array.from(notes.values()).filter(n => n.isPinned);
     }, [notes]);

     // Get notes in a specific folder
     const getNotesInFolder = (folderName: string) => {
          return Array.from(notes.values()).filter(n => noteToFolder[n.id] === folderName);
     };

     // Get notes not in any user folder
     const allNotes = useMemo(() => {
          return Array.from(notes.values())
               .filter(n => !noteToFolder[n.id])
               .sort((a, b) => new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime());
     }, [notes, noteToFolder]);

     const toggleFolder = (folderId: string) => {
          setExpandedFolders(prev => {
               const next = new Set(prev);
               if (next.has(folderId)) {
                    next.delete(folderId);
               } else {
                    next.add(folderId);
               }
               return next;
          });
     };

     const handleNewNote = async () => {
          await createNote();
     };

     const handleDelete = async (noteId: string) => {
          if (confirm('Delete this note?')) {
               await deleteNote(noteId);
          }
     };

     const handleToggleFavorite = (note: Note) => {
          if (note.isPinned) {
               unpinNote(note.id);
          } else {
               pinNote(note.id);
          }
     };

     const handleCreateFolder = () => {
          if (newFolderName.trim()) {
               setUserFolders(prev => [...prev, newFolderName.trim()]);
               setExpandedFolders(prev => new Set([...prev, newFolderName.trim()]));
               setNewFolderName('');
               setFolderDialogOpen(false);
          }
     };

     const handleMoveToFolder = (noteId: string, folderName: string) => {
          setNoteToFolder(prev => ({ ...prev, [noteId]: folderName }));
     };

     return (
          <>
               <div className="flex h-full flex-col bg-sidebar border-r border-border/30">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-3 border-b border-border/20">
                         <div className="flex items-center gap-2">
                              <span className="text-base font-semibold tracking-tight">Orrery</span>
                              <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">Beta</span>
                         </div>
                         <button
                              onClick={toggleSidebar}
                              className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                              title="Collapse Sidebar"
                         >
                              <PanelLeftClose className="h-4 w-4" />
                         </button>
                    </div>

                    {/* Search */}
                    <div className="px-3 py-2">
                         <button
                              onClick={() => setSearchOpen(true)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md border border-border/40 hover:border-border/60 hover:bg-muted/30 transition-all text-muted-foreground"
                         >
                              <Search className="h-4 w-4" />
                              <span className="flex-1 text-left">Search...</span>
                              <kbd className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded">⌘K</kbd>
                         </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 px-3 pb-2">
                         <button
                              onClick={handleNewNote}
                              className="flex items-center gap-1.5 flex-1 px-3 py-1.5 text-xs rounded-md border border-border/40 hover:border-border/60 hover:bg-muted/30 transition-all"
                         >
                              <Plus className="h-3.5 w-3.5 opacity-60" />
                              <span>New File</span>
                         </button>
                         <button
                              onClick={() => setFolderDialogOpen(true)}
                              className="flex items-center gap-1.5 flex-1 px-3 py-1.5 text-xs rounded-md border border-border/40 hover:border-border/60 hover:bg-muted/30 transition-all"
                         >
                              <FolderPlus className="h-3.5 w-3.5 opacity-60" />
                              <span>Folder</span>
                         </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border/20 my-1" />

                    {/* File Tree */}
                    <ScrollArea className="flex-1 px-2">
                         <div className="py-1 space-y-1">
                              {favorites.length > 0 && (
                                   <FolderItem
                                        name="Favorites"
                                        isExpanded={expandedFolders.has('favorites')}
                                        onToggle={() => toggleFolder('favorites')}
                                   >
                                        {favorites.map(note => (
                                             <FileItem
                                                  key={note.id}
                                                  note={note}
                                                  isActive={note.id === currentNoteId}
                                                  isFavorite={true}
                                                  onOpen={() => openNote(note.id)}
                                                  onDelete={() => handleDelete(note.id)}
                                                  onToggleFavorite={() => handleToggleFavorite(note)}
                                             />
                                        ))}
                                   </FolderItem>
                              )}

                              {/* User-created folders */}
                              {userFolders.map(folderName => {
                                   const folderNotes = getNotesInFolder(folderName);
                                   return (
                                        <FolderItem
                                             key={folderName}
                                             name={folderName}
                                             isExpanded={expandedFolders.has(folderName)}
                                             onToggle={() => toggleFolder(folderName)}
                                             onDrop={(noteId) => handleMoveToFolder(noteId, folderName)}
                                        >
                                             {folderNotes.length === 0 ? (
                                                  <div className="px-3 py-2 text-xs text-muted-foreground/50 italic">
                                                       Drop notes here
                                                  </div>
                                             ) : (
                                                  folderNotes.map(note => (
                                                       <FileItem
                                                            key={note.id}
                                                            note={note}
                                                            isActive={note.id === currentNoteId}
                                                            isFavorite={note.isPinned}
                                                            onOpen={() => openNote(note.id)}
                                                            onDelete={() => handleDelete(note.id)}
                                                            onToggleFavorite={() => handleToggleFavorite(note)}
                                                       />
                                                  ))
                                             )}
                                        </FolderItem>
                                   );
                              })}

                              <FolderItem
                                   name="Notes"
                                   isExpanded={expandedFolders.has('notes')}
                                   onToggle={() => toggleFolder('notes')}
                              >
                                   {allNotes.map(note => (
                                        <FileItem
                                             key={note.id}
                                             note={note}
                                             isActive={note.id === currentNoteId}
                                             isFavorite={note.isPinned}
                                             onOpen={() => openNote(note.id)}
                                             onDelete={() => handleDelete(note.id)}
                                             onToggleFavorite={() => handleToggleFavorite(note)}
                                        />
                                   ))}

                                   {allNotes.length === 0 && (
                                        <div className="px-3 py-4 text-sm text-muted-foreground/50 text-center">
                                             No notes yet
                                        </div>
                                   )}
                              </FolderItem>
                         </div>
                    </ScrollArea>

                    {/* Divider */}
                    <div className="border-t border-border/20" />

                    {/* Bottom */}
                    <div className="p-2">
                         <button
                              onClick={openSettings}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-all rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                         >
                              <Settings className="h-4 w-4 opacity-60" />
                              <span>Settings</span>
                         </button>
                    </div>
               </div>

               <AnimatePresence>
                    {searchOpen && (
                         <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
                    )}
               </AnimatePresence>

               {/* Folder Creation Dialog */}
               <AnimatePresence>
                    {folderDialogOpen && (
                         <>
                              <motion.div
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   exit={{ opacity: 0 }}
                                   className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                                   onClick={() => setFolderDialogOpen(false)}
                              />
                              <motion.div
                                   initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                   animate={{ opacity: 1, scale: 1, y: 0 }}
                                   exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                   className="fixed left-1/2 top-[30%] z-50 w-full max-w-sm -translate-x-1/2"
                              >
                                   <div className="rounded-lg border border-border/40 bg-popover shadow-2xl p-4">
                                        <h3 className="text-sm font-medium mb-3">Create New Folder</h3>
                                        <input
                                             type="text"
                                             placeholder="Folder name..."
                                             value={newFolderName}
                                             onChange={(e) => setNewFolderName(e.target.value)}
                                             onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                             className="w-full h-10 px-3 text-sm bg-muted/30 border border-border/40 rounded-md outline-none focus:border-primary/50"
                                             autoFocus
                                        />
                                        <div className="flex gap-2 mt-3">
                                             <button
                                                  onClick={() => setFolderDialogOpen(false)}
                                                  className="flex-1 px-3 py-2 text-sm rounded-md border border-border/40 hover:bg-muted/30"
                                             >
                                                  Cancel
                                             </button>
                                             <button
                                                  onClick={handleCreateFolder}
                                                  className="flex-1 px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                                             >
                                                  Create
                                             </button>
                                        </div>
                                   </div>
                              </motion.div>
                         </>
                    )}
               </AnimatePresence>
          </>
     );
}
