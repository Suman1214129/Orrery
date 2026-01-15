// ==========================================================================
// ORRERY DATABASE - Dexie.js IndexedDB Wrapper
// ==========================================================================
import Dexie, { type Table } from 'dexie';
import type {
     Note,
     Folder,
     Canvas,
     NarrativeGraph,
     UISettings,
     AIResponse
} from '@/types';

// ==========================================================================
// DATABASE SCHEMA
// ==========================================================================
export class OrreryDatabase extends Dexie {
     notes!: Table<Note, string>;
     folders!: Table<Folder, string>;
     canvases!: Table<Canvas, string>;
     narrativeGraphs!: Table<NarrativeGraph, string>;
     settings!: Table<{ key: string; value: unknown }, string>;
     aiHistory!: Table<AIResponse & { noteId?: string }, string>;

     constructor() {
          super('OrreryDB');

          this.version(1).stores({
               notes: 'id, title, *tags, metadata.type, metadata.createdAt, metadata.updatedAt, folderId, isPinned',
               folders: 'id, name, parentId, order',
               canvases: 'id, name, createdAt, updatedAt',
               narrativeGraphs: 'id, noteId, createdAt, updatedAt',
               settings: 'key',
               aiHistory: 'id, noteId, action, timestamp'
          });
     }
}

// Singleton instance
export const db = new OrreryDatabase();

// ==========================================================================
// DATABASE HELPERS
// ==========================================================================

/**
 * Generate a unique ID
 */
