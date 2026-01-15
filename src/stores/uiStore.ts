// ==========================================================================
// UI STORE - Zustand State Management
// ==========================================================================
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ViewMode, Theme, UISettings, CommandPaletteItem } from '@/types';
import { getSettings, updateSettings as dbUpdateSettings } from '@/lib/db';

// ==========================================================================
// STORE INTERFACE
// ==========================================================================
interface UIState {
     // Layout State
     sidebarOpen: boolean;
     aiPanelOpen: boolean;
     currentView: ViewMode;

     // Command Palette
     commandPaletteOpen: boolean;
     commandPaletteItems: CommandPaletteItem[];

     // Settings
     settings: UISettings;
     isSettingsOpen: boolean;

     // Loading & Notifications
     isLoading: boolean;
     loadingMessage: string;
     notification: {
          type: 'success' | 'error' | 'warning' | 'info';
          message: string;
     } | null;

     // AI Suggestions (for diff review)
     pendingAISuggestion: {
          id: string;
          type: 'replace' | 'insert' | 'append';
          originalText: string;
          suggestedText: string;
          actionName: string;
     } | null;

     // Actions
     toggleSidebar: () => void;
     toggleAIPanel: () => void;
     setView: (view: ViewMode) => void;

     // Command Palette
     openCommandPalette: () => void;
     closeCommandPalette: () => void;
     setCommandPaletteItems: (items: CommandPaletteItem[]) => void;

     // Settings
     openSettings: () => void;
     closeSettings: () => void;
     loadSettings: () => Promise<void>;
     updateSettings: (updates: Partial<UISettings>) => Promise<void>;
     setTheme: (theme: Theme) => void;

     // Loading & Notifications
     setLoading: (loading: boolean, message?: string) => void;
     showNotification: (type: NonNullable<UIState['notification']>['type'], message: string) => void;
     clearNotification: () => void;

     // AI Suggestions
     setAISuggestion: (suggestion: UIState['pendingAISuggestion']) => void;
     clearAISuggestion: () => void;
}

// ==========================================================================
// DEFAULT SETTINGS
// ==========================================================================
const DEFAULT_SETTINGS: UISettings = {
     theme: 'light',
     sidebarWidth: 220,
     aiPanelWidth: 360,
     sidebarCollapsed: false,
     aiPanelCollapsed: true,
     editorWidth: 720,
     fontSize: 16,
     fontFamily: 'sans',
     lineHeight: 1.6,
     showWordCount: true,
     vimMode: false
};

// ==========================================================================
// STORE IMPLEMENTATION
// ==========================================================================
export const useUIStore = create<UIState>()(
     devtools(
          persist(
               (set, get) => ({
                    // Initial State
                    sidebarOpen: true,
                    aiPanelOpen: false,
                    currentView: 'editor',
                    commandPaletteOpen: false,
                    commandPaletteItems: [],
                    settings: DEFAULT_SETTINGS,
                    isSettingsOpen: false,
                    isLoading: false,
                    loadingMessage: '',
                    notification: null,
                    pendingAISuggestion: null,

                    // ==========================================================================
                    // LAYOUT ACTIONS
                    // ==========================================================================
                    toggleSidebar: () => {
                         set(state => ({ sidebarOpen: !state.sidebarOpen }));
                    },

                    toggleAIPanel: () => {
                         set(state => ({ aiPanelOpen: !state.aiPanelOpen }));
                    },

                    setView: (view) => {
                         set({ currentView: view });
                    },

                    // ==========================================================================
                    // COMMAND PALETTE
                    // ==========================================================================
                    openCommandPalette: () => {
                         set({ commandPaletteOpen: true });
                    },

                    closeCommandPalette: () => {
                         set({ commandPaletteOpen: false });
                    },

                    setCommandPaletteItems: (items) => {
                         set({ commandPaletteItems: items });
                    },

                    // ==========================================================================
                    // SETTINGS
                    // ==========================================================================
                    openSettings: () => {
                         set({ isSettingsOpen: true });
                    },

                    closeSettings: () => {
                         set({ isSettingsOpen: false });
                    },

                    loadSettings: async () => {
                         try {
                              const settings = await getSettings();
                              set({ settings });

                              // Apply theme to document
                              const { theme } = settings;
                              document.documentElement.classList.remove('light', 'dark', 'sepia');
                              if (theme !== 'light') {
                                   document.documentElement.classList.add(theme);
                              }
                         } catch (error) {
                              console.error('Failed to load settings:', error);
                         }
                    },

                    updateSettings: async (updates) => {
                         const currentSettings = get().settings;
                         const newSettings = { ...currentSettings, ...updates };

                         set({ settings: newSettings });

                         // Apply theme if changed
                         if (updates.theme && updates.theme !== currentSettings.theme) {
                              document.documentElement.classList.remove('light', 'dark', 'sepia');
                              if (updates.theme !== 'light') {
                                   document.documentElement.classList.add(updates.theme);
                              }
                         }

                         try {
                              await dbUpdateSettings(updates);
                         } catch (error) {
                              console.error('Failed to persist settings:', error);
                         }
                    },

                    setTheme: (theme) => {
                         get().updateSettings({ theme });
                    },

                    // ==========================================================================
                    // LOADING & NOTIFICATIONS
                    // ==========================================================================
                    setLoading: (loading, message = '') => {
                         set({ isLoading: loading, loadingMessage: message });
                    },

                    showNotification: (type, message) => {
                         set({ notification: { type, message } });

                         // Auto-clear after 5 seconds
                         setTimeout(() => {
                              set({ notification: null });
                         }, 5000);
                    },

                    clearNotification: () => {
                         set({ notification: null });
                    },

                    // ==========================================================================
                    // AI SUGGESTIONS
                    // ==========================================================================
                    setAISuggestion: (suggestion) => {
                         set({ pendingAISuggestion: suggestion });
                    },

                    clearAISuggestion: () => {
                         set({ pendingAISuggestion: null });
                    }
               }),
               {
                    name: 'orrery-ui-storage',
                    partialize: (state) => ({
                         sidebarOpen: state.sidebarOpen,
                         aiPanelOpen: state.aiPanelOpen,
                         currentView: state.currentView,
                         settings: state.settings
                    })
               }
          )
     )
);

// ==========================================================================
// THEME HELPER
// ==========================================================================
export function initializeTheme() {
     // Check for saved theme or system preference
     const stored = localStorage.getItem('orrery-ui-storage');
     if (stored) {
          try {
               const { state } = JSON.parse(stored);
               const theme = state?.settings?.theme || 'light';
               if (theme !== 'light') {
                    document.documentElement.classList.add(theme);
               }
          } catch (e) {
               // Ignore parse errors
          }
     }
}
