'use client';

// ==========================================================================
// COMMAND PALETTE (CMD+K)
// ==========================================================================
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Command } from 'cmdk';
import {
     FileText,
     Plus,
     Settings,
     Network,
     Moon,
     Sun,
     Search,
     Clock,
     Sparkles,
     BookOpen
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useNotesStore } from '@/stores/notesStore';
import { commandPalette, overlayFade } from '@/lib/animations';
import type { Note } from '@/types';

// ==========================================================================
// COMMAND PALETTE COMPONENT
// ==========================================================================
export function CommandPalette() {
     const { closeCommandPalette, setView, setTheme, settings, openSettings } = useUIStore();
     const { notes, createNote, openNote } = useNotesStore();
     const [inputValue, setInputValue] = useState('');

     // Handle escape key
     useEffect(() => {
          function handleKeyDown(e: KeyboardEvent) {
               if (e.key === 'Escape') {
                    closeCommandPalette();
               }
          }

          window.addEventListener('keydown', handleKeyDown);
          return () => window.removeEventListener('keydown', handleKeyDown);
     }, [closeCommandPalette]);

     // Get recent notes
     const recentNotes = useMemo(() => {
          return Array.from(notes.values())
               .sort((a, b) =>
                    new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
               )
               .slice(0, 5);
     }, [notes]);

     // Search results (filter notes by input)
     const filteredNotes = useMemo(() => {
          if (!inputValue) return [];
          const query = inputValue.toLowerCase();
          return Array.from(notes.values())
               .filter(note =>
                    note.title.toLowerCase().includes(query) ||
                    note.content.toLowerCase().includes(query) ||
                    note.tags.some(tag => tag.toLowerCase().includes(query))
               )
               .slice(0, 10);
     }, [notes, inputValue]);

     // Actions
     const handleCreateNote = async () => {
          closeCommandPalette();
          await createNote(inputValue || 'Untitled');
     };

     const handleOpenNote = (noteId: string) => {
          closeCommandPalette();
          openNote(noteId);
     };

     const handleSetView = (view: 'editor' | 'graph') => {
          closeCommandPalette();
          setView(view);
     };

     const handleSetTheme = (theme: 'light' | 'dark' | 'sepia') => {
          closeCommandPalette();
          setTheme(theme);
     };

     return (
          <>
               {/* Backdrop */}
               <motion.div
                    variants={overlayFade}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    onClick={closeCommandPalette}
               />

               {/* Command Palette */}
               <motion.div
                    variants={commandPalette}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
               >
                    <Command
                         className="rounded-xl border border-border bg-popover shadow-2xl overflow-hidden"
                         shouldFilter={false}
                    >
                         {/* Search Input */}
                         <div className="flex items-center border-b border-border px-4">
                              <Search className="h-4 w-4 text-muted-foreground mr-2" />
                              <Command.Input
                                   placeholder="Search or type a command..."
                                   className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                                   value={inputValue}
                                   onValueChange={setInputValue}
                                   autoFocus
                              />
                              <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 text-xs font-medium text-muted-foreground">
                                   ESC
                              </kbd>
                         </div>

                         {/* Results */}
                         <Command.List className="max-h-[400px] overflow-y-auto p-2">
                              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                                   No results found.
                              </Command.Empty>

                              {/* Search Results */}
                              {filteredNotes.length > 0 && (
                                   <Command.Group heading="Search Results">
                                        {filteredNotes.map(note => (
                                             <Command.Item
                                                  key={note.id}
                                                  value={note.title}
                                                  onSelect={() => handleOpenNote(note.id)}
                                                  className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                             >
                                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                                  <div className="flex-1 overflow-hidden">
                                                       <p className="truncate font-medium">{note.title}</p>
                                                       {note.excerpt && (
                                                            <p className="truncate text-sm text-muted-foreground">
                                                                 {note.excerpt}
                                                            </p>
                                                       )}
                                                  </div>
                                                  {note.tags.length > 0 && (
                                                       <div className="flex gap-1">
                                                            {note.tags.slice(0, 2).map(tag => (
                                                                 <span key={tag} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                                      #{tag}
                                                                 </span>
                                                            ))}
                                                       </div>
                                                  )}
                                             </Command.Item>
                                        ))}
                                   </Command.Group>
                              )}

                              {/* Recent Notes */}
                              {!inputValue && recentNotes.length > 0 && (
                                   <Command.Group heading="Recent Notes">
                                        {recentNotes.map(note => (
                                             <Command.Item
                                                  key={note.id}
                                                  value={`recent-${note.title}`}
                                                  onSelect={() => handleOpenNote(note.id)}
                                                  className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                             >
                                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                                  <span className="flex-1 truncate">{note.title}</span>
                                             </Command.Item>
                                        ))}
                                   </Command.Group>
                              )}

                              {/* Quick Actions */}
                              <Command.Group heading="Quick Actions">
                                   <Command.Item
                                        value="new-note"
                                        onSelect={handleCreateNote}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                   >
                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                        <span className="flex-1">
                                             {inputValue ? `Create note "${inputValue}"` : 'Create New Note'}
                                        </span>
                                        <kbd className="text-xs text-muted-foreground">⌘N</kbd>
                                   </Command.Item>

                                   <Command.Item
                                        value="graph-view"
                                        onSelect={() => handleSetView('graph')}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                   >
                                        <Network className="h-4 w-4 text-muted-foreground" />
                                        <span className="flex-1">Open Graph View</span>
                                        <kbd className="text-xs text-muted-foreground">⌘G</kbd>
                                   </Command.Item>

                                   <Command.Item
                                        value="ai-panel"
                                        onSelect={() => {
                                             closeCommandPalette();
                                             useUIStore.getState().toggleAIPanel();
                                        }}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                   >
                                        <Sparkles className="h-4 w-4 text-ai" />
                                        <span className="flex-1">Toggle AI Panel</span>
                                        <kbd className="text-xs text-muted-foreground">⌘/</kbd>
                                   </Command.Item>
                              </Command.Group>

                              {/* Theme Options */}
                              <Command.Group heading="Appearance">
                                   <Command.Item
                                        value="theme-light"
                                        onSelect={() => handleSetTheme('light')}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                   >
                                        <Sun className="h-4 w-4 text-muted-foreground" />
                                        <span className="flex-1">Light Theme</span>
                                        {settings.theme === 'light' && (
                                             <span className="text-xs text-primary">Active</span>
                                        )}
                                   </Command.Item>

                                   <Command.Item
                                        value="theme-dark"
                                        onSelect={() => handleSetTheme('dark')}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                   >
                                        <Moon className="h-4 w-4 text-muted-foreground" />
                                        <span className="flex-1">Dark Theme</span>
                                        {settings.theme === 'dark' && (
                                             <span className="text-xs text-primary">Active</span>
                                        )}
                                   </Command.Item>

                                   <Command.Item
                                        value="theme-sepia"
                                        onSelect={() => handleSetTheme('sepia')}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                   >
                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        <span className="flex-1">Sepia Theme (Writer Mode)</span>
                                        {settings.theme === 'sepia' && (
                                             <span className="text-xs text-primary">Active</span>
                                        )}
                                   </Command.Item>
                              </Command.Group>

                              {/* Settings */}
                              <Command.Group heading="Settings">
                                   <Command.Item
                                        value="settings"
                                        onSelect={() => {
                                             closeCommandPalette();
                                             openSettings();
                                        }}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                   >
                                        <Settings className="h-4 w-4 text-muted-foreground" />
                                        <span className="flex-1">Open Settings</span>
                                   </Command.Item>
                              </Command.Group>
                         </Command.List>
                    </Command>
               </motion.div>
          </>
     );
}
