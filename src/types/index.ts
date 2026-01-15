// ==========================================================================
// ORRERY CORE TYPES
// ==========================================================================

// ==========================================================================
// NOTE TYPES
// ==========================================================================
export type NoteType = 'note' | 'story' | 'research' | 'canvas';

export interface NoteMetadata {
     wordCount: number;
     readTime: number;
     type: NoteType;
     createdAt: Date;
     updatedAt: Date;
}

export interface Note {
     id: string;
     title: string;
     content: string; // Markdown content
     excerpt?: string; // First 200 characters for previews
     tags: string[];
     linkedNotes: string[]; // IDs of notes this note links to
     backlinks: string[]; // IDs of notes that link to this note
     metadata: NoteMetadata;
     isPinned: boolean;
     isArchived: boolean;
     folderId?: string;
}

export interface Folder {
     id: string;
     name: string;
     parentId?: string;
     isExpanded: boolean;
     createdAt: Date;
     order: number;
}

// ==========================================================================
// CANVAS TYPES
// ==========================================================================
export type CanvasElementType = 'text' | 'note' | 'image' | 'embed' | 'group' | 'ai-bubble';

export interface Position {
     x: number;
     y: number;
}

export interface Size {
     width: number;
     height: number;
}

export interface CanvasElement {
     id: string;
     type: CanvasElementType;
     position: Position;
     size: Size;
     content: string | NoteReference | ImageData | EmbedData;
     style?: CanvasElementStyle;
     groupId?: string;
}

export interface CanvasElementStyle {
     backgroundColor?: string;
     borderColor?: string;
     textColor?: string;
}

export interface NoteReference {
     noteId: string;
     title: string;
     excerpt: string;
}

export interface ImageData {
     url: string;
     alt?: string;
}

export interface EmbedData {
     url: string;
     type: 'youtube' | 'link' | 'pdf';
     title?: string;
}

export type ConnectionType = 'thematic' | 'causal' | 'temporal' | 'reference';

export interface CanvasConnection {
     id: string;
     source: string;
     target: string;
     type: ConnectionType;
     label?: string;
}

export interface Canvas {
     id: string;
     name: string;
     elements: CanvasElement[];
     connections: CanvasConnection[];
     viewport: {
          x: number;
          y: number;
          zoom: number;
     };
     createdAt: Date;
     updatedAt: Date;
}

// ==========================================================================
// GRAPH TYPES
// ==========================================================================
export interface GraphNode {
     id: string;
     noteId: string;
     title: string;
     tags: string[];
     wordCount: number;
     connections: number;
     x?: number;
     y?: number;
     type: NoteType;
}

export interface GraphEdge {
     id: string;
     source: string;
     target: string;
     strength: number; // Based on connection count or relevance
}

export interface GraphData {
     nodes: GraphNode[];
     edges: GraphEdge[];
}

export interface GraphSettings {
     showLabels: boolean;
     connectionStyle: 'straight' | 'curved';
     nodeSize: 'uniform' | 'wordcount';
     colorBy: 'type' | 'tag' | 'none';
}

// ==========================================================================
// NARRATIVE TYPES (Story Mode)
// ==========================================================================
export type NarrativeBranchStatus = 'unexplored' | 'exploring' | 'committed' | 'alternate';

export interface NarrativeBranch {
     id: string;
     name: string;
     description: string;
     consequence: string;
     nextDecision?: string;
     status: NarrativeBranchStatus;
     parentNodeId: string;
     childNodes: string[];
     content?: string; // Generated content for this branch
}

export interface NarrativeNode {
     id: string;
     type: 'plot-point' | 'decision' | 'branch';
     title: string;
     content: string;
     character?: string;
     position: Position;
     branches?: NarrativeBranch[];
     isCommitted: boolean;
}

export interface NarrativeGraph {
     id: string;
     noteId: string;
     nodes: NarrativeNode[];
     storyline: string[]; // Ordered list of committed node IDs
     createdAt: Date;
     updatedAt: Date;
}

// ==========================================================================
// INTELLIGENT GRAPH TYPES (Universal Thinking Tool)
// ==========================================================================
export type DetectedNoteType =
     | 'story'
     | 'research'
     | 'argument'
     | 'process'
     | 'decision'
     | 'concept'
     | 'meeting'
     | 'technical'
     | 'journal'
     | 'brainstorm';

export type CheckpointType =
     // Story
     | 'plot-event' | 'character-decision' | 'conflict' | 'scene-change' | 'resolution'
     // Research
     | 'hypothesis' | 'finding' | 'data-point' | 'insight' | 'research-question' | 'conclusion'
     // Argument
     | 'thesis' | 'supporting-point' | 'counterargument' | 'rebuttal' | 'essay-conclusion'
     // Process
     | 'step' | 'warning' | 'checkpoint' | 'branch-point' | 'completion'
     // Decision
     | 'problem' | 'criteria' | 'option' | 'trade-off' | 'decision-made'
     // Concept
     | 'concept-definition' | 'relationship' | 'implication' | 'philosophical-question'
     // Meeting
     | 'topic' | 'discussion-point' | 'action-item' | 'deadline'
     // Technical
     | 'function' | 'input' | 'output' | 'error-case' | 'example'
     // Journal
     | 'emotional-state' | 'event' | 'reflection' | 'future-intent'
     // Brainstorm
     | 'core-idea' | 'feature' | 'connection' | 'promising' | 'rejected';

