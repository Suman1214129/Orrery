'use client';

// ==========================================================================
// INTELLIGENT GRAPH VIEW - Force-Directed Graph with Dynamic Physics
// ==========================================================================
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotesStore } from '@/stores/notesStore';
import { useUIStore } from '@/stores/uiStore';
import { useGraphStore } from '@/stores/graphStore';
import { NOTE_TYPE_CONFIGS, CHECKPOINT_TYPE_ICONS, getTypeColors } from '@/lib/graph/noteTypeConfig';
import { ExplorationPanel } from './ExplorationPanel';
import { GraphSettingsPanel } from './GraphSettingsPanel';
import type { Checkpoint, DetectedNoteType } from '@/types';

// ==========================================================================
// TYPES
// ==========================================================================
interface GraphNode extends d3.SimulationNodeDatum {
     id: string;
     checkpoint: Checkpoint;
     x?: number;
     y?: number;
     fx?: number | null;
     fy?: number | null;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
     id: string;
     type: string;
     strength: number;
}

// ==========================================================================
// COMPONENT
// ==========================================================================
export function IntelligentGraphView() {
     const { notes, currentNoteId } = useNotesStore();
     const { settings } = useUIStore();
     const {
          isAnalyzing,
          analysisProgress,
          analysisStep,
          detectedNoteType,
          typeConfidence,
          checkpoints,
          relationships,
          selectedCheckpointId,
          speculativeBranches,
          isGeneratingBranches,
          graphSettings,
          analyzeNote,
          selectCheckpoint,
          generateAlternatives,
          clearSpeculativeBranches,
     } = useGraphStore();

     const svgRef = useRef<SVGSVGElement>(null);
     const containerRef = useRef<HTMLDivElement>(null);
     const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
     const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

     // Get current note
     const currentNote = currentNoteId ? notes.get(currentNoteId) : null;
     const theme = settings.theme;

     // Theme colors based on note type
     const colors = useMemo(() => {
          if (!detectedNoteType) {
               return {
                    background: theme === 'dark' ? '#0a0a0a' : theme === 'sepia' ? '#F8F5EE' : '#fafafa',
                    text: theme === 'dark' ? '#e5e5e5' : theme === 'sepia' ? '#2C2416' : '#2a2a2a',
                    textMuted: theme === 'dark' ? '#a0a0a0' : theme === 'sepia' ? '#6B5D4F' : '#6b6b6b',
                    accent: theme === 'dark' ? '#7BA3C7' : theme === 'sepia' ? '#B8704F' : '#6366f1',
                    node: theme === 'dark' ? '#7BA3C7' : theme === 'sepia' ? '#B8704F' : '#6366f1',
                    nodeHover: theme === 'dark' ? '#9FC5E8' : theme === 'sepia' ? '#D4956F' : '#818cf8',
                    edge: theme === 'dark' ? '#3a3a3a' : theme === 'sepia' ? '#C9BFAE' : '#d1d5db',
               };
          }

          const typeColors = getTypeColors(detectedNoteType, theme);
          return {
               background: theme === 'dark' ? '#0a0a0a' : theme === 'sepia' ? '#F8F5EE' : typeColors.primary,
               text: typeColors.text,
               textMuted: typeColors.textMuted,
               accent: typeColors.accent,
               node: typeColors.accent,
               nodeHover: theme === 'dark' ? '#9FC5E8' : theme === 'sepia' ? '#D4956F' : '#818cf8',
               edge: theme === 'dark' ? '#3a3a3a' : theme === 'sepia' ? '#C9BFAE' : '#d1d5db',
          };
     }, [detectedNoteType, theme]);

     // Create graph data
     const graphData = useMemo(() => {
          if (checkpoints.length === 0) return null;

          const nodes: GraphNode[] = checkpoints.map((checkpoint, i) => ({
               id: checkpoint.id,
               checkpoint,
               x: dimensions.width / 2 + Math.cos(i * 0.5) * 100,
               y: dimensions.height / 2 + Math.sin(i * 0.5) * 100,
          }));

          const links: GraphLink[] = relationships.map(rel => ({
               id: rel.id,
               source: rel.sourceId,
               target: rel.targetId,
               type: rel.type,
               strength: rel.strength,
          }));

          return { nodes, links };
     }, [checkpoints, relationships, dimensions]);

     // Handle resize
     useEffect(() => {
          const handleResize = () => {
               if (containerRef.current) {
                    const { width, height } = containerRef.current.getBoundingClientRect();
                    setDimensions({ width, height });
               }
          };
          handleResize();
          window.addEventListener('resize', handleResize);
          return () => window.removeEventListener('resize', handleResize);
     }, []);

     // Handle analyze click
     const handleAnalyze = useCallback(async () => {
          if (currentNote) {
               await analyzeNote(currentNote);
          }
     }, [currentNote, analyzeNote]);

     // Handle node click
     const handleNodeClick = useCallback((checkpoint: Checkpoint) => {
          if (selectedCheckpointId === checkpoint.id) {
               selectCheckpoint(null);
          } else {
               selectCheckpoint(checkpoint.id);
          }
     }, [selectedCheckpointId, selectCheckpoint]);

     // Handle what-if generation
     const handleGenerateAlternatives = useCallback(async (question: string) => {
          const checkpoint = checkpoints.find(c => c.id === selectedCheckpointId);
          if (checkpoint && currentNote) {
               await generateAlternatives(checkpoint, question, currentNote.content);
          }
     }, [checkpoints, selectedCheckpointId, currentNote, generateAlternatives]);

     // D3 Force-Directed Graph with Constrained Left-to-Right Flow (Obsidian-style)
     useEffect(() => {
          if (!svgRef.current || !graphData) return;

          const svg = d3.select(svgRef.current);
          svg.selectAll('*').remove();

          const width = dimensions.width - (selectedCheckpointId ? 350 : 0);
          const height = dimensions.height;

          svg.attr('width', width).attr('height', height);

          // Create zoom behavior
          const zoom = d3.zoom<SVGSVGElement, unknown>()
               .scaleExtent([0.2, 4])
               .on('zoom', (event) => {
                    g.attr('transform', event.transform);
               });

          svg.call(zoom);

          const g = svg.append('g');

          // Create tooltip div
          const tooltip = d3.select('body').selectAll('.graph-tooltip').data([0])
               .join('div')
               .attr('class', 'graph-tooltip')
               .style('position', 'fixed')
               .style('pointer-events', 'none')
               .style('opacity', 0)
               .style('background', theme === 'dark' ? '#1a1a1a' : '#fff')
               .style('border', `1px solid ${colors.edge}`)
               .style('border-radius', '10px')
               .style('padding', '12px 16px')
               .style('box-shadow', '0 8px 32px rgba(0,0,0,0.2)')
               .style('max-width', '280px')
               .style('z-index', 1000);

          // Calculate target X positions based on sequence (maintains left-to-right flow)
          const nodeCount = graphData.nodes.length;
          const xSpacing = Math.min(180, (width - 150) / Math.max(1, nodeCount - 1));
          const startX = 100;

          graphData.nodes.forEach((node, i) => {
               (node as any).targetX = startX + i * xSpacing;
               node.x = (node as any).targetX + (Math.random() - 0.5) * 50;
               node.y = height / 2 + (Math.random() - 0.5) * 100;
          });

          // Arrow marker for links
          const defs = svg.append('defs');

          defs.append('marker')
               .attr('id', 'arrowhead')
               .attr('viewBox', '-0 -5 10 10')
               .attr('refX', graphSettings.nodeSize + 8)
               .attr('refY', 0)
               .attr('orient', 'auto')
               .attr('markerWidth', 6)
               .attr('markerHeight', 6)
               .append('path')
               .attr('d', 'M 0,-4 L 8,0 L 0,4')
               .attr('fill', '#696969')
               .attr('opacity', 0.6);

          // Glow filter for selected node
          const filter = defs.append('filter')
               .attr('id', 'glow')
               .attr('x', '-50%')
               .attr('y', '-50%')
               .attr('width', '200%')
               .attr('height', '200%');
          filter.append('feGaussianBlur')
               .attr('stdDeviation', '4')
               .attr('result', 'coloredBlur');
          const feMerge = filter.append('feMerge');
          feMerge.append('feMergeNode').attr('in', 'coloredBlur');
          feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

          // Create force simulation with constrained X positions
          const simulation = d3.forceSimulation<GraphNode>(graphData.nodes)
               .force('link', d3.forceLink<GraphNode, GraphLink>(graphData.links)
                    .id(d => d.id)
                    .distance(100)
                    .strength(0.3)
               )
               .force('charge', d3.forceManyBody()
                    .strength(-200)
               )
               .force('x', d3.forceX<GraphNode>()
                    .x(d => (d as any).targetX || width / 2)
                    .strength(0.8) // Strong force to maintain left-to-right order
               )
               .force('y', d3.forceY(height / 2).strength(0.1))
               .force('collision', d3.forceCollide().radius(graphSettings.nodeSize * 2.5))
               .alphaDecay(0.02);

          simulationRef.current = simulation;

          // Draw links with curved paths
          const linkGroup = g.append('g').attr('class', 'links');
          const links = linkGroup.selectAll<SVGPathElement, GraphLink>('path')
               .data(graphData.links)
               .join('path')
               .attr('fill', 'none')
               .attr('stroke', '#696969')
               .attr('stroke-width', 2)
               .attr('stroke-opacity', 0.5)
               .attr('marker-end', 'url(#arrowhead)');

          // Draw nodes
          const nodeGroup = g.append('g').attr('class', 'nodes');
          const nodes = nodeGroup.selectAll<SVGGElement, GraphNode>('g')
               .data(graphData.nodes)
               .join('g')
               .attr('cursor', 'grab')
               .call(d3.drag<SVGGElement, GraphNode>()
                    .on('start', function (event, d) {
                         if (!event.active) simulation.alphaTarget(0.3).restart();
                         d.fx = d.x;
                         d.fy = d.y;
                         d3.select(this).attr('cursor', 'grabbing');
                         d3.select(this).select('circle.main-node')
                              .transition()
                              .duration(100)
                              .attr('r', graphSettings.nodeSize * 1.4)
                              .style('filter', 'url(#glow)');
                    })
                    .on('drag', function (event, d) {
                         d.fx = event.x;
                         d.fy = event.y;
                    })
                    .on('end', function (event, d) {
                         if (!event.active) simulation.alphaTarget(0);
                         d.fx = null;
                         d.fy = null;
                         d3.select(this).attr('cursor', 'grab');
                         if (d.checkpoint.id !== selectedCheckpointId) {
                              d3.select(this).select('circle.main-node')
                                   .transition()
                                   .duration(200)
                                   .attr('r', graphSettings.nodeSize)
                                   .style('filter', 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))');
                         }
                    })
               );

          const totalNodes = graphData.nodes.length;

          // Outer ring for START node (pulsing green)
          nodes.filter((d, i) => i === 0)
               .append('circle')
               .attr('class', 'start-ring')
               .attr('r', graphSettings.nodeSize + 8)
               .attr('fill', 'none')
               .attr('stroke', '#22c55e')
               .attr('stroke-width', 3)
               .attr('stroke-opacity', 0.6);

          // Outer ring for END node (dashed red)
          nodes.filter((d, i) => i === totalNodes - 1)
               .append('circle')
               .attr('class', 'end-ring')
               .attr('r', graphSettings.nodeSize + 8)
               .attr('fill', 'none')
               .attr('stroke', '#ef4444')
               .attr('stroke-width', 3)
               .attr('stroke-dasharray', '8,4')
               .attr('stroke-opacity', 0.6);

          // Main node circle
          nodes.append('circle')
               .attr('class', 'main-node')
               .attr('r', graphSettings.nodeSize)
               .attr('fill', d => d.checkpoint.id === selectedCheckpointId ? colors.nodeHover : colors.node)
               .attr('stroke', d => d.checkpoint.id === selectedCheckpointId ? '#fff' : colors.edge)
               .attr('stroke-width', d => d.checkpoint.id === selectedCheckpointId ? 3 : 1.5)
               .style('filter', d =>
                    d.checkpoint.id === selectedCheckpointId
                         ? 'url(#glow)'
                         : 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))'
               );

          // Sequence number inside node
          nodes.append('text')
               .attr('text-anchor', 'middle')
               .attr('dominant-baseline', 'central')
               .attr('font-size', graphSettings.nodeSize * 0.65)
               .attr('font-weight', '700')
               .attr('fill', '#fff')
               .attr('pointer-events', 'none')
               .text((d, i) => (i + 1).toString());

          // Label below node
          if (graphSettings.showLabels) {
               nodes.append('text')
                    .attr('class', 'node-label')
                    .attr('y', graphSettings.nodeSize + 16)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '10px')
                    .attr('font-weight', '500')
                    .attr('fill', colors.text)
                    .attr('opacity', 0.85)
                    .attr('pointer-events', 'none')
                    .text(d => d.checkpoint.title.length > 14 ? d.checkpoint.title.substring(0, 14) + '…' : d.checkpoint.title);
          }

          // Click handler
          nodes.on('click', (event, d) => {
               event.stopPropagation();
               handleNodeClick(d.checkpoint);
          });

          // Hover effects
          nodes
               .on('mouseenter', function (event, d) {
                    if (d.checkpoint.id !== selectedCheckpointId) {
                         d3.select(this).select('circle.main-node')
                              .transition()
                              .duration(150)
                              .attr('r', graphSettings.nodeSize * 1.15)
                              .attr('fill', colors.nodeHover);
                    }

                    tooltip
                         .style('opacity', 1)
                         .style('left', (event.clientX + 20) + 'px')
                         .style('top', (event.clientY - 10) + 'px')
                         .html(`
                              <div style="font-weight: 600; color: ${colors.text}; margin-bottom: 8px; font-size: 14px;">
                                   ${d.checkpoint.title}
                              </div>
                              <div style="font-size: 10px; color: ${colors.accent}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                                   ${d.checkpoint.type.replace(/-/g, ' ')}
                              </div>
                              <div style="font-size: 12px; color: ${colors.textMuted}; line-height: 1.5;">
                                   ${d.checkpoint.excerpt.length > 120 ? d.checkpoint.excerpt.substring(0, 120) + '…' : d.checkpoint.excerpt}
                              </div>
                         `);
               })
               .on('mousemove', function (event) {
                    tooltip
                         .style('left', (event.clientX + 20) + 'px')
                         .style('top', (event.clientY - 10) + 'px');
               })
               .on('mouseleave', function (event, d) {
                    if (d.checkpoint.id !== selectedCheckpointId) {
                         d3.select(this).select('circle.main-node')
                              .transition()
                              .duration(150)
                              .attr('r', graphSettings.nodeSize)
                              .attr('fill', colors.node);
                    }
                    tooltip.style('opacity', 0);
               });

          // Simulation tick - update positions
          simulation.on('tick', () => {
               // Update link paths with smooth curves
               links.attr('d', d => {
                    const source = d.source as GraphNode;
                    const target = d.target as GraphNode;
                    if (!source.x || !source.y || !target.x || !target.y) return '';

                    const dx = target.x - source.x;
                    const dy = target.y - source.y;
                    // Curve intensity based on vertical distance
                    const dr = Math.sqrt(dx * dx + dy * dy) * 0.6;

                    return `M${source.x},${source.y} A${dr},${dr} 0 0,${dy > 0 ? 1 : 0} ${target.x},${target.y}`;
               });

               // Update node positions
               nodes.attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
          });

          // Initial zoom to fit
          setTimeout(() => {
               const padding = 80;
               svg.transition()
                    .duration(600)
                    .call(zoom.transform as never, d3.zoomIdentity
                         .translate(padding / 2, 0)
                         .scale(0.9));
          }, 300);

          // Cleanup
          return () => {
               simulation.stop();
               d3.select('.graph-tooltip').remove();
          };
     }, [graphData, dimensions, colors, selectedCheckpointId, handleNodeClick, graphSettings, theme]);

     // Get selected checkpoint
     const selectedCheckpoint = checkpoints.find(c => c.id === selectedCheckpointId);

     // ==========================================================================
     // RENDER
     // ==========================================================================
     return (
          <div
               ref={containerRef}
               className="relative h-full w-full overflow-hidden"
               style={{ backgroundColor: colors.background }}
          >
               {/* Graph Settings Panel */}
               <GraphSettingsPanel theme={theme} />

               {/* Empty / Initial State */}
               {!isAnalyzing && checkpoints.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                         <div className="text-center space-y-4 max-w-md p-8">
                              <div className="text-5xl mb-4">🧠</div>
                              <h2
                                   className="text-xl font-semibold"
                                   style={{ color: colors.text }}
                              >
                                   AI Graph
                              </h2>
                              <p
                                   className="text-sm"
                                   style={{ color: colors.textMuted }}
                              >
                                   Explore your thinking with an intelligent force-directed graph.
                                   AI will analyze your note, identify key checkpoints, and let you explore alternatives.
                              </p>
                              {currentNote ? (
                                   <Button
                                        onClick={handleAnalyze}
                                        className="mt-4"
                                        style={{
                                             backgroundColor: colors.accent,
                                             color: theme === 'dark' ? '#1a1a1a' : '#fff',
                                        }}
                                   >
                                        Analyze: {currentNote.title}
                                   </Button>
                              ) : (
                                   <p
                                        className="text-sm italic"
                                        style={{ color: colors.textMuted }}
                                   >
                                        Select a note to analyze
                                   </p>
                              )}
                         </div>
                    </div>
               )}

               {/* Analyzing State */}
               {isAnalyzing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                         <div className="text-center space-y-4 max-w-sm p-8">
                              <Loader2
                                   className="h-8 w-8 animate-spin mx-auto"
                                   style={{ color: colors.accent }}
                              />
                              <h3
                                   className="text-lg font-medium"
                                   style={{ color: colors.text }}
                              >
                                   Analyzing Your Note...
                              </h3>
                              <p
                                   className="text-sm"
                                   style={{ color: colors.textMuted }}
                              >
                                   {analysisStep}
                              </p>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                   <motion.div
                                        className="h-2 rounded-full"
                                        style={{ backgroundColor: colors.accent }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${analysisProgress}%` }}
                                        transition={{ duration: 0.3 }}
                                   />
                              </div>
                         </div>
                    </div>
               )}

               {/* Graph View */}
               {!isAnalyzing && checkpoints.length > 0 && (
                    <>
                         {/* Type indicator */}
                         <div
                              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg z-10"
                              style={{
                                   backgroundColor: theme === 'dark' ? '#1e1e1e' : theme === 'sepia' ? '#FFFDF8' : '#fff',
                                   boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              }}
                         >
                              <span className="text-xl">
                                   {detectedNoteType && NOTE_TYPE_CONFIGS[detectedNoteType]?.icon}
                              </span>
                              <div>
                                   <div
                                        className="text-sm font-medium"
                                        style={{ color: colors.text }}
                                   >
                                        {detectedNoteType && NOTE_TYPE_CONFIGS[detectedNoteType]?.label}
                                   </div>
                                   <div
                                        className="text-xs"
                                        style={{ color: colors.textMuted }}
                                   >
                                        {checkpoints.length} nodes • {Math.round(typeConfidence * 100)}% confidence
                                   </div>
                              </div>
                         </div>

                         {/* SVG Graph */}
                         <svg
                              ref={svgRef}
                              className="w-full h-full"
                              style={{ cursor: 'grab' }}
                         />
                    </>
               )}

               {/* Exploration Panel */}
               <AnimatePresence>
                    {selectedCheckpoint && detectedNoteType && (
                         <motion.div
                              initial={{ x: 350 }}
                              animate={{ x: 0 }}
                              exit={{ x: 350 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                              className="absolute top-0 right-0 h-full w-[350px] border-l"
                              style={{
                                   backgroundColor: theme === 'dark' ? '#1e1e1e' : theme === 'sepia' ? '#FFFDF8' : '#fff',
                                   borderColor: colors.edge,
                              }}
                         >
                              <ExplorationPanel
                                   checkpoint={selectedCheckpoint}
                                   noteType={detectedNoteType}
                                   speculativeBranches={speculativeBranches}
                                   isGenerating={isGeneratingBranches}
                                   onClose={() => selectCheckpoint(null)}
                                   onGenerateAlternatives={handleGenerateAlternatives}
                                   onClearBranches={clearSpeculativeBranches}
                                   theme={theme}
                              />
                         </motion.div>
                    )}
               </AnimatePresence>
          </div>
     );
}
