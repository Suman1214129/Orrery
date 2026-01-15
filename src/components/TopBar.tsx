'use client';

// ==========================================================================
// TAB BAR COMPONENT - Standard Compact
// ==========================================================================
import { useCallback } from 'react';
import {
     Sparkles,
     Network,
     FileText,
     X,
     Plus,
     PanelLeft,
     Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
     Tooltip,
     TooltipContent,
     TooltipProvider,
     TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUIStore } from '@/stores/uiStore';
import { useNotesStore } from '@/stores/notesStore';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';

interface TopBarProps {
     showMobileMenu?: boolean;
}

export function TopBar({ showMobileMenu = false }: TopBarProps) {
     const {
          sidebarOpen,
          aiPanelOpen,
          toggleAIPanel,
          toggleSidebar,
          currentView,
          setView,
     } = useUIStore();

     const {
          notes,
          activeNoteIds,
          currentNoteId,
          openNote,
          closeNote,
          createNote
     } = useNotesStore();

     // Get active notes
     const activeTabs = activeNoteIds
          .map(id => notes.get(id))
          .filter((n): n is Note => n !== undefined);

     // Handle new note
     const handleNewNote = async () => {
          await createNote();
     };

     // Handle tab close
     const handleCloseTab = useCallback((e: React.MouseEvent, noteId: string) => {
          e.stopPropagation();
          closeNote(noteId);
     }, [closeNote]);

     const viewOptions = [
          { id: 'editor', icon: FileText, label: 'Notes' },
          { id: 'graph', icon: Brain, label: 'AI Graph' },
     ] as const;

     return (
          <header className="flex h-9 items-center bg-background border-b border-border/30">
               {/* Sidebar Toggle (show when sidebar is closed) */}
               {!sidebarOpen && (
                    <TooltipProvider delayDuration={300}>
                         <Tooltip>
                              <TooltipTrigger asChild>
                                   <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-none border-r border-border/30"
                                        onClick={toggleSidebar}
                                   >
                                        <PanelLeft className="h-4 w-4" />
                                   </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                   <p>Show Sidebar (⌘\)</p>
                              </TooltipContent>
                         </Tooltip>
                    </TooltipProvider>
               )}

               {/* Tabs Area */}
               <div className="hidden md:flex flex-1 items-center h-full overflow-x-auto scrollbar-hide">
                    {/* Open Note Tabs */}
                    <div className="flex h-full">
                         {activeTabs.map((note) => (
                              <div
                                   key={note.id}
                                   onClick={() => openNote(note.id)}
                                   className={cn(
                                        'group flex items-center gap-2 h-full px-3 cursor-pointer transition-all text-sm',
                                        note.id === currentNoteId
                                             ? 'bg-background text-foreground border-t-2 border-t-primary'
                                             : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                   )}
                                   style={{ minWidth: 100, maxWidth: 160 }}
                              >
                                   <FileText className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
                                   <span className="flex-1 truncate text-[13px]">
                                        {note.title || 'Untitled'}
                                   </span>
                                   <button
                                        onClick={(e) => handleCloseTab(e, note.id)}
                                        className={cn(
                                             'p-0.5 rounded hover:bg-foreground/10 transition-opacity',
                                             note.id === currentNoteId
                                                  ? 'opacity-50 hover:opacity-100'
                                                  : 'opacity-0 group-hover:opacity-50 hover:!opacity-100'
                                        )}
                                   >
                                        <X className="h-3.5 w-3.5" />
                                   </button>
                              </div>
                         ))}

                         {/* New Tab Button */}
                         <TooltipProvider delayDuration={300}>
                              <Tooltip>
                                   <TooltipTrigger asChild>
                                        <button
                                             onClick={handleNewNote}
                                             className="flex items-center justify-center h-full px-2.5 hover:bg-muted/30 transition-colors text-muted-foreground hover:text-foreground"
                                        >
                                             <Plus className="h-4 w-4" />
                                        </button>
                                   </TooltipTrigger>
                                   <TooltipContent side="bottom">
                                        <p>New Note (⌘N)</p>
                                   </TooltipContent>
                              </Tooltip>
                         </TooltipProvider>
                    </div>
               </div>

               {/* Right Controls */}
               <div className="flex items-center gap-1 px-2 h-full">
                    {/* View Switchers - Bigger */}
                    <TooltipProvider delayDuration={300}>
                         <div className="flex items-center gap-0.5 bg-muted/30 rounded-md p-0.5">
                              {viewOptions.map((option) => (
                                   <Tooltip key={option.id}>
                                        <TooltipTrigger asChild>
                                             <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className={cn(
                                                       'h-7 w-7',
                                                       currentView === option.id
                                                            ? 'bg-background text-foreground shadow-sm'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                  )}
                                                  onClick={() => setView(option.id)}
                                             >
                                                  <option.icon className="h-4 w-4" />
                                             </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                             <p>{option.label}</p>
                                        </TooltipContent>
                                   </Tooltip>
                              ))}
                         </div>
                    </TooltipProvider>

                    {/* Divider */}
                    <div className="w-px h-5 bg-border/40 mx-1" />

                    {/* AI Panel Toggle - Highlighted */}
                    <TooltipProvider delayDuration={300}>
                         <Tooltip>
                              <TooltipTrigger asChild>
                                   <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                             'h-7 w-7 transition-all',
                                             aiPanelOpen
                                                  ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                                                  : 'text-violet-400/70 hover:text-violet-400 hover:bg-violet-500/10'
                                        )}
                                        onClick={toggleAIPanel}
                                   >
                                        <Sparkles className="h-4 w-4" />
                                   </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                   <p>AI Assistant (⌘/)</p>
                              </TooltipContent>
                         </Tooltip>
                    </TooltipProvider>
               </div>
          </header>
     );
}
