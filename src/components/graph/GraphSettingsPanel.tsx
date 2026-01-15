'use client';

// ==========================================================================
// GRAPH SETTINGS PANEL - Controls for force-directed graph visualization
// ==========================================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
     Settings,
     RotateCcw,
     Circle,
     Dot,
     Square,
     Type,
     X,
     ChevronDown,
     ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGraphStore } from '@/stores/graphStore';

interface GraphSettingsPanelProps {
     theme: 'light' | 'dark' | 'sepia';
}

export function GraphSettingsPanel({ theme }: GraphSettingsPanelProps) {
     const { graphSettings, updateGraphSettings, resetGraphSettings } = useGraphStore();
     const [isOpen, setIsOpen] = useState(false);
     const [expandedSections, setExpandedSections] = useState<Set<string>>(
          new Set(['appearance', 'physics'])
     );

     const colors = {
          background: theme === 'dark' ? '#1e1e1e' : theme === 'sepia' ? '#FFFDF8' : '#ffffff',
          text: theme === 'dark' ? '#e5e5e5' : theme === 'sepia' ? '#2C2416' : '#1a1a1a',
          textMuted: theme === 'dark' ? '#a0a0a0' : theme === 'sepia' ? '#6B5D4F' : '#6b6b6b',
          border: theme === 'dark' ? '#333' : theme === 'sepia' ? '#D4C5A9' : '#e5e5e5',
          accent: theme === 'dark' ? '#7BA3C7' : theme === 'sepia' ? '#B8704F' : '#6366f1',
          sliderTrack: theme === 'dark' ? '#333' : theme === 'sepia' ? '#E8DFD0' : '#e5e5e5',
          sliderFill: theme === 'dark' ? '#7BA3C7' : theme === 'sepia' ? '#B8704F' : '#6366f1',
     };

     const toggleSection = (section: string) => {
          setExpandedSections(prev => {
               const next = new Set(prev);
               if (next.has(section)) {
                    next.delete(section);
               } else {
                    next.add(section);
               }
               return next;
          });
     };

     const nodeAppearanceOptions: { id: typeof graphSettings.nodeAppearance; icon: React.ReactNode; label: string }[] = [
          { id: 'point', icon: <Dot className="h-4 w-4" />, label: 'Point' },
          { id: 'circle', icon: <Circle className="h-4 w-4" />, label: 'Circle' },
          { id: 'icon', icon: <Type className="h-4 w-4" />, label: 'Icon' },
          { id: 'card', icon: <Square className="h-4 w-4" />, label: 'Card' },
     ];

     return (
          <>
               {/* Toggle Button */}
               <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute top-4 right-4 z-20 p-2 rounded-lg transition-all"
                    style={{
                         backgroundColor: isOpen ? colors.accent : colors.background,
                         color: isOpen ? '#fff' : colors.text,
                         boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
               >
                    <Settings className="h-4 w-4" />
               </button>

               {/* Settings Panel */}
               <AnimatePresence>
                    {isOpen && (
                         <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="absolute top-14 right-4 z-20 w-64 rounded-lg border overflow-hidden"
                              style={{
                                   backgroundColor: colors.background,
                                   borderColor: colors.border,
                                   boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                              }}
                         >
                              {/* Header */}
                              <div
                                   className="flex items-center justify-between px-4 py-3 border-b"
                                   style={{ borderColor: colors.border }}
                              >
                                   <span className="text-sm font-medium" style={{ color: colors.text }}>
                                        Graph Settings
                                   </span>
                                   <div className="flex items-center gap-1">
                                        <Button
                                             variant="ghost"
                                             size="icon"
                                             className="h-6 w-6"
                                             onClick={resetGraphSettings}
                                             title="Reset to defaults"
                                        >
                                             <RotateCcw className="h-3 w-3" />
                                        </Button>
                                        <Button
                                             variant="ghost"
                                             size="icon"
                                             className="h-6 w-6"
                                             onClick={() => setIsOpen(false)}
                                        >
                                             <X className="h-3 w-3" />
                                        </Button>
                                   </div>
                              </div>

                              {/* Content */}
                              <div className="max-h-[400px] overflow-y-auto">
                                   {/* Appearance Section */}
                                   <div className="border-b" style={{ borderColor: colors.border }}>
                                        <button
                                             onClick={() => toggleSection('appearance')}
                                             className="flex items-center justify-between w-full px-4 py-2 text-xs font-medium uppercase tracking-wider"
                                             style={{ color: colors.textMuted }}
                                        >
                                             <span>Appearance</span>
                                             {expandedSections.has('appearance') ? (
                                                  <ChevronUp className="h-3 w-3" />
                                             ) : (
                                                  <ChevronDown className="h-3 w-3" />
                                             )}
                                        </button>

                                        <AnimatePresence>
                                             {expandedSections.has('appearance') && (
                                                  <motion.div
                                                       initial={{ height: 0, opacity: 0 }}
                                                       animate={{ height: 'auto', opacity: 1 }}
                                                       exit={{ height: 0, opacity: 0 }}
                                                       className="overflow-hidden"
                                                  >
                                                       <div className="px-4 pb-3 space-y-3">
                                                            {/* Node Appearance */}
                                                            <div>
                                                                 <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>
                                                                      Node Style
                                                                 </label>
                                                                 <div className="flex gap-1">
                                                                      {nodeAppearanceOptions.map(option => (
                                                                           <button
                                                                                key={option.id}
                                                                                onClick={() => updateGraphSettings({ nodeAppearance: option.id })}
                                                                                className="flex-1 flex flex-col items-center gap-1 p-2 rounded-md transition-all"
                                                                                style={{
                                                                                     backgroundColor: graphSettings.nodeAppearance === option.id
                                                                                          ? colors.accent + '20'
                                                                                          : 'transparent',
                                                                                     color: graphSettings.nodeAppearance === option.id
                                                                                          ? colors.accent
                                                                                          : colors.textMuted,
                                                                                     border: `1px solid ${graphSettings.nodeAppearance === option.id ? colors.accent : colors.border}`,
                                                                                }}
                                                                           >
                                                                                {option.icon}
                                                                                <span className="text-[10px]">{option.label}</span>
                                                                           </button>
                                                                      ))}
                                                                 </div>
                                                            </div>

                                                            {/* Node Size */}
                                                            <div>
                                                                 <div className="flex justify-between items-center mb-1">
                                                                      <label className="text-xs" style={{ color: colors.textMuted }}>
                                                                           Node Size
                                                                      </label>
                                                                      <span className="text-xs font-mono" style={{ color: colors.text }}>
                                                                           {graphSettings.nodeSize}px
                                                                      </span>
                                                                 </div>
                                                                 <input
                                                                      type="range"
                                                                      min="4"
                                                                      max="20"
                                                                      value={graphSettings.nodeSize}
                                                                      onChange={(e) => updateGraphSettings({ nodeSize: Number(e.target.value) })}
                                                                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                                                      style={{
                                                                           background: `linear-gradient(to right, ${colors.sliderFill} 0%, ${colors.sliderFill} ${((graphSettings.nodeSize - 4) / 16) * 100}%, ${colors.sliderTrack} ${((graphSettings.nodeSize - 4) / 16) * 100}%, ${colors.sliderTrack} 100%)`,
                                                                      }}
                                                                 />
                                                            </div>

                                                            {/* Show Labels */}
                                                            <div className="flex items-center justify-between">
                                                                 <label className="text-xs" style={{ color: colors.textMuted }}>
                                                                      Show Labels
                                                                 </label>
                                                                 <button
                                                                      onClick={() => updateGraphSettings({ showLabels: !graphSettings.showLabels })}
                                                                      className="relative w-10 h-5 rounded-full transition-colors"
                                                                      style={{
                                                                           backgroundColor: graphSettings.showLabels ? colors.accent : colors.sliderTrack,
                                                                      }}
                                                                 >
                                                                      <span
                                                                           className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                                                                           style={{
                                                                                left: graphSettings.showLabels ? '22px' : '2px',
                                                                           }}
                                                                      />
                                                                 </button>
                                                            </div>
                                                       </div>
                                                  </motion.div>
                                             )}
                                        </AnimatePresence>
                                   </div>

                                   {/* Physics Section */}
                                   <div>
                                        <button
                                             onClick={() => toggleSection('physics')}
                                             className="flex items-center justify-between w-full px-4 py-2 text-xs font-medium uppercase tracking-wider"
                                             style={{ color: colors.textMuted }}
                                        >
                                             <span>Physics</span>
                                             {expandedSections.has('physics') ? (
                                                  <ChevronUp className="h-3 w-3" />
                                             ) : (
                                                  <ChevronDown className="h-3 w-3" />
                                             )}
                                        </button>

                                        <AnimatePresence>
                                             {expandedSections.has('physics') && (
                                                  <motion.div
                                                       initial={{ height: 0, opacity: 0 }}
                                                       animate={{ height: 'auto', opacity: 1 }}
                                                       exit={{ height: 0, opacity: 0 }}
                                                       className="overflow-hidden"
                                                  >
                                                       <div className="px-4 pb-3 space-y-3">
                                                            {/* Repulsion Force */}
                                                            <div>
                                                                 <div className="flex justify-between items-center mb-1">
                                                                      <label className="text-xs" style={{ color: colors.textMuted }}>
                                                                           Repulsion
                                                                      </label>
                                                                      <span className="text-xs font-mono" style={{ color: colors.text }}>
                                                                           {graphSettings.repulsionForce}
                                                                      </span>
                                                                 </div>
                                                                 <input
                                                                      type="range"
                                                                      min="50"
                                                                      max="800"
                                                                      step="10"
                                                                      value={graphSettings.repulsionForce}
                                                                      onChange={(e) => updateGraphSettings({ repulsionForce: Number(e.target.value) })}
                                                                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                                                      style={{
                                                                           background: `linear-gradient(to right, ${colors.sliderFill} 0%, ${colors.sliderFill} ${((graphSettings.repulsionForce - 50) / 750) * 100}%, ${colors.sliderTrack} ${((graphSettings.repulsionForce - 50) / 750) * 100}%, ${colors.sliderTrack} 100%)`,
                                                                      }}
                                                                 />
                                                            </div>

                                                            {/* Link Strength */}
                                                            <div>
                                                                 <div className="flex justify-between items-center mb-1">
                                                                      <label className="text-xs" style={{ color: colors.textMuted }}>
                                                                           Link Strength
                                                                      </label>
                                                                      <span className="text-xs font-mono" style={{ color: colors.text }}>
                                                                           {graphSettings.linkStrength.toFixed(2)}
                                                                      </span>
                                                                 </div>
                                                                 <input
                                                                      type="range"
                                                                      min="0.1"
                                                                      max="2"
                                                                      step="0.1"
                                                                      value={graphSettings.linkStrength}
                                                                      onChange={(e) => updateGraphSettings({ linkStrength: Number(e.target.value) })}
                                                                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                                                      style={{
                                                                           background: `linear-gradient(to right, ${colors.sliderFill} 0%, ${colors.sliderFill} ${((graphSettings.linkStrength - 0.1) / 1.9) * 100}%, ${colors.sliderTrack} ${((graphSettings.linkStrength - 0.1) / 1.9) * 100}%, ${colors.sliderTrack} 100%)`,
                                                                      }}
                                                                 />
                                                            </div>

                                                            {/* Charge Strength */}
                                                            <div>
                                                                 <div className="flex justify-between items-center mb-1">
                                                                      <label className="text-xs" style={{ color: colors.textMuted }}>
                                                                           Charge
                                                                      </label>
                                                                      <span className="text-xs font-mono" style={{ color: colors.text }}>
                                                                           {graphSettings.chargeStrength}
                                                                      </span>
                                                                 </div>
                                                                 <input
                                                                      type="range"
                                                                      min="-500"
                                                                      max="-30"
                                                                      step="10"
                                                                      value={graphSettings.chargeStrength}
                                                                      onChange={(e) => updateGraphSettings({ chargeStrength: Number(e.target.value) })}
                                                                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                                                      style={{
                                                                           background: `linear-gradient(to right, ${colors.sliderFill} 0%, ${colors.sliderFill} ${((graphSettings.chargeStrength + 500) / 470) * 100}%, ${colors.sliderTrack} ${((graphSettings.chargeStrength + 500) / 470) * 100}%, ${colors.sliderTrack} 100%)`,
                                                                      }}
                                                                 />
                                                            </div>

                                                            {/* Animation Speed */}
                                                            <div>
                                                                 <div className="flex justify-between items-center mb-1">
                                                                      <label className="text-xs" style={{ color: colors.textMuted }}>
                                                                           Animation Speed
                                                                      </label>
                                                                      <span className="text-xs font-mono" style={{ color: colors.text }}>
                                                                           {graphSettings.animationSpeed}x
                                                                      </span>
                                                                 </div>
                                                                 <input
                                                                      type="range"
                                                                      min="0.25"
                                                                      max="3"
                                                                      step="0.25"
                                                                      value={graphSettings.animationSpeed}
                                                                      onChange={(e) => updateGraphSettings({ animationSpeed: Number(e.target.value) })}
                                                                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                                                      style={{
                                                                           background: `linear-gradient(to right, ${colors.sliderFill} 0%, ${colors.sliderFill} ${((graphSettings.animationSpeed - 0.25) / 2.75) * 100}%, ${colors.sliderTrack} ${((graphSettings.animationSpeed - 0.25) / 2.75) * 100}%, ${colors.sliderTrack} 100%)`,
                                                                      }}
                                                                 />
                                                            </div>
                                                       </div>
                                                  </motion.div>
                                             )}
                                        </AnimatePresence>
                                   </div>
                              </div>
                         </motion.div>
                    )}
               </AnimatePresence>
          </>
     );
}
