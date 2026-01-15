// ==========================================================================
// NOTES STORE - Zustand State Management
// ==========================================================================
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Note, NoteFilters, SortOptions } from '@/types';
import {
     getAllNotes,
     createNote as dbCreateNote,
     updateNote as dbUpdateNote,
     deleteNote as dbDeleteNote,
     getNoteById,
     searchNotes as dbSearchNotes,
     getRecentNotes
} from '@/lib/db';

// ==========================================================================
// STORE INTERFACE
// ==========================================================================
interface NotesState {
     // Data
     notes: Map<string, Note>;
     isLoading: boolean;
     error: string | null;

     // Active Notes (Tab replacement feature)
     activeNoteIds: string[]; // IDs of open notes
     currentNoteId: string | null;
     pinnedNoteIds: string[];

     // Filters & Search
     filters: NoteFilters;
     sortOptions: SortOptions;
     searchQuery: string;
     searchResults: Note[];

     // Actions
     loadNotes: () => Promise<void>;
     createNote: (title?: string, content?: string) => Promise<Note | null>;
     updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
     deleteNote: (id: string) => Promise<void>;

     // Active Notes Management
     setCurrentNote: (id: string | null) => void;
     openNote: (id: string) => void;
     closeNote: (id: string) => void;
     pinNote: (id: string) => void;
     unpinNote: (id: string) => void;
     reorderActiveNotes: (fromIndex: number, toIndex: number) => void;

     // Navigation
     goToNextNote: () => void;
     goToPreviousNote: () => void;
     goToNoteByIndex: (index: number) => void;

     // Search & Filter
     setSearchQuery: (query: string) => Promise<void>;
     setFilters: (filters: Partial<NoteFilters>) => void;
     setSortOptions: (options: SortOptions) => void;
     clearFilters: () => void;

     // Utilities
     getNoteById: (id: string) => Note | undefined;
     getFilteredNotes: () => Note[];
}

