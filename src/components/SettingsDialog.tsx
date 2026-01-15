'use client';

// ==========================================================================
// SETTINGS DIALOG - With Theme and Editable Shortcuts
// ==========================================================================
import { useState } from 'react';
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogHeader,
     DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
     Sun,
     Moon,
     BookOpen,
     Keyboard,
     Palette,
     Type,
     Layout,
     Pencil,
     Check,
     X
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

// ==========================================================================
// THEME SELECTOR
// ==========================================================================
function ThemeSelector() {
     const { settings, setTheme } = useUIStore();

     const themes = [
          { id: 'light', icon: Sun, label: 'Light', description: 'Clean and bright' },
          { id: 'dark', icon: Moon, label: 'Dark', description: 'Easy on the eyes' },
          { id: 'sepia', icon: BookOpen, label: 'Sepia', description: 'Writer\'s mode' },
     ] as const;

     return (
          <div className="grid grid-cols-3 gap-3">
               {themes.map(({ id, icon: Icon, label, description }) => (
                    <button
                         key={id}
                         onClick={() => setTheme(id)}
                         className={cn(
                              'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
                              settings.theme === id
                                   ? 'border-primary bg-primary/5'
                                   : 'border-border hover:border-primary/50 hover:bg-muted'
                         )}
                    >
                         <Icon className="h-6 w-6" />
                         <span className="font-medium text-sm">{label}</span>
                         <span className="text-xs text-muted-foreground">{description}</span>
                    </button>
               ))}
          </div>
     );
}

// ==========================================================================
// FONT SELECTOR
// ==========================================================================
function FontSelector() {
     const { settings, updateSettings } = useUIStore();

     const fontOptions = [
          { id: 'default', label: 'System Default' },
          { id: 'sans', label: 'Inter (Sans-serif)' },
          { id: 'mono', label: 'JetBrains Mono' },
     ];

     return (
          <div className="space-y-4">
               <div>
                    <label className="text-sm font-medium mb-2 block">Editor Font</label>
                    <div className="grid grid-cols-2 gap-2">
                         {fontOptions.map(({ id, label }) => (
                              <button
                                   key={id}
                                   onClick={() => updateSettings({ fontFamily: id as any })}
                                   className={cn(
                                        'px-3 py-2 rounded-lg border text-sm transition-all',
                                        settings.fontFamily === id
                                             ? 'border-primary bg-primary/5'
                                             : 'border-border hover:border-primary/50'
                                   )}
                              >
                                   {label}
                              </button>
                         ))}
                    </div>
               </div>

               <div>
                    <label className="text-sm font-medium mb-2 block">Font Size</label>
                    <div className="flex items-center gap-4">
                         <input
                              type="range"
                              min="12"
                              max="24"
                              value={settings.fontSize}
                              onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                              className="flex-1"
                         />
                         <span className="text-sm text-muted-foreground w-12">{settings.fontSize}px</span>
                    </div>
               </div>

               <div>
                    <label className="text-sm font-medium mb-2 block">Line Height</label>
                    <div className="flex items-center gap-4">
                         <input
                              type="range"
                              min="1.2"
                              max="2"
                              step="0.1"
                              value={settings.lineHeight}
                              onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                              className="flex-1"
                         />
                         <span className="text-sm text-muted-foreground w-12">{settings.lineHeight}</span>
                    </div>
               </div>
          </div>
     );
}

