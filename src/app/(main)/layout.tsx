'use client';

// ==========================================================================
// MAIN APPLICATION LAYOUT - Full Height Sidebar + TopBar Starts After
// ==========================================================================
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { TopBar } from '@/components/TopBar';
import { AIPanel } from '@/components/ai-panel/AIPanel';
import { CommandPalette } from '@/components/CommandPalette';
import { SettingsDialog } from '@/components/SettingsDialog';
import { DiffReviewOverlay } from '@/components/editor/DiffReviewOverlay';
import { useUIStore, initializeTheme } from '@/stores/uiStore';
import { useNotesStore } from '@/stores/notesStore';
import { initializeSampleVault } from '@/lib/db';
import { sidebarSlide, aiPanelSlide } from '@/lib/animations';
import { cn } from '@/lib/utils';

// Mobile breakpoint
const MOBILE_BREAKPOINT = 768;

export default function MainLayout({
     children,
}: {
     children: React.ReactNode;
}) {
     const {
          sidebarOpen,
          aiPanelOpen,
          commandPaletteOpen,
          settings,
          loadSettings,
          toggleSidebar,
          toggleAIPanel,
     } = useUIStore();

     const { loadNotes } = useNotesStore();

     const [isInitialized, setIsInitialized] = useState(false);
     const [isMobile, setIsMobile] = useState(false);

     // Detect mobile
     useEffect(() => {
          const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
          checkMobile();
          window.addEventListener('resize', checkMobile);
          return () => window.removeEventListener('resize', checkMobile);
     }, []);

     // Initialize app on mount
     useEffect(() => {
          async function init() {
               initializeTheme();
               await loadSettings();
               await initializeSampleVault();
               await loadNotes();
               setIsInitialized(true);
          }
          init();
     }, [loadSettings, loadNotes]);

     // Keyboard shortcuts
     useEffect(() => {
          function handleKeyDown(e: KeyboardEvent) {
               if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    useUIStore.getState().openCommandPalette();
               }
               if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
                    e.preventDefault();
                    toggleSidebar();
               }
               if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                    e.preventDefault();
                    toggleAIPanel();
               }
               // Tab cycling - would need to implement in store
               if ((e.metaKey || e.ctrlKey) && e.key === 'Tab') {
                    e.preventDefault();
                    // useNotesStore.getState().cycleActiveNotes(e.shiftKey ? 'prev' : 'next');
               }
               // Quick jump to note by index
               if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '9') {
                    e.preventDefault();
                    // useNotesStore.getState().goToNoteByIndex(index);
               }
          }

          window.addEventListener('keydown', handleKeyDown);
          return () => window.removeEventListener('keydown', handleKeyDown);
     }, [toggleSidebar, toggleAIPanel]);

     // Handle backdrop click - close panels
     const handleBackdropClick = useCallback(() => {
          if (sidebarOpen && isMobile) toggleSidebar();
          if (aiPanelOpen && isMobile) toggleAIPanel();
     }, [sidebarOpen, aiPanelOpen, isMobile, toggleSidebar, toggleAIPanel]);

     if (!isInitialized) {
          return (
               <div className="flex h-screen items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-4">
                         <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                         <p className="text-muted-foreground text-xs">Loading Orrery...</p>
                    </div>
               </div>
          );
     }

     // Mobile drawer animations
     const mobileDrawerVariants = {
          open: {
               x: 0,
               transition: { type: 'spring' as const, stiffness: 400, damping: 35 }
          },
          closed: {
               x: '-100%',
               transition: { type: 'spring' as const, stiffness: 400, damping: 35 }
          }
     };

     const mobileAIPanelVariants = {
          open: {
               x: 0,
               transition: { type: 'spring' as const, stiffness: 400, damping: 35 }
          },
          closed: {
               x: '100%',
               transition: { type: 'spring' as const, stiffness: 400, damping: 35 }
          }
     };

     return (
          <div className="flex h-screen overflow-hidden bg-background">
               {/* Mobile Backdrop */}
               <AnimatePresence>
                    {isMobile && (sidebarOpen || aiPanelOpen) && (
                         <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="fixed inset-0 bg-black/50 z-40 md:hidden"
                              onClick={handleBackdropClick}
                         />
                    )}
               </AnimatePresence>

               {/* Sidebar - Full Height */}
               <AnimatePresence mode="wait">
                    {sidebarOpen && (
                         <motion.aside
                              initial="closed"
                              animate="open"
                              exit="closed"
                              variants={isMobile ? mobileDrawerVariants : sidebarSlide}
                              className={cn(
                                   'flex-shrink-0 bg-sidebar h-full',
                                   isMobile && 'fixed left-0 top-0 bottom-0 z-50 shadow-2xl'
                              )}
                              style={{ width: isMobile ? 260 : settings.sidebarWidth }}
                         >
                              {/* Mobile close button */}
                              {isMobile && (
                                   <button
                                        onClick={toggleSidebar}
                                        className="absolute top-2 right-2 p-1.5 rounded hover:bg-muted/50 z-10"
                                   >
                                        <X className="h-4 w-4" />
                                   </button>
                              )}
                              <Sidebar />
                         </motion.aside>
                    )}
               </AnimatePresence>

               {/* Main Content Area - TopBar + Editor Stack */}
               <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Top Bar (starts after sidebar) */}
                    <TopBar showMobileMenu={isMobile} />

                    {/* Main Editor/View Area */}
                    <main className="flex-1 overflow-hidden">
                         {children}
                    </main>
               </div>

               {/* AI Panel */}
               <AnimatePresence mode="wait">
                    {aiPanelOpen && (
                         <motion.aside
                              initial="closed"
                              animate="open"
                              exit="closed"
                              variants={isMobile ? mobileAIPanelVariants : aiPanelSlide}
                              className={cn(
                                   'flex-shrink-0 border-l border-border/30 bg-card h-full',
                                   isMobile && 'fixed right-0 top-0 bottom-0 z-50 shadow-2xl'
                              )}
                              style={{ width: isMobile ? 300 : settings.aiPanelWidth }}
                         >
                              <AIPanel />
                         </motion.aside>
                    )}
               </AnimatePresence>

               {/* Command Palette Overlay */}
               <AnimatePresence>
                    {commandPaletteOpen && <CommandPalette />}
               </AnimatePresence>

               {/* Settings Dialog */}
               <SettingsDialog />

               {/* AI Diff Review Overlay */}
               <DiffReviewOverlay />
          </div>
     );
}