// ==========================================================================
// STORE IMPLEMENTATION
// ==========================================================================
export const useNotesStore = create<NotesState>()(
     devtools(
          persist(
               (set, get) => ({
                    // Initial State
                    notes: new Map(),
                    isLoading: false,
                    error: null,
                    activeNoteIds: [],
                    currentNoteId: null,
                    pinnedNoteIds: [],
                    filters: {},
                    sortOptions: { field: 'updatedAt', direction: 'desc' },
                    searchQuery: '',
                    searchResults: [],

                    // ==========================================================================
                    // DATA OPERATIONS
                    // ==========================================================================
                    loadNotes: async () => {
                         set({ isLoading: true, error: null });
                         try {
                              const notes = await getAllNotes();
                              const notesMap = new Map(notes.map(n => [n.id, n]));
                              set({ notes: notesMap, isLoading: false });
                         } catch (error) {
                              set({ error: (error as Error).message, isLoading: false });
                         }
                    },

                    createNote: async (title = 'Untitled', content = '') => {
                         try {
                              const note = await dbCreateNote(title, content);
                              set(state => {
                                   const newNotes = new Map(state.notes);
                                   newNotes.set(note.id, note);
                                   return {
                                        notes: newNotes,
                                        activeNoteIds: [note.id, ...state.activeNoteIds],
                                        currentNoteId: note.id
                                   };
                              });
                              return note;
                         } catch (error) {
                              set({ error: (error as Error).message });
                              return null;
                         }
                    },

                    updateNote: async (id, updates) => {
                         const existingNote = get().notes.get(id);
                         if (!existingNote) return;

                         // Optimistic update
                         const optimisticNote = {
                              ...existingNote,
                              ...updates,
                              metadata: {
                                   ...existingNote.metadata,
                                   updatedAt: new Date()
                              }
                         };

                         set(state => {
                              const newNotes = new Map(state.notes);
                              newNotes.set(id, optimisticNote);
                              return { notes: newNotes };
                         });

                         // Persist to DB
                         try {
                              const updated = await dbUpdateNote(id, updates);
                              if (updated) {
                                   set(state => {
                                        const newNotes = new Map(state.notes);
                                        newNotes.set(id, updated);
                                        return { notes: newNotes };
                                   });
                              }
                         } catch (error) {
                              // Revert on error
                              set(state => {
                                   const newNotes = new Map(state.notes);
                                   newNotes.set(id, existingNote);
                                   return { notes: newNotes, error: (error as Error).message };
                              });
                         }
                    },

                    deleteNote: async (id) => {
                         const existingNote = get().notes.get(id);
                         if (!existingNote) return;

                         // Optimistic delete
                         set(state => {
                              const newNotes = new Map(state.notes);
                              newNotes.delete(id);
                              const newActiveNotes = state.activeNoteIds.filter(nid => nid !== id);
                              const newCurrentNote = state.currentNoteId === id
                                   ? newActiveNotes[0] ?? null
                                   : state.currentNoteId;

                              return {
                                   notes: newNotes,
                                   activeNoteIds: newActiveNotes,
                                   currentNoteId: newCurrentNote,
                                   pinnedNoteIds: state.pinnedNoteIds.filter(nid => nid !== id)
                              };
                         });

                         try {
                              await dbDeleteNote(id);
                         } catch (error) {
                              // Revert on error
                              set(state => {
                                   const newNotes = new Map(state.notes);
                                   newNotes.set(id, existingNote);
                                   return { notes: newNotes, error: (error as Error).message };
                              });
                         }
                    },

                    // ==========================================================================
                    // ACTIVE NOTES MANAGEMENT
                    // ==========================================================================
                    setCurrentNote: (id) => {
                         if (id && !get().activeNoteIds.includes(id)) {
                              set(state => ({
                                   activeNoteIds: [id, ...state.activeNoteIds].slice(0, 10),
                                   currentNoteId: id
                              }));
                         } else {
                              set({ currentNoteId: id });
                         }
                    },

                    openNote: (id) => {
                         const { activeNoteIds } = get();
                         if (!activeNoteIds.includes(id)) {
                              set(state => ({
                                   activeNoteIds: [id, ...state.activeNoteIds].slice(0, 10),
                                   currentNoteId: id
                              }));
                         } else {
                              set({ currentNoteId: id });
                         }
                    },

                    closeNote: (id) => {
                         set(state => {
                              const newActiveNotes = state.activeNoteIds.filter(nid => nid !== id);
                              const newCurrentNote = state.currentNoteId === id
                                   ? newActiveNotes[0] ?? null
                                   : state.currentNoteId;

                              return {
                                   activeNoteIds: newActiveNotes,
                                   currentNoteId: newCurrentNote
                              };
                         });
                    },

                    pinNote: (id) => {
                         set(state => ({
                              pinnedNoteIds: [...new Set([...state.pinnedNoteIds, id])]
                         }));
                         get().updateNote(id, { isPinned: true });
                    },

                    unpinNote: (id) => {
                         set(state => ({
                              pinnedNoteIds: state.pinnedNoteIds.filter(nid => nid !== id)
                         }));
                         get().updateNote(id, { isPinned: false });
                    },

                    reorderActiveNotes: (fromIndex, toIndex) => {
                         set(state => {
                              const newActiveNotes = [...state.activeNoteIds];
                              const [removed] = newActiveNotes.splice(fromIndex, 1);
                              newActiveNotes.splice(toIndex, 0, removed);
                              return { activeNoteIds: newActiveNotes };
                         });
                    },

                    // ==========================================================================
                    // NAVIGATION
                    // ==========================================================================
                    goToNextNote: () => {
                         const { activeNoteIds, currentNoteId } = get();
                         if (activeNoteIds.length === 0) return;

                         const currentIndex = currentNoteId
                              ? activeNoteIds.indexOf(currentNoteId)
                              : -1;
                         const nextIndex = (currentIndex + 1) % activeNoteIds.length;
                         set({ currentNoteId: activeNoteIds[nextIndex] });
                    },

                    goToPreviousNote: () => {
                         const { activeNoteIds, currentNoteId } = get();
                         if (activeNoteIds.length === 0) return;

                         const currentIndex = currentNoteId
                              ? activeNoteIds.indexOf(currentNoteId)
                              : 0;
                         const prevIndex = currentIndex === 0
                              ? activeNoteIds.length - 1
                              : currentIndex - 1;
                         set({ currentNoteId: activeNoteIds[prevIndex] });
                    },

                    goToNoteByIndex: (index) => {
                         const { activeNoteIds } = get();
                         if (index >= 0 && index < activeNoteIds.length) {
                              set({ currentNoteId: activeNoteIds[index] });
                         }
                    },

                    // ==========================================================================
                    // SEARCH & FILTER
                    // ==========================================================================
                    setSearchQuery: async (query) => {
                         set({ searchQuery: query });
                         if (query.trim()) {
                              const results = await dbSearchNotes(query);
                              set({ searchResults: results });
                         } else {
                              set({ searchResults: [] });
                         }
                    },

                    setFilters: (filters) => {
                         set(state => ({
                              filters: { ...state.filters, ...filters }
                         }));
                    },

                    setSortOptions: (options) => {
                         set({ sortOptions: options });
                    },

                    clearFilters: () => {
                         set({ filters: {}, searchQuery: '', searchResults: [] });
                    },

                    // ==========================================================================
                    // UTILITIES
                    // ==========================================================================
                    getNoteById: (id) => {
                         return get().notes.get(id);
                    },

                    getFilteredNotes: () => {
                         const { notes, filters, sortOptions } = get();
                         let filtered = Array.from(notes.values());

                         // Apply filters
                         if (filters.tags?.length) {
                              filtered = filtered.filter(n =>
                                   filters.tags!.some(tag => n.tags.includes(tag))
                              );
                         }

                         if (filters.type) {
                              filtered = filtered.filter(n => n.metadata.type === filters.type);
                         }

                         if (filters.isPinned !== undefined) {
                              filtered = filtered.filter(n => n.isPinned === filters.isPinned);
                         }

                         if (filters.folderId) {
                              filtered = filtered.filter(n => n.folderId === filters.folderId);
                         }

                         if (filters.searchQuery) {
                              const query = filters.searchQuery.toLowerCase();
                              filtered = filtered.filter(n =>
                                   n.title.toLowerCase().includes(query) ||
                                   n.content.toLowerCase().includes(query)
                              );
                         }

                         // Sort
                         filtered.sort((a, b) => {
                              let comparison = 0;
                              switch (sortOptions.field) {
                                   case 'title':
                                        comparison = a.title.localeCompare(b.title);
                                        break;
                                   case 'createdAt':
                                        comparison = new Date(a.metadata.createdAt).getTime() -
                                             new Date(b.metadata.createdAt).getTime();
                                        break;
                                   case 'updatedAt':
                                        comparison = new Date(a.metadata.updatedAt).getTime() -
                                             new Date(b.metadata.updatedAt).getTime();
                                        break;
                                   case 'wordCount':
                                        comparison = a.metadata.wordCount - b.metadata.wordCount;
                                        break;
                              }
                              return sortOptions.direction === 'desc' ? -comparison : comparison;
                         });

                         return filtered;
                    }
               }),
               {
                    name: 'orrery-notes-storage',
                    partialize: (state) => ({
                         activeNoteIds: state.activeNoteIds,
                         currentNoteId: state.currentNoteId,
                         pinnedNoteIds: state.pinnedNoteIds,
                         sortOptions: state.sortOptions
                    })
               }
          )
     )
);
