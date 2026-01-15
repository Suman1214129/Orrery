// ==========================================================================
// GRAPH LAYOUT ALGORITHMS - Adaptive Positioning
// ==========================================================================
import type { Checkpoint, CheckpointRelationship, GraphLayoutType, DetectedNoteType } from '@/types';

export interface LayoutNode {
     id: string;
     x: number;
     y: number;
     width: number;
     height: number;
     checkpoint: Checkpoint;
}

export interface LayoutEdge {
     id: string;
     sourceId: string;
     targetId: string;
     sourceX: number;
     sourceY: number;
     targetX: number;
     targetY: number;
     relationship: CheckpointRelationship;
}

export interface GraphLayout {
     nodes: LayoutNode[];
     edges: LayoutEdge[];
     bounds: {
          width: number;
          height: number;
          minX: number;
          minY: number;
     };
}

// Node dimensions
const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const NODE_SPACING_X = 250;
const NODE_SPACING_Y = 120;

// ==========================================================================
// LAYOUT SELECTOR
// ==========================================================================
export function calculateLayout(
     checkpoints: Checkpoint[],
     relationships: CheckpointRelationship[],
     layoutType: GraphLayoutType,
     containerWidth: number,
     containerHeight: number
): GraphLayout {
     switch (layoutType) {
          case 'horizontal-timeline':
               return horizontalTimelineLayout(checkpoints, relationships, containerWidth, containerHeight);
          case 'hierarchical-tree':
               return hierarchicalTreeLayout(checkpoints, relationships, containerWidth, containerHeight);
          case 'vertical-debate':
               return verticalDebateLayout(checkpoints, relationships, containerWidth, containerHeight);
          case 'branching-tree':
               return branchingTreeLayout(checkpoints, relationships, containerWidth, containerHeight);
          case 'network-web':
               return networkWebLayout(checkpoints, relationships, containerWidth, containerHeight);
          case 'action-board':
               return actionBoardLayout(checkpoints, relationships, containerWidth, containerHeight);
          case 'flow-diagram':
               return flowDiagramLayout(checkpoints, relationships, containerWidth, containerHeight);
          default:
               return networkWebLayout(checkpoints, relationships, containerWidth, containerHeight);
     }
}

// ==========================================================================
// HORIZONTAL TIMELINE - Story, Process, Journal
// ==========================================================================
function horizontalTimelineLayout(
     checkpoints: Checkpoint[],
     relationships: CheckpointRelationship[],
     containerWidth: number,
     containerHeight: number
): GraphLayout {
     const nodes: LayoutNode[] = [];
     const centerY = containerHeight / 2 - NODE_HEIGHT / 2;
     const startX = 50;

     checkpoints.forEach((checkpoint, index) => {
          nodes.push({
               id: checkpoint.id,
               x: startX + index * NODE_SPACING_X,
               y: centerY + (index % 2 === 0 ? 0 : 40), // Slight zigzag
               width: NODE_WIDTH,
               height: NODE_HEIGHT,
               checkpoint,
          });
     });

     const edges = createEdges(nodes, relationships);
     const bounds = calculateBounds(nodes);

     return { nodes, edges, bounds };
}

// ==========================================================================
// HIERARCHICAL TREE - Research, Technical
// ==========================================================================
function hierarchicalTreeLayout(
     checkpoints: Checkpoint[],
     relationships: CheckpointRelationship[],
     containerWidth: number,
     containerHeight: number
): GraphLayout {
     const nodes: LayoutNode[] = [];

     // Group by importance (higher importance = higher in tree)
     const sorted = [...checkpoints].sort((a, b) => b.importance - a.importance);

     // Create levels based on importance
     const levels: Checkpoint[][] = [];
     sorted.forEach((cp) => {
          const levelIndex = Math.min(Math.floor((10 - cp.importance) / 3), 3);
          if (!levels[levelIndex]) levels[levelIndex] = [];
          levels[levelIndex].push(cp);
     });

     // Position nodes
     levels.forEach((level, levelIndex) => {
          const levelWidth = level.length * NODE_SPACING_X;
          const startX = (containerWidth - levelWidth) / 2 + NODE_WIDTH / 2;

          level.forEach((checkpoint, nodeIndex) => {
               nodes.push({
                    id: checkpoint.id,
                    x: startX + nodeIndex * NODE_SPACING_X,
                    y: 50 + levelIndex * NODE_SPACING_Y,
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT,
                    checkpoint,
               });
          });
     });

     const edges = createEdges(nodes, relationships);
     const bounds = calculateBounds(nodes);

     return { nodes, edges, bounds };
}