export type GraphLayoutType =
     | 'horizontal-timeline'
     | 'hierarchical-tree'
     | 'vertical-debate'
     | 'branching-tree'
     | 'network-web'
     | 'action-board'
     | 'flow-diagram';

export interface Checkpoint {
     id: string;
     title: string;
     content: string;
     excerpt: string;
     type: CheckpointType;
     noteType: DetectedNoteType;
     importance: number; // 1-10
     position: {
          startOffset: number;
          endOffset: number;
     };
     metadata?: {
          characters?: string[];
          tags?: string[];
          [key: string]: unknown;
     };
}

export interface CheckpointRelationship {
     id: string;
     sourceId: string;
     targetId: string;
     type: 'causal' | 'temporal' | 'supportive' | 'contradictory' | 'thematic' | 'sequential';
     strength: number; // 0-1
     description?: string;
}

export interface SpeculativeBranch {
     id: string;
     parentCheckpointId: string;
     whatIfQuestion: string;
     title: string;
     description: string;
     consequences: string;
     pros?: string[];
     cons?: string[];
     confidence: number; // 0-1
     nextCheckpoints: {
          title: string;
          description: string;
     }[];
     generatedAt: Date;
}

export interface IntelligentGraphData {
     noteId: string;
     detectedType: DetectedNoteType;
     typeConfidence: number;
     checkpoints: Checkpoint[];
     relationships: CheckpointRelationship[];
     suggestedLayout: GraphLayoutType;
     analyzedAt: Date;
}

// Note type visual configuration
export interface NoteTypeConfig {
     type: DetectedNoteType;
     label: string;
     icon: string;
     primaryColor: string;
     accentColor: string;
     layout: GraphLayoutType;
     quickScenarios: string[];
     checkpointTypes: CheckpointType[];
}

// ==========================================================================
// AI TYPES
// ==========================================================================
export type AIAction =
     | 'enhance'
     | 'expand'
     | 'summarize'
     | 'continue'
     | 'generateBranches'
     | 'organizeCanvas'
     | 'suggestLinks'
     | 'suggestTags';

export interface AISuggestion {
     id: string;
     type: 'link' | 'tag' | 'related' | 'enhancement';
     content: string;
     targetNoteId?: string;
     confidence: number; // 0-1
}

export interface AIContext {
     currentNote?: Note;
     selectedText?: string;
     recentNotes?: Note[];
     canvasElements?: CanvasElement[];
     storyContext?: {
          characters: string[];
          genre: string;
          previousEvents: string[];
     };
}

export interface AIRequest {
     action: AIAction;
     context: AIContext;
     options?: {
          creativityLevel?: number; // 0-100
          maxTokens?: number;
          temperature?: number;
     };
}

export interface AIResponse {
     id: string;
     action: AIAction;
     content: string;
     branches?: NarrativeBranch[];
     suggestions?: AISuggestion[];
     canvasLayout?: {
          groups: { id: string; name: string; items: string[] }[];
          connections: CanvasConnection[];
          layout: { itemId: string; x: number; y: number }[];
     };
     timestamp: Date;
}

// ==========================================================================
// UI STATE TYPES
// ==========================================================================
export type ViewMode = 'editor' | 'graph';
export type Theme = 'light' | 'dark' | 'sepia';

export interface UISettings {
     theme: Theme;
     sidebarWidth: number;
     aiPanelWidth: number;
     sidebarCollapsed: boolean;
     aiPanelCollapsed: boolean;
     editorWidth: number;
     fontSize: number;
     fontFamily: 'serif' | 'sans' | 'mono';
     lineHeight: number;
     showWordCount: boolean;
     vimMode: boolean;
}

export interface CommandPaletteItem {
     id: string;
     title: string;
     description?: string;
     icon?: string;
     shortcut?: string;
     action: () => void;
     category: 'navigation' | 'actions' | 'notes' | 'settings';
}

// ==========================================================================
// KEYBOARD SHORTCUT TYPES
// ==========================================================================
export interface KeyboardShortcut {
     id: string;
     key: string;
     modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[];
     description: string;
     action: string;
     category: 'global' | 'editor' | 'navigation' | 'graph' | 'canvas';
}

// ==========================================================================
// EVENT TYPES
// ==========================================================================
export interface NoteEvent {
     type: 'created' | 'updated' | 'deleted' | 'linked' | 'unlinked';
     noteId: string;
     timestamp: Date;
     data?: unknown;
}

export interface SearchResult {
     noteId: string;
     title: string;
     excerpt: string;
     matchType: 'title' | 'content' | 'tag';
     relevance: number;
}

// ==========================================================================
// FILTER & SORT TYPES
// ==========================================================================
export type SortField = 'title' | 'createdAt' | 'updatedAt' | 'wordCount';
export type SortDirection = 'asc' | 'desc';

export interface NoteFilters {
     tags?: string[];
     type?: NoteType;
     dateRange?: {
          start: Date;
          end: Date;
     };
     searchQuery?: string;
     isPinned?: boolean;
     folderId?: string;
}

export interface SortOptions {
     field: SortField;
     direction: SortDirection;
}
