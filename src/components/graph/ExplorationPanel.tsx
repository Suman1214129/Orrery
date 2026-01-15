'use client';

// ==========================================================================
// EXPLORATION PANEL - What-If Exploration Sidebar
// ==========================================================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Loader2, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NOTE_TYPE_CONFIGS, CHECKPOINT_TYPE_ICONS, getTypeColors } from '@/lib/graph/noteTypeConfig';
import type { Checkpoint, DetectedNoteType, SpeculativeBranch, Theme } from '@/types';

interface ExplorationPanelProps {
     checkpoint: Checkpoint;
     noteType: DetectedNoteType;
     speculativeBranches: SpeculativeBranch[];
     isGenerating: boolean;
     onClose: () => void;
     onGenerateAlternatives: (question: string) => Promise<void>;
     onClearBranches: () => void;
     theme: Theme;
}

export function ExplorationPanel({
     checkpoint,
     noteType,
     speculativeBranches,
     isGenerating,
     onClose,
     onGenerateAlternatives,
     onClearBranches,
     theme,
}: ExplorationPanelProps) {
     const [customQuestion, setCustomQuestion] = useState('');
     const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());

     const config = NOTE_TYPE_CONFIGS[noteType];
     const colors = getTypeColors(noteType, theme);

     const handleQuickScenario = async (scenario: string) => {
          await onGenerateAlternatives(scenario);
     };

     const handleCustomSubmit = async () => {
          if (customQuestion.trim()) {
               await onGenerateAlternatives(customQuestion);
               setCustomQuestion('');
          }
     };

     const toggleBranch = (branchId: string) => {
          const newExpanded = new Set(expandedBranches);
          if (newExpanded.has(branchId)) {
               newExpanded.delete(branchId);
          } else {
               newExpanded.add(branchId);
          }
          setExpandedBranches(newExpanded);
     };

     return (
          <div className="h-full flex flex-col overflow-hidden">
               {/* Header */}
               <div
                    className="flex-shrink-0 p-4 border-b flex items-center justify-between"
                    style={{
                         borderColor: theme === 'dark' ? '#3a3a3a' : theme === 'sepia' ? '#DDD6C8' : '#e5e7eb',
                    }}
               >
                    <div className="flex items-center gap-2">
                         <span className="text-xl">{CHECKPOINT_TYPE_ICONS[checkpoint.type] || '📍'}</span>
                         <span
                              className="font-medium text-sm"
                              style={{ color: colors.text }}
                         >
                              Explore Checkpoint
                         </span>
                    </div>
                    <button
                         onClick={onClose}
                         className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                         <X className="h-4 w-4" style={{ color: colors.textMuted }} />
                    </button>
               </div>

               {/* Scrollable Content */}
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Checkpoint Info */}
                    <div
                         className="p-3 rounded-lg"
                         style={{
                              backgroundColor: theme === 'dark' ? '#242424' : theme === 'sepia' ? '#F2EDE1' : '#f9fafb',
                         }}
                    >
                         <h3
                              className="font-semibold text-sm mb-1"
                              style={{ color: colors.text }}
                         >
                              {checkpoint.title}
                         </h3>
                         <p
                              className="text-xs"
                              style={{ color: colors.textMuted }}
                         >
                              {checkpoint.excerpt}
                         </p>
                         <div
                              className="mt-2 text-xs px-2 py-0.5 rounded inline-block"
                              style={{
                                   backgroundColor: colors.accent + '20',
                                   color: colors.accent,
                              }}
                         >
                              {checkpoint.type.replace(/-/g, ' ')}
                         </div>
                    </div>

                    {/* Quick Scenarios */}
                    <div>
                         <h4
                              className="text-xs font-medium mb-2 flex items-center gap-1"
                              style={{ color: colors.textMuted }}
                         >
                              <Sparkles className="h-3 w-3" />
                              Quick Scenarios
                         </h4>
                         <div className="space-y-2">
                              {config.quickScenarios.map((scenario, index) => (
                                   <button
                                        key={index}
                                        onClick={() => handleQuickScenario(scenario)}
                                        disabled={isGenerating}
                                        className="w-full text-left text-xs p-2 rounded border transition-colors hover:border-current disabled:opacity-50"
                                        style={{
                                             color: colors.text,
                                             borderColor: theme === 'dark' ? '#3a3a3a' : theme === 'sepia' ? '#DDD6C8' : '#e5e7eb',
                                        }}
                                   >
                                        {scenario}
                                   </button>
                              ))}
                         </div>
                    </div>

                    {/* Custom Question */}
                    <div>
                         <h4
                              className="text-xs font-medium mb-2"
                              style={{ color: colors.textMuted }}
                         >
                              💭 Ask your own "what if"...
                         </h4>
                         <div className="flex gap-2">
                              <input
                                   type="text"
                                   value={customQuestion}
                                   onChange={(e) => setCustomQuestion(e.target.value)}
                                   onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                                   placeholder="What if..."
                                   disabled={isGenerating}
                                   className="flex-1 text-xs p-2 rounded border bg-transparent disabled:opacity-50"
                                   style={{
                                        color: colors.text,
                                        borderColor: theme === 'dark' ? '#3a3a3a' : theme === 'sepia' ? '#DDD6C8' : '#e5e7eb',
                                   }}
                              />
                              <Button
                                   size="sm"
                                   onClick={handleCustomSubmit}
                                   disabled={isGenerating || !customQuestion.trim()}
                                   style={{
                                        backgroundColor: colors.accent,
                                        color: theme === 'dark' ? '#1a1a1a' : '#fff',
                                   }}
                              >
                                   {isGenerating ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                   ) : (
                                        <Sparkles className="h-3 w-3" />
                                   )}
                              </Button>
                         </div>
                    </div>

                    {/* Loading State */}
                    {isGenerating && (
                         <div
                              className="text-center py-4 text-xs"
                              style={{ color: colors.textMuted }}
                         >
                              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" style={{ color: colors.accent }} />
                              <p>Exploring alternatives...</p>
                         </div>
                    )}

                    {/* Generated Branches */}
                    {speculativeBranches.length > 0 && (
                         <div>
                              <div className="flex items-center justify-between mb-2">
                                   <h4
                                        className="text-xs font-medium flex items-center gap-1"
                                        style={{ color: colors.textMuted }}
                                   >
                                        ✨ {speculativeBranches.length} Alternative Paths
                                   </h4>
                                   <button
                                        onClick={onClearBranches}
                                        className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100"
                                        style={{ color: colors.textMuted }}
                                   >
                                        <Trash2 className="h-3 w-3" />
                                        Clear
                                   </button>
                              </div>

                              <div className="space-y-2">
                                   {speculativeBranches.map((branch) => {
                                        const isExpanded = expandedBranches.has(branch.id);
                                        return (
                                             <motion.div
                                                  key={branch.id}
                                                  initial={{ opacity: 0, y: 10 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  className="rounded-lg border overflow-hidden"
                                                  style={{
                                                       borderColor: colors.accent + '40',
                                                       borderStyle: 'dashed',
                                                  }}
                                             >
                                                  {/* Branch Header */}
                                                  <button
                                                       onClick={() => toggleBranch(branch.id)}
                                                       className="w-full p-3 text-left flex items-start justify-between"
                                                       style={{
                                                            backgroundColor: theme === 'dark' ? '#242424' : theme === 'sepia' ? '#F2EDE1' : '#f9fafb',
                                                       }}
                                                  >
                                                       <div className="flex-1">
                                                            <h5
                                                                 className="text-sm font-medium"
                                                                 style={{ color: colors.text }}
                                                            >
                                                                 {branch.title}
                                                            </h5>
                                                            <p
                                                                 className="text-xs mt-1"
                                                                 style={{ color: colors.textMuted }}
                                                            >
                                                                 {branch.description}
                                                            </p>
                                                       </div>
                                                       <div className="flex items-center gap-2 ml-2">
                                                            {/* Confidence indicator */}
                                                            <span
                                                                 className="text-xs px-1.5 py-0.5 rounded"
                                                                 style={{
                                                                      backgroundColor:
                                                                           branch.confidence > 0.7 ? '#22c55e20' :
                                                                                branch.confidence > 0.4 ? '#eab30820' : '#94a3b820',
                                                                      color:
                                                                           branch.confidence > 0.7 ? '#22c55e' :
                                                                                branch.confidence > 0.4 ? '#eab308' : '#94a3b8',
                                                                 }}
                                                            >
                                                                 {Math.round(branch.confidence * 100)}%
                                                            </span>
                                                            {isExpanded ? (
                                                                 <ChevronUp className="h-4 w-4" style={{ color: colors.textMuted }} />
                                                            ) : (
                                                                 <ChevronDown className="h-4 w-4" style={{ color: colors.textMuted }} />
                                                            )}
                                                       </div>
                                                  </button>

                                                  {/* Expanded Content */}
                                                  {isExpanded && (
                                                       <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: 'auto' }}
                                                            exit={{ height: 0 }}
                                                            className="p-3 border-t"
                                                            style={{
                                                                 borderColor: theme === 'dark' ? '#3a3a3a' : theme === 'sepia' ? '#DDD6C8' : '#e5e7eb',
                                                            }}
                                                       >
                                                            {/* Consequences */}
                                                            <div className="mb-3">
                                                                 <h6
                                                                      className="text-xs font-medium mb-1"
                                                                      style={{ color: colors.textMuted }}
                                                                 >
                                                                      Consequences
                                                                 </h6>
                                                                 <p
                                                                      className="text-xs"
                                                                      style={{ color: colors.text }}
                                                                 >
                                                                      {branch.consequences}
                                                                 </p>
                                                            </div>

                                                            {/* Pros/Cons */}
                                                            {(branch.pros?.length || branch.cons?.length) && (
                                                                 <div className="grid grid-cols-2 gap-2 mb-3">
                                                                      {branch.pros && branch.pros.length > 0 && (
                                                                           <div>
                                                                                <h6 className="text-xs font-medium text-green-600 mb-1">✅ Pros</h6>
                                                                                <ul className="text-xs space-y-0.5">
                                                                                     {branch.pros.map((pro, i) => (
                                                                                          <li key={i} style={{ color: colors.text }}>• {pro}</li>
                                                                                     ))}
                                                                                </ul>
                                                                           </div>
                                                                      )}
                                                                      {branch.cons && branch.cons.length > 0 && (
                                                                           <div>
                                                                                <h6 className="text-xs font-medium text-red-500 mb-1">⚠️ Cons</h6>
                                                                                <ul className="text-xs space-y-0.5">
                                                                                     {branch.cons.map((con, i) => (
                                                                                          <li key={i} style={{ color: colors.text }}>• {con}</li>
                                                                                     ))}
                                                                                </ul>
                                                                           </div>
                                                                      )}
                                                                 </div>
                                                            )}

                                                            {/* Next Checkpoints */}
                                                            {branch.nextCheckpoints.length > 0 && (
                                                                 <div>
                                                                      <h6
                                                                           className="text-xs font-medium mb-1"
                                                                           style={{ color: colors.textMuted }}
                                                                      >
                                                                           What comes next
                                                                      </h6>
                                                                      <div className="space-y-1">
                                                                           {branch.nextCheckpoints.map((next, i) => (
                                                                                <div
                                                                                     key={i}
                                                                                     className="text-xs p-2 rounded"
                                                                                     style={{
                                                                                          backgroundColor: theme === 'dark' ? '#1a1a1a' : theme === 'sepia' ? '#EDE8DD' : '#f3f4f6',
                                                                                     }}
                                                                                >
                                                                                     <div className="font-medium" style={{ color: colors.text }}>
                                                                                          {next.title}
                                                                                     </div>
                                                                                     <div className="mt-0.5" style={{ color: colors.textMuted }}>
                                                                                          {next.description}
                                                                                     </div>
                                                                                </div>
                                                                           ))}
                                                                      </div>
                                                                 </div>
                                                            )}

                                                            {/* Actions */}
                                                            <div className="mt-3 flex gap-2">
                                                                 <Button
                                                                      size="sm"
                                                                      variant="outline"
                                                                      className="text-xs flex-1"
                                                                 >
                                                                      <Plus className="h-3 w-3 mr-1" />
                                                                      Add to Note
                                                                 </Button>
                                                            </div>
                                                       </motion.div>
                                                  )}
                                             </motion.div>
                                        );
                                   })}
                              </div>
                         </div>
                    )}
               </div>
          </div>
     );
}
