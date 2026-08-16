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

     await createNote(
          'The Thirsty Crow',
          `# The Thirsty Crow

*A timeless fable of wit, perseverance, and the triumph of ingenuity over adversity.*

---

## Prologue

In the heart of a vast, sun-scorched land, where the earth cracked like old parchment and the air shimmered with relentless heat, there lived a crow of uncommon intelligence. He was sleek and dark as midnight, with eyes that caught the light like polished obsidian — eyes that missed nothing.

---

## Part I — The Drought

It had not rained in forty days.

The rivers had retreated into memory. The ponds had surrendered to the sun. Even the oldest trees, whose roots reached deep into the earth's secrets, had begun to whisper of surrender.

The crow had flown since dawn — over cracked riverbeds, over wilting fields, over villages where even the cattle stood still, too weary to search for shade. His throat burned. His wings, usually so effortless, now felt heavy as stone.

> *"A thirsty crow is a desperate crow,"* the old birds used to say. *"And a desperate crow is a dangerous one."*

But the crow was not yet desperate. He was still thinking.

---

## Part II — The Discovery

It was the glint that saved him.

Half-hidden beneath the sprawling arms of an ancient oak, half-buried in dry leaves and forgotten by the world — a clay pitcher. Tall, round-bellied, and unmistakably promising.

The crow descended in a slow spiral, landing on the pitcher's rim with the careful grace of one who has learned not to celebrate too soon.

He peered inside.

Water. Dark, cool, and real — but cruelly low. The waterline sat far below his reach, no matter how he stretched, no matter how he angled his beak. The pitcher was deep, and the water was deep within it, and between them lay an impossible distance.

He tried once. Twice. A third time.

Nothing.

---

## Part III — The Temptation of Giving Up

For a long moment, the crow sat motionless on the rim.

The easy choice lay before him — fly on, search elsewhere, hope for a miracle further down the road. Many would have taken it. Many had.

But the crow looked at the water, and then he looked at the ground around him, and he began to *think*.

The ground was littered with pebbles. Small, smooth, and plentiful — the quiet debris of a world that had no use for them.

*Until now.*

---

## Part IV — The Solution

One by one, the crow picked up the pebbles in his beak and dropped them into the pitcher.

It was slow work. Painstaking work. The sun did not pause for him. His thirst did not ease. But with each pebble, the water climbed — imperceptibly at first, then with growing certainty, like a tide answering a distant moon.

**Pebble by pebble. Drop by drop. Rise by rise.**

The other birds watched from the branches above, some with curiosity, some with amusement, some with the quiet envy of those who had already given up and resented those who had not.

*"It will never work,"* one sparrow muttered.

The crow did not reply. He was busy.

---

## Part V — The Reward

When the water finally kissed the rim of the pitcher, the crow drank.

Not greedily — but deeply, deliberately, with the full presence of one who has earned every drop. The water was cool against his parched throat, clean and ancient and perfect.

Around him, the world was still hot. The drought had not broken. The earth was still cracked, the sky still pale and merciless.

But the crow had water. And the crow had something more — the quiet, unshakeable knowledge that *he had solved the unsolvable.*

---

## Epilogue — What the Crow Knew

The crow flew home that evening with steady wings.

He had not found a river. He had not prayed for rain. He had looked at what was available — ordinary pebbles, an ordinary pitcher, an ordinary mind — and he had made them extraordinary through patience and purpose.

This is the oldest lesson, and the hardest to learn:

> *The solution is rarely dramatic. It is usually small, and slow, and right in front of you — waiting for someone patient enough to begin.*

---

## Moral

**Little by little does the trick.**

Where brute force fails, ingenuity prevails. The greatest problems are not solved in a single stroke of genius — they are dismantled, pebble by pebble, by those who refuse to walk away.

---

*Try the **AI Graph** view to visualize the story's key moments and explore alternative paths the crow could have taken.*

#story #fable #classic #wisdom`,
          'story'
     );
}