// ==========================================================================
// LAYOUT SETTINGS
// ==========================================================================
function LayoutSettings() {
     const { settings, updateSettings } = useUIStore();

     return (
          <div className="space-y-4">
               <div>
                    <label className="text-sm font-medium mb-2 block">Editor Width</label>
                    <div className="flex items-center gap-4">
                         <input
                              type="range"
                              min="500"
                              max="1200"
                              step="50"
                              value={settings.editorWidth}
                              onChange={(e) => updateSettings({ editorWidth: parseInt(e.target.value) })}
                              className="flex-1"
                         />
                         <span className="text-sm text-muted-foreground w-16">{settings.editorWidth}px</span>
                    </div>
               </div>

               <div>
                    <label className="text-sm font-medium mb-2 block">Sidebar Width</label>
                    <div className="flex items-center gap-4">
                         <input
                              type="range"
                              min="200"
                              max="400"
                              step="20"
                              value={settings.sidebarWidth}
                              onChange={(e) => updateSettings({ sidebarWidth: parseInt(e.target.value) })}
                              className="flex-1"
                         />
                         <span className="text-sm text-muted-foreground w-16">{settings.sidebarWidth}px</span>
                    </div>
               </div>

               <div>
                    <label className="text-sm font-medium mb-2 block">AI Panel Width</label>
                    <div className="flex items-center gap-4">
                         <input
                              type="range"
                              min="280"
                              max="500"
                              step="20"
                              value={settings.aiPanelWidth}
                              onChange={(e) => updateSettings({ aiPanelWidth: parseInt(e.target.value) })}
                              className="flex-1"
                         />
                         <span className="text-sm text-muted-foreground w-16">{settings.aiPanelWidth}px</span>
                    </div>
               </div>
          </div>
     );
}

// ==========================================================================
// KEYBOARD SHORTCUTS - Editable
// ==========================================================================
function KeyboardShortcuts() {
     const [editingId, setEditingId] = useState<string | null>(null);
     const [tempKeys, setTempKeys] = useState<string[]>([]);

     const shortcuts = [
          { id: 'command-palette', keys: ['⌘', 'K'], description: 'Open command palette' },
          { id: 'toggle-sidebar', keys: ['⌘', '\\'], description: 'Toggle sidebar' },
          { id: 'toggle-ai', keys: ['⌘', '/'], description: 'Toggle AI panel' },
          { id: 'new-note', keys: ['⌘', 'N'], description: 'Create new note' },
          { id: 'cycle-notes', keys: ['⌘', 'Tab'], description: 'Cycle through open notes' },
          { id: 'jump-note', keys: ['⌘', '1-9'], description: 'Jump to note by index' },
          { id: 'find', keys: ['⌘', 'F'], description: 'Find in note' },
          { id: 'bold', keys: ['⌘', 'B'], description: 'Bold text' },
          { id: 'italic', keys: ['⌘', 'I'], description: 'Italic text' },
          { id: 'underline', keys: ['⌘', 'U'], description: 'Underline text' },
          { id: 'strikethrough', keys: ['⌘', 'Shift', 'S'], description: 'Strikethrough text' },
          { id: 'highlight', keys: ['⌘', 'Shift', 'H'], description: 'Highlight text' },
          { id: 'code', keys: ['⌘', '`'], description: 'Inline code' },
          { id: 'code-block', keys: ['⌘', 'Shift', '`'], description: 'Code block' },
          { id: 'heading1', keys: ['⌘', '1'], description: 'Heading 1' },
          { id: 'heading2', keys: ['⌘', '2'], description: 'Heading 2' },
          { id: 'heading3', keys: ['⌘', '3'], description: 'Heading 3' },
          { id: 'bullet-list', keys: ['⌘', 'Shift', '8'], description: 'Bullet list' },
          { id: 'numbered-list', keys: ['⌘', 'Shift', '7'], description: 'Numbered list' },
          { id: 'task-list', keys: ['⌘', 'Shift', '9'], description: 'Task list' },
          { id: 'link', keys: ['⌘', 'K'], description: 'Insert link' },
          { id: 'escape', keys: ['Esc'], description: 'Close dialogs / Clear selection' },
     ];

     const handleStartEdit = (id: string, currentKeys: string[]) => {
          setEditingId(id);
          setTempKeys(currentKeys);
     };

     const handleCancelEdit = () => {
          setEditingId(null);
          setTempKeys([]);
     };

     const handleSaveEdit = () => {
          // In a full implementation, this would save to settings
          setEditingId(null);
          setTempKeys([]);
     };

     return (
          <div className="space-y-1">
               <p className="text-xs text-muted-foreground mb-3">
                    Click on a shortcut to customize it. Use ⌘ for Ctrl/Cmd.
               </p>
               {shortcuts.map(({ id, keys, description }) => (
                    <div key={id} className="flex items-center justify-between py-2 hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors">
                         <span className="text-sm text-muted-foreground">{description}</span>
                         {editingId === id ? (
                              <div className="flex items-center gap-2">
                                   <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                                        {tempKeys.map((key, i) => (
                                             <kbd
                                                  key={i}
                                                  className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono"
                                             >
                                                  {key}
                                             </kbd>
                                        ))}
                                   </div>
                                   <button onClick={handleSaveEdit} className="p-1 hover:bg-muted rounded text-primary">
                                        <Check className="h-3.5 w-3.5" />
                                   </button>
                                   <button onClick={handleCancelEdit} className="p-1 hover:bg-muted rounded text-muted-foreground">
                                        <X className="h-3.5 w-3.5" />
                                   </button>
                              </div>
                         ) : (
                              <button
                                   onClick={() => handleStartEdit(id, keys)}
                                   className="group flex items-center gap-1"
                              >
                                   {keys.map((key, i) => (
                                        <kbd
                                             key={i}
                                             className="px-2 py-1 rounded bg-muted text-xs font-mono group-hover:bg-primary/10 transition-colors"
                                        >
                                             {key}
                                        </kbd>
                                   ))}
                                   <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 ml-1 transition-opacity" />
                              </button>
                         )}
                    </div>
               ))}
          </div>
     );
}