// ==========================================================================
// VERTICAL DEBATE - Argument
// ==========================================================================
function verticalDebateLayout(
     checkpoints: Checkpoint[],
     relationships: CheckpointRelationship[],
     containerWidth: number,
     containerHeight: number
): GraphLayout {
     const nodes: LayoutNode[] = [];
     const centerX = containerWidth / 2 - NODE_WIDTH / 2;

     // Order: thesis → supports → counters → rebuttals → conclusion
     const typeOrder: Record<string, number> = {
          'thesis': 0,
          'supporting-point': 1,
          'counterargument': 2,
          'rebuttal': 3,
          'essay-conclusion': 4,
     };

     const sorted = [...checkpoints].sort((a, b) => {
          return (typeOrder[a.type] ?? 5) - (typeOrder[b.type] ?? 5);
     });

     sorted.forEach((checkpoint, index) => {
          // Offset supports left, counters right
          let xOffset = 0;
          if (checkpoint.type === 'supporting-point') xOffset = -120;
          if (checkpoint.type === 'counterargument') xOffset = 120;

          nodes.push({
               id: checkpoint.id,
               x: centerX + xOffset,
               y: 50 + index * NODE_SPACING_Y,
               width: NODE_WIDTH,
               height: NODE_HEIGHT,
               checkpoint,
          });
     });

     const edges = createEdges(nodes, relationships);
     const bounds = calculateBounds(nodes);

     return { nodes, edges, bounds };
}

// ==========================================================================
// BRANCHING TREE - Decision
// ==========================================================================
function branchingTreeLayout(
     checkpoints: Checkpoint[],
     relationships: CheckpointRelationship[],
     containerWidth: number,
     containerHeight: number
): GraphLayout {
     const nodes: LayoutNode[] = [];
     const centerX = containerWidth / 2 - NODE_WIDTH / 2;

     // Order: problem → criteria → options (spread) → decisions
     const typeOrder: Record<string, number> = {
          'problem': 0,
          'criteria': 1,
          'option': 2,
          'trade-off': 3,
          'decision-made': 4,
     };

     const sorted = [...checkpoints].sort((a, b) => {
          return (typeOrder[a.type] ?? 5) - (typeOrder[b.type] ?? 5);
     });

     let optionCount = 0;
     sorted.forEach((checkpoint, index) => {
          let x = centerX;
          let y = 50 + index * NODE_SPACING_Y;

          // Spread options horizontally
          if (checkpoint.type === 'option') {
               const totalOptions = checkpoints.filter((c) => c.type === 'option').length;
               const spread = (totalOptions - 1) * 150;
               x = centerX - spread / 2 + optionCount * 150;
               optionCount++;
               y = 50 + 2 * NODE_SPACING_Y;
          }

          nodes.push({
               id: checkpoint.id,
               x,
               y,
               width: NODE_WIDTH,
               height: NODE_HEIGHT,
               checkpoint,
          });
     });

     const edges = createEdges(nodes, relationships);
     const bounds = calculateBounds(nodes);

     return { nodes, edges, bounds };
}

// ==========================================================================
// NETWORK WEB - Concept, Brainstorm
// ==========================================================================
function networkWebLayout(
     checkpoints: Checkpoint[],
     relationships: CheckpointRelationship[],
     containerWidth: number,
     containerHeight: number
): GraphLayout {
     const nodes: LayoutNode[] = [];
     const centerX = containerWidth / 2;
     const centerY = containerHeight / 2;
     const radius = Math.min(containerWidth, containerHeight) * 0.35;

     // Most important node goes in center
     const sorted = [...checkpoints].sort((a, b) => b.importance - a.importance);

     sorted.forEach((checkpoint, index) => {
          if (index === 0) {
               // Center node
               nodes.push({
                    id: checkpoint.id,
                    x: centerX - NODE_WIDTH / 2,
                    y: centerY - NODE_HEIGHT / 2,
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT,
                    checkpoint,
               });
          } else {
               // Arrange in circle
               const angle = ((index - 1) / (sorted.length - 1)) * 2 * Math.PI;
               nodes.push({
                    id: checkpoint.id,
                    x: centerX + Math.cos(angle) * radius - NODE_WIDTH / 2,
                    y: centerY + Math.sin(angle) * radius - NODE_HEIGHT / 2,
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT,
                    checkpoint,
               });
          }
     });

     const edges = createEdges(nodes, relationships);
     const bounds = calculateBounds(nodes);

     return { nodes, edges, bounds };
}

