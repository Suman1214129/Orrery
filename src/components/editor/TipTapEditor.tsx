'use client';

// ==========================================================================
// TIPTAP EDITOR - With Tables & Fixed Context Menu
// ==========================================================================
import { useEffect, useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
// Table extensions not installed - removed
import {
     Bold,
     Italic,
     Underline as UnderlineIcon,
     Strikethrough,
     Link as LinkIcon,
     Highlighter,
     Code,
     Quote,
     List,
     ListOrdered,
     CheckSquare,
     Heading1,
     Heading2,
     Heading3,
     Minus,
     ChevronRight,
     Scissors,
     Copy,
     ClipboardPaste,
     Table as TableIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

// ==========================================================================
// SUBMENU COMPONENT WITH FIXED POSITIONING
// ==========================================================================
interface SubMenuProps {
     icon: React.ElementType;
     label: string;
     children: React.ReactNode;
}

function SubMenu({ icon: Icon, label, children }: SubMenuProps) {
     const [isOpen, setIsOpen] = useState(false);
     const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

     const handleMouseEnter = () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setIsOpen(true);
     };

     const handleMouseLeave = () => {
          timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
     };

     return (
          <div
               className="relative"
               onMouseEnter={handleMouseEnter}
               onMouseLeave={handleMouseLeave}
          >
               <button className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md hover:bg-muted/80 transition-colors">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-left">{label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
               </button>

               {isOpen && (
                    <div
                         className="absolute left-full top-0 ml-1 min-w-[200px] max-h-[400px] overflow-y-auto rounded-lg border border-border bg-popover p-1.5 shadow-xl"
                         style={{ zIndex: 9999 }}
                         onMouseEnter={handleMouseEnter}
                         onMouseLeave={handleMouseLeave}
                    >
                         {children}
                    </div>
               )}
          </div>
     );
}

// ==========================================================================
// CONTEXT MENU
// ==========================================================================
interface ContextMenuProps {
     editor: Editor;
     position: { x: number; y: number };
     onClose: () => void;
}

function ContextMenu({ editor, position, onClose }: ContextMenuProps) {
     const menuRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
          const handleClick = (e: MouseEvent) => {
               if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                    onClose();
               }
          };
          document.addEventListener('mousedown', handleClick);
          return () => document.removeEventListener('mousedown', handleClick);
     }, [onClose]);

     useEffect(() => {
          const handleKey = (e: KeyboardEvent) => {
               if (e.key === 'Escape') onClose();
          };
          document.addEventListener('keydown', handleKey);
          return () => document.removeEventListener('keydown', handleKey);
     }, [onClose]);

     const runCommand = (command: () => void) => {
          if (editor && !editor.isDestroyed) {
               try {
                    command();
               } catch (e) {
                    console.warn('Editor command failed:', e);
               }
          }
          onClose();
     };

     const MenuItem = ({ icon: Icon, label, shortcut, onClick, isActive }: {
          icon: React.ElementType;
          label: string;
          shortcut?: string;
          onClick: () => void;
          isActive?: boolean;
     }) => (
          <button
               onClick={onClick}
               className={cn(
                    'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition-colors',
                    'hover:bg-muted/80',
                    isActive && 'bg-muted text-primary'
               )}
          >
               <Icon className="h-4 w-4 text-muted-foreground" />
               <span className="flex-1 text-left">{label}</span>
               {shortcut && (
                    <span className="text-xs text-muted-foreground/60">{shortcut}</span>
               )}
          </button>
     );

     const Divider = () => <div className="h-px bg-border my-1" />;

     // Smart positioning to keep menu on screen
     const [adjustedPos, setAdjustedPos] = useState(position);

     useEffect(() => {
          if (menuRef.current) {
               const menuRect = menuRef.current.getBoundingClientRect();
               const newPos = { ...position };

               // Adjust horizontal
               if (position.x + menuRect.width > window.innerWidth) {
                    newPos.x = window.innerWidth - menuRect.width - 10;
               }

               // Adjust vertical - keep above if going off bottom
               if (position.y + menuRect.height > window.innerHeight) {
                    newPos.y = Math.max(10, position.y - menuRect.height);
               }

               setAdjustedPos(newPos);
          }
     }, [position]);

     return (
          <motion.div
               ref={menuRef}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ duration: 0.1 }}
               className="context-menu-container fixed z-50 min-w-[200px] overflow-visible rounded-lg border border-border/50 bg-popover/95 backdrop-blur-sm p-1.5 shadow-lg"
               style={{ left: adjustedPos.x, top: adjustedPos.y }}
          >
               <MenuItem
                    icon={Scissors}
                    label="Cut"
                    shortcut="Ctrl+X"
                    onClick={() => {
                         document.execCommand('cut');
                         onClose();
                    }}
               />
               <MenuItem
                    icon={Copy}
                    label="Copy"
                    shortcut="Ctrl+C"
                    onClick={() => {
                         document.execCommand('copy');
                         onClose();
                    }}
               />
               <MenuItem
                    icon={ClipboardPaste}
                    label="Paste"
                    shortcut="Ctrl+V"
                    onClick={() => {
                         document.execCommand('paste');
                         onClose();
                    }}
               />

               <Divider />

               <SubMenu icon={Bold} label="Format">
                    <MenuItem
                         icon={Bold}
                         label="Bold"
                         shortcut="Ctrl+B"
                         onClick={() => runCommand(() => editor.chain().focus().toggleBold().run())}
                         isActive={editor.isActive('bold')}
                    />
                    <MenuItem
                         icon={Italic}
                         label="Italic"
                         shortcut="Ctrl+I"
                         onClick={() => runCommand(() => editor.chain().focus().toggleItalic().run())}
                         isActive={editor.isActive('italic')}
                    />
                    <MenuItem
                         icon={UnderlineIcon}
                         label="Underline"
                         shortcut="Ctrl+U"
                         onClick={() => runCommand(() => editor.chain().focus().toggleUnderline().run())}
                         isActive={editor.isActive('underline')}
                    />
                    <MenuItem
                         icon={Strikethrough}
                         label="Strikethrough"
                         onClick={() => runCommand(() => editor.chain().focus().toggleStrike().run())}
                         isActive={editor.isActive('strike')}
                    />
                    <MenuItem
                         icon={Highlighter}
                         label="Highlight"
                         onClick={() => runCommand(() => editor.chain().focus().toggleHighlight().run())}
                         isActive={editor.isActive('highlight')}
                    />
                    <MenuItem
                         icon={Code}
                         label="Code"
                         onClick={() => runCommand(() => editor.chain().focus().toggleCode().run())}
                         isActive={editor.isActive('code')}
                    />
               </SubMenu>

               <SubMenu icon={Heading1} label="Paragraph">
                    <MenuItem
                         icon={Heading1}
                         label="Heading 1"
                         onClick={() => runCommand(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}
                         isActive={editor.isActive('heading', { level: 1 })}
                    />
                    <MenuItem
                         icon={Heading2}
                         label="Heading 2"
                         onClick={() => runCommand(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
                         isActive={editor.isActive('heading', { level: 2 })}
                    />
                    <MenuItem
                         icon={Heading3}
                         label="Heading 3"
                         onClick={() => runCommand(() => editor.chain().focus().toggleHeading({ level: 3 }).run())}
                         isActive={editor.isActive('heading', { level: 3 })}
                    />
                    <Divider />
                    <MenuItem
                         icon={List}
                         label="Bullet List"
                         onClick={() => runCommand(() => editor.chain().focus().toggleBulletList().run())}
                         isActive={editor.isActive('bulletList')}
                    />
                    <MenuItem
                         icon={ListOrdered}
                         label="Numbered List"
                         onClick={() => runCommand(() => editor.chain().focus().toggleOrderedList().run())}
                         isActive={editor.isActive('orderedList')}
                    />
                    <MenuItem
                         icon={CheckSquare}
                         label="Task List"
                         onClick={() => runCommand(() => editor.chain().focus().toggleTaskList().run())}
                         isActive={editor.isActive('taskList')}
                    />
                    <MenuItem
                         icon={Quote}
                         label="Quote"
                         onClick={() => runCommand(() => editor.chain().focus().toggleBlockquote().run())}
                         isActive={editor.isActive('blockquote')}
                    />
               </SubMenu>

               <SubMenu icon={TableIcon} label="Insert">
                    <MenuItem
                         icon={LinkIcon}
                         label="Link"
                         onClick={() => {
                              const url = window.prompt('Enter URL');
                              if (url) {
                                   runCommand(() => editor.chain().focus().setLink({ href: url }).run());
                              } else {
                                   onClose();
                              }
                         }}
                         isActive={editor.isActive('link')}
                    />
                    <MenuItem
                         icon={Code}
                         label="Code Block"
                         onClick={() => runCommand(() => editor.chain().focus().toggleCodeBlock().run())}
                         isActive={editor.isActive('codeBlock')}
                    />
                    {/* Table requires @tiptap/extension-table - not installed */}
                    <MenuItem
                         icon={Minus}
                         label="Horizontal Line"
                         onClick={() => runCommand(() => editor.chain().focus().setHorizontalRule().run())}
                    />
               </SubMenu>
          </motion.div>
     );
}

// ==========================================================================
// MAIN TIPTAP EDITOR
// ==========================================================================
interface TipTapEditorProps {
     content: string;
     onChange: (content: string) => void;
     placeholder?: string;
     editable?: boolean;
     className?: string;
}

export function TipTapEditor({
     content,
     onChange,
     placeholder = "Start writing...",
     editable = true,
     className
}: TipTapEditorProps) {
     const lastContentRef = useRef(content);
     const containerRef = useRef<HTMLDivElement>(null);
     const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

     const editor = useEditor({
          immediatelyRender: false,
          extensions: [
               StarterKit.configure({
                    heading: {
                         levels: [1, 2, 3],
                    },
               }),
               Placeholder.configure({
                    placeholder,
                    emptyEditorClass: 'is-editor-empty',
               }),
               Link.configure({
                    openOnClick: false,
                    HTMLAttributes: {
                         class: 'wiki-link',
                    },
               }),
               Highlight.configure({
                    HTMLAttributes: {
                         class: 'bg-gold-subtle',
                    },
               }),
               TaskList,
               TaskItem.configure({
                    nested: true,
               }),
               Underline,
               // Table extensions not installed
          ],
          content,
          editable,
          onUpdate: ({ editor }) => {
               const html = editor.getHTML();
               lastContentRef.current = html;
               onChange(html);
          },
          editorProps: {
               attributes: {
                    class: 'tiptap outline-none min-h-[400px] focus:outline-none',
               },
          },
     });

     useEffect(() => {
          if (!editor || editor.isDestroyed) return;

          if (content !== lastContentRef.current) {
               lastContentRef.current = content;
               setTimeout(() => {
                    if (editor && !editor.isDestroyed) {
                         editor.commands.setContent(content);
                    }
               }, 0);
          }
     }, [content, editor]);

     const handleContextMenu = useCallback((e: React.MouseEvent) => {
          e.preventDefault();
          if (editor && !editor.isDestroyed) {
               setContextMenu({ x: e.clientX, y: e.clientY });
          }
     }, [editor]);

     const closeContextMenu = useCallback(() => {
          setContextMenu(null);
     }, []);

     return (
          <div
               ref={containerRef}
               className={cn('relative', className)}
               onContextMenu={handleContextMenu}
          >
               <EditorContent editor={editor} />

               <AnimatePresence>
                    {contextMenu && editor && (
                         <ContextMenu
                              editor={editor}
                              position={contextMenu}
                              onClose={closeContextMenu}
                         />
                    )}
               </AnimatePresence>
          </div>
     );
}

// ==========================================================================
// MARKDOWN CONVERTERS
// ==========================================================================
export function htmlToMarkdown(html: string): string {
     return html
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
          .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
          .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
          .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
          .replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_')
          .replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~')
          .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
          .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
          .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n')
          .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
          .replace(/<br[^>]*>/gi, '\n')
          .replace(/<hr[^>]*>/gi, '---\n')
          .replace(/<a[^>]*class="wiki-link"[^>]*href="([^"]+)"[^>]*>.*?<\/a>/gi, '[[$1]]')
          .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
          .replace(/<[^>]+>/g, '')
          .trim();
}

export function markdownToHtml(markdown: string): string {
     if (!markdown) return '<p></p>';

     return markdown
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/gim, '<em>$1</em>')
          .replace(/~~(.*?)~~/gim, '<s>$1</s>')
          .replace(/`(.*?)`/gim, '<code>$1</code>')
          .replace(/\[\[([^\]]+)\]\]/gim, '<a href="$1" class="wiki-link">$1</a>')
          .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
          .replace(/^- (.*$)/gim, '<li>$1</li>')
          .replace(/\n\n/gim, '</p><p>')
          .replace(/\n/gim, '<br>')
          .replace(/^(.*)$/gm, (match) => {
               if (match.startsWith('<')) return match;
               return `<p>${match}</p>`;
          });
}
