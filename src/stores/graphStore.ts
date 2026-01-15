// ==========================================================================
// INTELLIGENT GRAPH STORE - Zustand State Management
// ==========================================================================
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
     Note,
     DetectedNoteType,
     Checkpoint,
     CheckpointRelationship,
     SpeculativeBranch,
     GraphLayoutType,
     IntelligentGraphData,
} from '@/types';
import {
     detectNoteType,
     extractCheckpoints,
     analyzeRelationships,
     generateWhatIfBranches,
} from '@/lib/ai';

// ==========================================================================
// STORE INTERFACE
// ==========================================================================
interface GraphState {
     // Analysis state
     isAnalyzing: boolean;
     analysisProgress: number;
     analysisStep: string;
     analyzedNoteId: string | null;
     detectedNoteType: DetectedNoteType | null;
     typeConfidence: number;
     checkpoints: Checkpoint[];
     relationships: CheckpointRelationship[];
     suggestedLayout: GraphLayoutType;

     // Exploration state
     selectedCheckpointId: string | null;
     speculativeBranches: SpeculativeBranch[];
     isGeneratingBranches: boolean;

     // Graph mode
     graphMode: 'link-graph' | 'intelligent-graph';

     // Graph visualization settings
     graphSettings: {
          nodeSize: number;
          linkStrength: number;
          repulsionForce: number;
          nodeAppearance: 'point' | 'circle' | 'icon' | 'card';
          showLabels: boolean;
          animationSpeed: number;
          chargeStrength: number;
     };

     // Actions
     setGraphMode: (mode: 'link-graph' | 'intelligent-graph') => void;
     updateGraphSettings: (settings: Partial<GraphState['graphSettings']>) => void;
     resetGraphSettings: () => void;
     analyzeNote: (note: Note) => Promise<IntelligentGraphData | null>;
     selectCheckpoint: (checkpointId: string | null) => void;
     generateAlternatives: (
          checkpoint: Checkpoint,
          whatIfQuestion: string,
          noteContent: string
     ) => Promise<SpeculativeBranch[]>;
     clearSpeculativeBranches: () => void;
     clearAnalysis: () => void;

     // Getters
     getSelectedCheckpoint: () => Checkpoint | null;
     getCheckpointById: (id: string) => Checkpoint | undefined;
}

