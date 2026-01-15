'use client';

import { useUIStore } from '@/stores/uiStore';
import { useNotesStore } from '@/stores/notesStore';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { TopBar } from '@/components/TopBar';
import { AIPanel } from '@/components/ai-panel/AIPanel';
import { CommandPalette } from '@/components/CommandPalette';
import { SettingsDialog } from '@/components/SettingsDialog';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeSampleVault } from '@/lib/db';
import { initializeTheme } from '@/stores/uiStore';
import { sidebarSlide, aiPanelSlide } from '@/lib/animations';
import { cn } from '@/lib/utils';
import EditorPage from './(main)/editor/page';
import GraphPage from './(main)/graph/page';

export default function Home() {
  const {
    sidebarOpen,
    aiPanelOpen,
    commandPaletteOpen,
    settings,
    loadSettings,
    toggleSidebar,
    toggleAIPanel,
    currentView
  } = useUIStore();

  const { loadNotes } = useNotesStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, toggleAIPanel]);

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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={isMobile ? {} : sidebarSlide}
            className={cn(
              'flex-shrink-0 bg-sidebar h-full',
              isMobile && 'fixed left-0 top-0 bottom-0 z-50 shadow-2xl'
            )}
            style={{ width: isMobile ? 260 : settings.sidebarWidth }}
          >
            <Sidebar />
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar showMobileMenu={isMobile} />
        <main className="flex-1 overflow-hidden">
          {currentView === 'graph' ? <GraphPage /> : <EditorPage />}
        </main>
      </div>

      <AnimatePresence>
        {aiPanelOpen && (
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={isMobile ? {} : aiPanelSlide}
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

      <AnimatePresence>
        {commandPaletteOpen && <CommandPalette />}
      </AnimatePresence>

      <SettingsDialog />
    </div>
  );
}