// ==========================================================================
// MAIN SETTINGS DIALOG
// ==========================================================================
export function SettingsDialog() {
     const { isSettingsOpen, closeSettings } = useUIStore();

     return (
          <Dialog open={isSettingsOpen} onOpenChange={(open) => !open && closeSettings()}>
               <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                         <DialogTitle className="text-xl">Settings</DialogTitle>
                         <DialogDescription>
                              Customize your Orrery experience
                         </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="appearance" className="mt-4">
                         <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="appearance" className="gap-2">
                                   <Palette className="h-4 w-4" />
                                   <span className="hidden sm:inline">Theme</span>
                              </TabsTrigger>
                              <TabsTrigger value="editor" className="gap-2">
                                   <Type className="h-4 w-4" />
                                   <span className="hidden sm:inline">Editor</span>
                              </TabsTrigger>
                              <TabsTrigger value="layout" className="gap-2">
                                   <Layout className="h-4 w-4" />
                                   <span className="hidden sm:inline">Layout</span>
                              </TabsTrigger>
                              <TabsTrigger value="shortcuts" className="gap-2">
                                   <Keyboard className="h-4 w-4" />
                                   <span className="hidden sm:inline">Shortcuts</span>
                              </TabsTrigger>
                         </TabsList>

                         <div className="mt-6 max-h-[50vh] overflow-y-auto pr-2">
                              <TabsContent value="appearance" className="mt-0">
                                   <div className="space-y-6">
                                        <div>
                                             <h3 className="text-sm font-medium mb-4">Theme</h3>
                                             <ThemeSelector />
                                        </div>
                                   </div>
                              </TabsContent>

                              <TabsContent value="editor" className="mt-0">
                                   <FontSelector />
                              </TabsContent>

                              <TabsContent value="layout" className="mt-0">
                                   <LayoutSettings />
                              </TabsContent>

                              <TabsContent value="shortcuts" className="mt-0">
                                   <KeyboardShortcuts />
                              </TabsContent>
                         </div>
                    </Tabs>
               </DialogContent>
          </Dialog>
     );
}