export function generateId(): string {
     return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate word count from text
 */
export function countWords(text: string): number {
     return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculate read time in minutes
 */
export function calculateReadTime(wordCount: number): number {
     return Math.ceil(wordCount / 200); // Average reading speed
}

/**
 * Extract excerpt from content
 */
export function extractExcerpt(content: string, length: number = 200): string {
     const plainText = content.replace(/[#*_`\[\]()]/g, '').trim();
     return plainText.length > length
          ? plainText.substring(0, length) + '...'
          : plainText;
}

/**
 * Extract tags from content (#tag format)
 */
export function extractTags(content: string): string[] {
     const tagRegex = /#(\w+)/g;
     const matches = content.match(tagRegex);
     return matches ? [...new Set(matches.map(tag => tag.substring(1)))] : [];
}

/**
 * Extract wiki links from content ([[link]] format)
 */
export function extractWikiLinks(content: string): string[] {
     const linkRegex = /\[\[([^\]]+)\]\]/g;
     const matches = content.matchAll(linkRegex);
     return [...new Set([...matches].map(m => m[1]))];
}

// ==========================================================================
// NOTE OPERATIONS
// ==========================================================================

/**
 * Create a new note
 */
export async function createNote(
     title: string = 'Untitled',
     content: string = '',
     type: Note['metadata']['type'] = 'note'
): Promise<Note> {
     const now = new Date();
     const wordCount = countWords(content);

     const note: Note = {
          id: generateId(),
          title,
          content,
          excerpt: extractExcerpt(content),
          tags: extractTags(content),
          linkedNotes: extractWikiLinks(content),
          backlinks: [],
          metadata: {
               wordCount,
               readTime: calculateReadTime(wordCount),
               type,
               createdAt: now,
               updatedAt: now
          },
          isPinned: false,
          isArchived: false
     };

     await db.notes.add(note);

     // Update backlinks for linked notes
     await updateBacklinks(note.id, note.linkedNotes);

     return note;
}

/**
 * Update a note
 */
export async function updateNote(
     id: string,
     updates: Partial<Pick<Note, 'title' | 'content' | 'isPinned' | 'isArchived' | 'folderId'>>
): Promise<Note | undefined> {
     const existingNote = await db.notes.get(id);
     if (!existingNote) return undefined;

     const now = new Date();
     const content = updates.content ?? existingNote.content;
     const wordCount = countWords(content);
     const newLinkedNotes = extractWikiLinks(content);

     // Calculate which links were added/removed
     const oldLinks = new Set(existingNote.linkedNotes);
     const newLinks = new Set(newLinkedNotes);
     const addedLinks = newLinkedNotes.filter(l => !oldLinks.has(l));
     const removedLinks = existingNote.linkedNotes.filter(l => !newLinks.has(l));

     const updatedNote: Note = {
          ...existingNote,
          ...updates,
          excerpt: extractExcerpt(content),
          tags: extractTags(content),
          linkedNotes: newLinkedNotes,
          metadata: {
               ...existingNote.metadata,
               wordCount,
               readTime: calculateReadTime(wordCount),
               updatedAt: now
          }
     };

     await db.notes.put(updatedNote);

     // Update backlinks
     await updateBacklinks(id, addedLinks, removedLinks);

     return updatedNote;
}

/**
 * Delete a note
 */
export async function deleteNote(id: string): Promise<void> {
     const note = await db.notes.get(id);
     if (!note) return;

     // Remove this note from backlinks of linked notes
     await updateBacklinks(id, [], note.linkedNotes);

     // Remove this note from backlinks of notes that link to it
     const notesWithBacklinks = await db.notes.where('linkedNotes').equals(id).toArray();
     for (const n of notesWithBacklinks) {
          await db.notes.update(n.id, {
               linkedNotes: n.linkedNotes.filter(l => l !== id)
          });
     }

     await db.notes.delete(id);
}

/**
 * Update backlinks when links change
 */
async function updateBacklinks(
     sourceNoteId: string,
     addedLinks: string[],
     removedLinks: string[] = []
): Promise<void> {
     // Add backlinks
     for (const targetTitle of addedLinks) {
          const targetNote = await db.notes.where('title').equals(targetTitle).first();
          if (targetNote && !targetNote.backlinks.includes(sourceNoteId)) {
               await db.notes.update(targetNote.id, {
                    backlinks: [...targetNote.backlinks, sourceNoteId]
               });
          }
     }

     // Remove backlinks
     for (const targetTitle of removedLinks) {
          const targetNote = await db.notes.where('title').equals(targetTitle).first();
          if (targetNote) {
               await db.notes.update(targetNote.id, {
                    backlinks: targetNote.backlinks.filter(id => id !== sourceNoteId)
               });
          }
     }
}

/**
 * Get all notes
 */
export async function getAllNotes(): Promise<Note[]> {
     return db.notes.toArray();
}

/**
 * Get note by ID
 */
export async function getNoteById(id: string): Promise<Note | undefined> {
     return db.notes.get(id);
}

/**
 * Get note by title
 */
export async function getNoteByTitle(title: string): Promise<Note | undefined> {
     return db.notes.where('title').equals(title).first();
}

/**
 * Search notes
 */
export async function searchNotes(query: string): Promise<Note[]> {
     const lowerQuery = query.toLowerCase();
     return db.notes
          .filter(note =>
               note.title.toLowerCase().includes(lowerQuery) ||
               note.content.toLowerCase().includes(lowerQuery) ||
               note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
          )
          .toArray();
}

/**
 * Get notes by tag
 */
export async function getNotesByTag(tag: string): Promise<Note[]> {
     return db.notes.where('tags').equals(tag).toArray();
}

/**
 * Get recent notes
 */
export async function getRecentNotes(limit: number = 10): Promise<Note[]> {
     return db.notes
          .orderBy('metadata.updatedAt')
          .reverse()
          .limit(limit)
          .toArray();
}

// ==========================================================================
// FOLDER OPERATIONS
// ==========================================================================

/**
 * Create a folder
 */
export async function createFolder(
     name: string,
     parentId?: string
): Promise<Folder> {
     const folders = parentId
          ? await db.folders.where('parentId').equals(parentId).toArray()
          : await db.folders.where('parentId').equals('').toArray();

     const folder: Folder = {
          id: generateId(),
          name,
          parentId,
          isExpanded: true,
          createdAt: new Date(),
          order: folders.length
     };

     await db.folders.add(folder);
     return folder;
}

/**
 * Get all folders
 */
export async function getAllFolders(): Promise<Folder[]> {
     return db.folders.orderBy('order').toArray();
}

// ==========================================================================
// CANVAS OPERATIONS
// ==========================================================================

/**
 * Create a canvas
 */
export async function createCanvas(name: string = 'Untitled Canvas'): Promise<Canvas> {
     const now = new Date();
     const canvas: Canvas = {
          id: generateId(),
          name,
          elements: [],
          connections: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          createdAt: now,
          updatedAt: now
     };

     await db.canvases.add(canvas);
     return canvas;
}

/**
 * Update canvas
 */
export async function updateCanvas(
     id: string,
     updates: Partial<Canvas>
): Promise<Canvas | undefined> {
     const existing = await db.canvases.get(id);
     if (!existing) return undefined;

     const updated: Canvas = {
          ...existing,
          ...updates,
          updatedAt: new Date()
     };

     await db.canvases.put(updated);
     return updated;
}

/**
 * Get all canvases
 */
export async function getAllCanvases(): Promise<Canvas[]> {
     return db.canvases.toArray();
}

// ==========================================================================
// SETTINGS OPERATIONS
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

/**
 * Get UI settings
 */
export async function getSettings(): Promise<UISettings> {
     const stored = await db.settings.get('ui');
     return stored?.value as UISettings ?? DEFAULT_SETTINGS;
}

/**
 * Update UI settings
 */
export async function updateSettings(updates: Partial<UISettings>): Promise<UISettings> {
     const current = await getSettings();
     const updated = { ...current, ...updates };
     await db.settings.put({ key: 'ui', value: updated });
     return updated;
}

// ==========================================================================
// AI HISTORY OPERATIONS
// ==========================================================================

/**
 * Save AI response to history
 */
export async function saveAIResponse(response: AIResponse, noteId?: string): Promise<void> {
     await db.aiHistory.add({ ...response, noteId });
}

/**
 * Get AI history for a note
 */
export async function getAIHistoryForNote(noteId: string): Promise<AIResponse[]> {
     return db.aiHistory.where('noteId').equals(noteId).toArray() as Promise<AIResponse[]>;
}

// ==========================================================================
// DATABASE INITIALIZATION
// ==========================================================================

/**
 * Initialize database with sample data (for first launch)
 */
export async function initializeSampleVault(): Promise<void> {
     const noteCount = await db.notes.count();
     if (noteCount > 0) return; // Already has data

     // Create sample notes
     await createNote(
          'Welcome to Orrery',
          `# Welcome to Orrery 🌍

Your **premium second brain** for thinking, writing, and connecting ideas.

## Quick Start

1. Create notes using the **+ New Note** button or \`Cmd+N\`
2. Link notes together using [[Wiki-Style Links]]
3. Add #tags to organize your thoughts
4. View connections in the **Graph View**

## Key Features

- **Rich Text Editor** - Write in markdown with live preview
- **Wiki-style Linking** - Connect ideas with [[double brackets]]
- **Graph Visualization** - See how your notes connect
- **AI Assistant** - Enhance your writing and explore ideas
- **Canvas** - Visually organize research and concepts

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Cmd+K\` | Command Palette |
| \`Cmd+N\` | New Note |
| \`Cmd+G\` | Graph View |
| \`Cmd+/\` | Toggle AI Panel |

---

*Start exploring by creating your first note!*`,
          'note'
     );

     await createNote(
          'Getting Started with Writing',
          `# Getting Started with Writing ✍️

Welcome to your writing journey in Orrery!

## Writing Tips

Use the **slash command** menu by typing \`/\` to insert:
- Headings (\`/heading1\`, \`/heading2\`, \`/heading3\`)
- Quotes (\`/quote\`)
- Code blocks (\`/code\`)
- Images (\`/image\`)
- Tables (\`/table\`)

## Formatting

- **Bold** with \`**text**\`
- *Italic* with \`*text*\`
- ~~Strikethrough~~ with \`~~text~~\`
- \`Code\` with backticks

## Story Mode

For narrative writing, try the **Narrative Graph** feature:
1. Tag your note as a #story
2. Click the "Narrative Mode" toggle
3. Let AI help explore plot branches

## Related Notes

- [[Welcome to Orrery]]
- [[Character Development Guide]]

#writing #tutorial`,
          'note'
     );

     await createNote(
          'Character Development Guide',
          `# Character Development Guide 🎭

Creating compelling characters for your stories.

## Core Components

### 1. Motivation
What drives your character? Their deepest desires and fears shape every decision.

### 2. Backstory
Past experiences that shaped who they are today.

### 3. Character Arc
How will they change throughout the story?

## Character Template

\`\`\`
Name: 
Age:
Occupation:
Core Motivation:
Greatest Fear:
Key Relationships:
Internal Conflict:
External Goal:
\`\`\`

## Example: Sarah Mitchell

A detective haunted by her partner's betrayal. She struggles between upholding the law and seeking personal justice.

- **Motivation**: Prove her innocence
- **Fear**: Becoming what she hunts
- **Arc**: Learning to trust again

## Tips for Writers

1. Give characters contradictions
2. Let their flaws drive conflict
3. Show growth through choices

Related: [[Getting Started with Writing]] | [[World Building Notes]]

#character #story #writing`,
          'story'
     );

     await createNote(
          'World Building Notes',
          `# World Building Notes 🌍

Creating immersive settings for your narratives.

## Elements of World Building

### Physical World
- Geography and climate
- Architecture and settlements
- Flora and fauna

### Social Structure
- Government systems
- Economic systems
- Cultural norms

### History
- Key events
- Legends and myths
- Conflicts and alliances

## Questions to Answer

1. What makes this world unique?
2. How does the environment affect daily life?
3. What are the sources of conflict?
4. What are the rules (magic, technology, etc.)?

## Research Methods

- Study real-world analogues
- Create detailed maps
- Write in-world documents
- Develop languages and naming conventions

---

Connect to: [[Character Development Guide]]

#worldbuilding #story #research`,
          'research'
     );

     await createNote(
          'Project Ideas',
          `# Project Ideas 💡

A collection of ideas to explore.

## Writing Projects

- [ ] Short story: "The Last Library"
- [ ] Novel outline: Detective noir series
- [ ] Blog post: Productivity with graph thinking

## Research Topics

- [ ] History of knowledge management
- [ ] Neural networks and creativity
- [ ] Second brain methodologies

## Learning Goals

- [ ] Master graph visualization
- [ ] Improve narrative structure
- [ ] Study character archetypes

## Quick Captures

> "The best ideas come from connecting unexpected concepts."

> "Write first, edit later."

---

#ideas #projects #todo`,
          'note'
     );

     // Create sample folders
     await createFolder('Writing');
     await createFolder('Research');
     await createFolder('Projects');
}
