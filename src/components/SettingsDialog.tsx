'use client';

// ==========================================================================
// SETTINGS DIALOG - With Theme and Editable Shortcuts
// ==========================================================================
import { useState } from 'react';
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
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
     X,
     LogOut,
     User,
     Trash2,
     AlertTriangle,
     Lock,
     ChevronRight,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useNotesStore } from '@/stores/notesStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
// ACCOUNT PANEL
// ==========================================================================
function AccountPanel() {
     const { user, signOut, updatePassword, deleteAccount } = useAuthStore();
     const { notes } = useNotesStore();

     // Change password
     const [showChangePassword, setShowChangePassword] = useState(false);
     const [currentPw, setCurrentPw] = useState('');
     const [newPw, setNewPw] = useState('');
     const [confirmPw, setConfirmPw] = useState('');
     const [pwLoading, setPwLoading] = useState(false);
     const [pwError, setPwError] = useState('');
     const [pwSuccess, setPwSuccess] = useState(false);

     // Delete data
     const [showDeleteData, setShowDeleteData] = useState(false);
     const [deleteDataLoading, setDeleteDataLoading] = useState(false);

     // Delete account
     const [showDeleteAccount, setShowDeleteAccount] = useState(false);
     const [deleteAccountPw, setDeleteAccountPw] = useState('');
     const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
     const [deleteAccountError, setDeleteAccountError] = useState('');

     const isEmailUser = user?.providerData?.[0]?.providerId === 'password';

     const handleChangePassword = async (e: React.FormEvent) => {
          e.preventDefault();
          setPwError('');
          if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
          if (newPw.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
          setPwLoading(true);
          try {
               await updatePassword(currentPw, newPw);
               setPwSuccess(true);
               setCurrentPw(''); setNewPw(''); setConfirmPw('');
               setTimeout(() => { setPwSuccess(false); setShowChangePassword(false); }, 2000);
          } catch (err: any) {
               setPwError(err.message || 'Failed to update password.');
          } finally {
               setPwLoading(false);
          }
     };

     const handleDeleteData = async () => {
          setDeleteDataLoading(true);
          try {
               // Clear all notes from the Dexie db
               const { deleteNote } = useNotesStore.getState();
               const allNotes = Array.from(useNotesStore.getState().notes.values());
               await Promise.all(allNotes.map(n => deleteNote(n.id)));
               setShowDeleteData(false);
          } catch {
               // silently fail
          } finally {
               setDeleteDataLoading(false);
          }
     };

     const handleDeleteAccount = async () => {
          setDeleteAccountError('');
          setDeleteAccountLoading(true);
          try {
               await deleteAccount(isEmailUser ? deleteAccountPw : undefined);
               setShowDeleteAccount(false);
          } catch (err: any) {
               setDeleteAccountError(err.message || 'Failed to delete account.');
          } finally {
               setDeleteAccountLoading(false);
          }
     };

     return (
          <div className="space-y-6">
               {/* Profile info */}
               <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-base shrink-0">
                         {user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="min-w-0">
                         <p className="text-sm font-medium truncate">{user?.displayName || 'User'}</p>
                         <p className="text-[12px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
               </div>

               {/* Sign out */}
               <div className="space-y-1">
                    <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Session</h3>
                    <button
                         type="button"
                         onClick={() => signOut()}
                         className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                         <LogOut className="h-4 w-4 text-muted-foreground" />
                         <span>Sign out</span>
                    </button>
               </div>

               {/* Change password (email users only) */}
               {isEmailUser && (
                    <div className="space-y-1">
                         <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Security</h3>
                         <button
                              type="button"
                              onClick={() => setShowChangePassword(s => !s)}
                              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm"
                         >
                              <Lock className="h-4 w-4 text-muted-foreground" />
                              <span className="flex-1 text-left">Change password</span>
                              <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', showChangePassword && 'rotate-90')} />
                         </button>
                         {showChangePassword && (
                              <form onSubmit={handleChangePassword} className="mt-2 ml-3 space-y-2 border-l-2 border-border pl-4">
                                   <Input type="password" placeholder="Current password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="h-9" />
                                   <Input type="password" placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)} className="h-9" />
                                   <Input type="password" placeholder="Confirm new password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="h-9" />
                                   {pwError && <p className="text-[12px] text-destructive">{pwError}</p>}
                                   {pwSuccess && <p className="text-[12px] text-green-600">Password updated!</p>}
                                   <Button type="submit" size="sm" disabled={pwLoading || !currentPw || !newPw || !confirmPw}>
                                        {pwLoading ? 'Saving...' : 'Update password'}
                                   </Button>
                              </form>
                         )}
                    </div>
               )}

               {/* Danger zone */}
               <div className="space-y-1">
                    <h3 className="text-xs font-medium uppercase tracking-wide text-destructive/70 mb-2">Danger Zone</h3>
                    {/* Delete all data */}
                    <button
                         type="button"
                         onClick={() => setShowDeleteData(s => !s)}
                         className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/8 transition-colors text-sm text-destructive"
                    >
                         <Trash2 className="h-4 w-4" />
                         <span className="flex-1 text-left">Delete all notes</span>
                         <span className="text-[11px] text-muted-foreground">{notes.size} notes</span>
                    </button>
                    {showDeleteData && (
                         <div className="mt-1 ml-3 border-l-2 border-destructive/30 pl-4 py-2 space-y-2">
                              <p className="text-[12px] text-muted-foreground">This will permanently delete all {notes.size} notes. This cannot be undone.</p>
                              <div className="flex gap-2">
                                   <Button size="sm" variant="destructive" onClick={handleDeleteData} disabled={deleteDataLoading}>
                                        {deleteDataLoading ? 'Deleting...' : 'Yes, delete all'}
                                   </Button>
                                   <Button size="sm" variant="outline" onClick={() => setShowDeleteData(false)}>Cancel</Button>
                              </div>
                         </div>
                    )}

                    {/* Delete account */}
                    <button
                         type="button"
                         onClick={() => setShowDeleteAccount(s => !s)}
                         className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/8 transition-colors text-sm text-destructive"
                    >
                         <AlertTriangle className="h-4 w-4" />
                         <span>Delete account</span>
                    </button>
                    {showDeleteAccount && (
                         <div className="mt-1 ml-3 border-l-2 border-destructive/30 pl-4 py-2 space-y-2">
                              <p className="text-[12px] text-muted-foreground">
                                   This will permanently delete your account. This action cannot be undone.
                              </p>
                              {isEmailUser && (
                                   <Input
                                        type="password"
                                        placeholder="Enter your password to confirm"
                                        value={deleteAccountPw}
                                        onChange={e => setDeleteAccountPw(e.target.value)}
                                        className="h-9"
                                   />
                              )}
                              {deleteAccountError && <p className="text-[12px] text-destructive">{deleteAccountError}</p>}
                              <div className="flex gap-2">
                                   <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={deleteAccountLoading || (isEmailUser && !deleteAccountPw)}
                                   >
                                        {deleteAccountLoading ? 'Deleting...' : 'Delete my account'}
                                   </Button>
                                   <Button size="sm" variant="outline" onClick={() => setShowDeleteAccount(false)}>Cancel</Button>
                              </div>
                         </div>
                    )}
               </div>
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
                              Customize your workspace
                         </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="appearance" className="mt-4">
                         <TabsList className="grid w-full grid-cols-5">
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
                              <TabsTrigger value="account" className="gap-2">
                                   <User className="h-4 w-4" />
                                   <span className="hidden sm:inline">Account</span>
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

                              <TabsContent value="account" className="mt-0">
                                   <AccountPanel />
                              </TabsContent>
                         </div>
                    </Tabs>
               </DialogContent>
          </Dialog>
     );
}