// ==========================================================================
// ACTION BOARD - Meeting
// ==========================================================================
function actionBoardLayout(
     checkpoints: Checkpoint[],
     relationships: CheckpointRelationship[],
     containerWidth: number,
     containerHeight: number
): GraphLayout {
     const nodes: LayoutNode[] = [];

     // Group by type into columns
     const columns: Record<string, Checkpoint[]> = {
          'topic': [],
          'discussion-point': [],
          'action-item': [],
          'deadline': [],
     };

     checkpoints.forEach((cp) => {
          const col = columns[cp.type] || [];
          col.push(cp);
          columns[cp.type] = col;
     });

     const columnOrder = ['topic', 'discussion-point', 'action-item', 'deadline'];
     const columnWidth = containerWidth / 4;

     columnOrder.forEach((colType, colIndex) => {
          const items = columns[colType] || [];
          items.forEach((checkpoint, rowIndex) => {
               nodes.push({
                    id: checkpoint.id,
                    x: 30 + colIndex * columnWidth,
                    y: 50 + rowIndex * (NODE_HEIGHT + 20),
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT,
                    checkpoint,
               });
          });
     });

     const edges = createEdges(nodes, relationships);
     const bounds = calculateBounds(nodes);

     return { nodes, edges, bounds };
}

// ==========================================================================
// FLOW DIAGRAM - Technical
// ==========================================================================
function flowDiagramLayout(
     checkpoints: Checkpoint[],
     relationships: CheckpointRelationship[],
     containerWidth: number,
     containerHeight: number
): GraphLayout {
     // Similar to horizontal but with vertical grouping for connected flows
     return horizontalTimelineLayout(checkpoints, relationships, containerWidth, containerHeight);
}

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================
function createEdges(nodes: LayoutNode[], relationships: CheckpointRelationship[]): LayoutEdge[] {
     return relationships.map((rel) => {
          const sourceNode = nodes.find((n) => n.id === rel.sourceId);
          const targetNode = nodes.find((n) => n.id === rel.targetId);

          if (!sourceNode || !targetNode) {
               return null;
          }

          return {
               id: rel.id,
               sourceId: rel.sourceId,
               targetId: rel.targetId,
               sourceX: sourceNode.x + sourceNode.width / 2,
               sourceY: sourceNode.y + sourceNode.height / 2,
               targetX: targetNode.x + targetNode.width / 2,
               targetY: targetNode.y + targetNode.height / 2,
               relationship: rel,
          };
     }).filter(Boolean) as LayoutEdge[];
}

function calculateBounds(nodes: LayoutNode[]): GraphLayout['bounds'] {
     if (nodes.length === 0) {
          return { width: 0, height: 0, minX: 0, minY: 0 };
     }

     let minX = Infinity;
     let minY = Infinity;
     let maxX = -Infinity;
     let maxY = -Infinity;

     nodes.forEach((node) => {
          minX = Math.min(minX, node.x);
          minY = Math.min(minY, node.y);
          maxX = Math.max(maxX, node.x + node.width);
          maxY = Math.max(maxY, node.y + node.height);
     });

     return {
          width: maxX - minX + 100,
          height: maxY - minY + 100,
          minX: minX - 50,
          minY: minY - 50,
     };
}

// ==========================================================================
// LAYOUT TYPE SELECTOR BASED ON NOTE TYPE
// ==========================================================================
export function getLayoutForNoteType(noteType: DetectedNoteType): GraphLayoutType {
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

     return layoutMap[noteType];
}