// ==========================================================================
// STORE IMPLEMENTATION
// ==========================================================================
export const useGraphStore = create<GraphState>()(
     devtools(
          (set, get) => ({
               // Initial state
               isAnalyzing: false,
               analysisProgress: 0,
               analysisStep: '',
               analyzedNoteId: null,
               detectedNoteType: null,
               typeConfidence: 0,
               checkpoints: [],
               relationships: [],
               suggestedLayout: 'network-web',
               selectedCheckpointId: null,
               speculativeBranches: [],
               isGeneratingBranches: false,
               graphMode: 'link-graph',

               // Default graph settings
               graphSettings: {
                    nodeSize: 8,
                    linkStrength: 0.5,
                    repulsionForce: 300,
                    nodeAppearance: 'circle' as const,
                    showLabels: true,
                    animationSpeed: 1,
                    chargeStrength: -200,
               },

               // ==========================================================================
               // MODE SWITCHING
               // ==========================================================================
               setGraphMode: (mode) => {
                    set({ graphMode: mode });
                    if (mode === 'link-graph') {
                         get().clearAnalysis();
                    }
               },

               // ==========================================================================
               // GRAPH SETTINGS
               // ==========================================================================
               updateGraphSettings: (settings) => {
                    set((state) => ({
                         graphSettings: { ...state.graphSettings, ...settings }
                    }));
               },

               resetGraphSettings: () => {
                    set({
                         graphSettings: {
                              nodeSize: 8,
                              linkStrength: 0.5,
                              repulsionForce: 300,
                              nodeAppearance: 'circle',
                              showLabels: true,
                              animationSpeed: 1,
                              chargeStrength: -200,
                         }
                    });
               },

               // ==========================================================================
               // ANALYSIS
               // ==========================================================================
               analyzeNote: async (note) => {
                    set({
                         isAnalyzing: true,
                         analysisProgress: 0,
                         analysisStep: 'Detecting note type...',
                         analyzedNoteId: note.id,
                    });

                    try {
                         // Step 1: Detect note type
                         set({ analysisProgress: 20, analysisStep: 'Detecting note type...' });
                         const typeResult = await detectNoteType(note.content);

                         if (!typeResult) {
                              throw new Error('Failed to detect note type');
                         }

                         set({
                              detectedNoteType: typeResult.type,
                              typeConfidence: typeResult.confidence,
                              analysisProgress: 40,
                              analysisStep: 'Extracting checkpoints...',
                         });

                         // Step 2: Extract checkpoints
                         const checkpoints = await extractCheckpoints(note.content, typeResult.type);

                         set({
                              checkpoints,
                              analysisProgress: 70,
                              analysisStep: 'Analyzing relationships...',
                         });

                         // Step 3: Analyze relationships
                         const relationships = await analyzeRelationships(checkpoints, typeResult.type);

                         // Determine layout based on type
                         const layoutMap: Record<DetectedNoteType, GraphLayoutType> = {
                              story: 'horizontal-timeline',
                              research: 'hierarchical-tree',
                              argument: 'vertical-debate',
                              process: 'horizontal-timeline',
                              decision: 'branching-tree',
                              concept: 'network-web',
                              meeting: 'action-board',
                              technical: 'flow-diagram',
                              journal: 'horizontal-timeline',
                              brainstorm: 'network-web',
                         };

                         const graphData: IntelligentGraphData = {
                              noteId: note.id,
                              detectedType: typeResult.type,
                              typeConfidence: typeResult.confidence,
                              checkpoints,
                              relationships,
                              suggestedLayout: layoutMap[typeResult.type],
                              analyzedAt: new Date(),
                         };

                         set({
                              relationships,
                              suggestedLayout: layoutMap[typeResult.type],
                              analysisProgress: 100,
                              analysisStep: 'Complete',
                              isAnalyzing: false,
                         });

                         return graphData;
                    } catch (error) {
                         console.error('Analysis failed:', error);
                         set({
                              isAnalyzing: false,
                              analysisProgress: 0,
                              analysisStep: 'Analysis failed',
                         });
                         return null;
                    }
               },

               // ==========================================================================
               // CHECKPOINT SELECTION
               // ==========================================================================
               selectCheckpoint: (checkpointId) => {
                    set({
                         selectedCheckpointId: checkpointId,
                         speculativeBranches: [], // Clear branches when selecting new checkpoint
                    });
               },

               // ==========================================================================
               // WHAT-IF EXPLORATION
               // ==========================================================================
               generateAlternatives: async (checkpoint, whatIfQuestion, noteContent) => {
                    set({ isGeneratingBranches: true });

                    try {
                         const { detectedNoteType, checkpoints } = get();

                         if (!detectedNoteType) {
                              throw new Error('No note type detected');
                         }

                         const branches = await generateWhatIfBranches(
                              checkpoint,
                              whatIfQuestion,
                              noteContent,
                              detectedNoteType,
                              checkpoints
                         );

                         set({
                              speculativeBranches: branches,
                              isGeneratingBranches: false,
                         });

                         return branches;
                    } catch (error) {
                         console.error('Branch generation failed:', error);
                         set({ isGeneratingBranches: false });
                         return [];
                    }
               },

               clearSpeculativeBranches: () => {
                    set({ speculativeBranches: [] });
               },

               // ==========================================================================
               // CLEANUP
               // ==========================================================================
               clearAnalysis: () => {
                    set({
                         isAnalyzing: false,
                         analysisProgress: 0,
                         analysisStep: '',
                         analyzedNoteId: null,
                         detectedNoteType: null,
                         typeConfidence: 0,
                         checkpoints: [],
                         relationships: [],
                         selectedCheckpointId: null,
                         speculativeBranches: [],
                         suggestedLayout: 'network-web',
                    });
               },

               // ==========================================================================
               // GETTERS
               // ==========================================================================
               getSelectedCheckpoint: () => {
                    const { checkpoints, selectedCheckpointId } = get();
                    return checkpoints.find((c) => c.id === selectedCheckpointId) || null;
               },

               getCheckpointById: (id) => {
                    return get().checkpoints.find((c) => c.id === id);
               },
          }),
          { name: 'orrery-graph-store' }
     )
);
