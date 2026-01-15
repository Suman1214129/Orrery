// ==========================================================================
// NOTE TYPE CONFIGURATION - Visual Settings per Note Type
// ==========================================================================
import type { DetectedNoteType, GraphLayoutType, CheckpointType, NoteTypeConfig } from '@/types';

// ==========================================================================
// TYPE CONFIGURATIONS
// ==========================================================================
export const NOTE_TYPE_CONFIGS: Record<DetectedNoteType, NoteTypeConfig> = {
     story: {
          type: 'story',
          label: 'Story / Narrative',
          icon: '🎭',
          primaryColor: '#F4EFE6',
          accentColor: '#D4A574',
          layout: 'horizontal-timeline',
          quickScenarios: [
               'What if this character made a different choice?',
               "What if this event didn't happen?",
               'What if the scene occurred in a different location?',
               'What if the outcome was opposite?',
          ],
          checkpointTypes: ['plot-event', 'character-decision', 'conflict', 'scene-change', 'resolution'],
     },
     research: {
          type: 'research',
          label: 'Research / Academic',
          icon: '🔬',
          primaryColor: '#E8F4F8',
          accentColor: '#5B9BD5',
          layout: 'hierarchical-tree',
          quickScenarios: [
               'What if this variable was different?',
               'What if the methodology changed?',
               'What if the sample size was larger?',
               'What if we interpreted results differently?',
          ],
          checkpointTypes: ['hypothesis', 'finding', 'data-point', 'insight', 'research-question', 'conclusion'],
     },
     argument: {
          type: 'argument',
          label: 'Argument / Essay',
          icon: '💭',
          primaryColor: '#F0F0F0',
          accentColor: '#7C8A95',
          layout: 'vertical-debate',
          quickScenarios: [
               'What if this assumption is false?',
               'What if the counterargument is stronger?',
               'What if we prioritize different values?',
               'What if evidence contradicted this point?',
          ],
          checkpointTypes: ['thesis', 'supporting-point', 'counterargument', 'rebuttal', 'essay-conclusion'],
     },
     process: {
          type: 'process',
          label: 'Process / Tutorial',
          icon: '📋',
          primaryColor: '#E8F5E9',
          accentColor: '#66BB6A',
          layout: 'horizontal-timeline',
          quickScenarios: [
               'What if we skip this step?',
               'What if we do steps in different order?',
               'What if we use an alternative tool?',
               'What if this step fails?',
          ],
          checkpointTypes: ['step', 'warning', 'checkpoint', 'branch-point', 'completion'],
     },
     decision: {
          type: 'decision',
          label: 'Decision Analysis',
          icon: '⚖️',
          primaryColor: '#FFF8E1',
          accentColor: '#FFA726',
          layout: 'branching-tree',
          quickScenarios: [
               'What if we chose option B instead?',
               "What if cost wasn't a factor?",
               'What if timeline doubled?',
               'What if we combined options?',
          ],
          checkpointTypes: ['problem', 'criteria', 'option', 'trade-off', 'decision-made'],
     },
     concept: {
          type: 'concept',
          label: 'Conceptual / Philosophical',
          icon: '🧠',
          primaryColor: '#F3E5F5',
          accentColor: '#AB47BC',
          layout: 'network-web',
          quickScenarios: [
               'What if this concept applied to different domain?',
               'What if we inverted the relationship?',
               'What if the premise was different?',
               'What if we challenged core assumptions?',
          ],
          checkpointTypes: ['concept-definition', 'relationship', 'implication', 'philosophical-question'],
     },
     meeting: {
          type: 'meeting',
          label: 'Meeting / Project Notes',
          icon: '📅',
          primaryColor: '#FFF3E0',
          accentColor: '#FF9800',
          layout: 'action-board',
          quickScenarios: [
               'What if we assigned this to different person?',
               'What if deadline moved earlier/later?',
               'What if we rejected this decision?',
               'What if budget constraints changed?',
          ],
          checkpointTypes: ['topic', 'discussion-point', 'action-item', 'deadline'],
     },
     technical: {
          type: 'technical',
          label: 'Technical Documentation',
          icon: '⚙️',
          primaryColor: '#263238',
          accentColor: '#00BCD4',
          layout: 'flow-diagram',
          quickScenarios: [
               'What if we used different architecture?',
               'What if performance requirements doubled?',
               'What if we optimized for maintainability?',
               'What if we handled this error differently?',
          ],
          checkpointTypes: ['function', 'input', 'output', 'error-case', 'example'],
     },
     journal: {
          type: 'journal',
          label: 'Journal / Reflection',
          icon: '✍️',
          primaryColor: '#FFF9C4',
          accentColor: '#FBC02D',
          layout: 'horizontal-timeline',
          quickScenarios: [
               'What if I had reacted differently?',
               'What if my interpretation was wrong?',
               'What if I try a new approach tomorrow?',
               'What if I looked at this from another angle?',
          ],
          checkpointTypes: ['emotional-state', 'event', 'reflection', 'future-intent'],
     },
     brainstorm: {
          type: 'brainstorm',
          label: 'Brainstorm / Ideas',
          icon: '💡',
          primaryColor: '#E1F5FE',
          accentColor: '#29B6F6',
          layout: 'network-web',
          quickScenarios: [
               'What if we combined these two ideas?',
               'What if we flipped this concept?',
               'What if we targeted different audience?',
               'What if budget was 10x larger?',
          ],
          checkpointTypes: ['core-idea', 'feature', 'connection', 'promising', 'rejected'],
     },
};

// ==========================================================================
// CHECKPOINT TYPE ICONS
// ==========================================================================
export const CHECKPOINT_TYPE_ICONS: Record<CheckpointType, string> = {
     // Story
     'plot-event': '📖',
     'character-decision': '⚡',
     'conflict': '💔',
     'scene-change': '🎬',
     'resolution': '🔚',
     // Research
     'hypothesis': '🔬',
     'finding': '📊',
     'data-point': '📈',
     'insight': '💡',
     'research-question': '❓',
     'conclusion': '🎯',
     // Argument
     'thesis': '📝',
     'supporting-point': '✅',
     'counterargument': '❌',
     'rebuttal': '🔄',
     'essay-conclusion': '⚖️',
     // Process
     'step': '1️⃣',
     'warning': '⚠️',
     'checkpoint': '✔️',
     'branch-point': '🔀',
     'completion': '🏁',
     // Decision
     'problem': '🤔',
     'criteria': '📋',
     'option': '🅰️',
     'trade-off': '⚖️',
     'decision-made': '✅',
     // Concept
     'concept-definition': '💭',
     'relationship': '🔗',
     'implication': '🧩',
     'philosophical-question': '❓',
     // Meeting
     'topic': '📅',
     'discussion-point': '🗣️',
     'action-item': '📌',
     'deadline': '⏰',
     // Technical
     'function': '⚙️',
     'input': '📥',
     'output': '📤',
     'error-case': '⚠️',
     'example': '💡',
     // Journal
     'emotional-state': '😊',
     'event': '📖',
     'reflection': '💭',
     'future-intent': '🔮',
     // Brainstorm
     'core-idea': '💡',
     'feature': '🌟',
     'connection': '🔗',
     'promising': '⭐',
     'rejected': '❌',
};

// ==========================================================================
// THEME-AWARE COLORS
// ==========================================================================
export function getTypeColors(
     noteType: DetectedNoteType,
     theme: 'light' | 'dark' | 'sepia'
): { primary: string; accent: string; text: string; textMuted: string } {
     const config = NOTE_TYPE_CONFIGS[noteType];

     if (theme === 'dark') {
          return {
               primary: adjustColorForDark(config.primaryColor),
               accent: config.accentColor,
               text: '#E5E5E5',
               textMuted: '#A0A0A0',
          };
     }

     if (theme === 'sepia') {
          return {
               primary: adjustColorForSepia(config.primaryColor),
               accent: adjustColorForSepia(config.accentColor),
               text: '#2C2416',
               textMuted: '#6B5D4F',
          };
     }

     return {
          primary: config.primaryColor,
          accent: config.accentColor,
          text: '#2A2A2A',
          textMuted: '#6B6B6B',
     };
}

function adjustColorForDark(color: string): string {
     // Darken light colors for dark theme
     if (color.startsWith('#')) {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);

          // If it's a light color, make it darker
          if (r + g + b > 384) {
               return `#${Math.floor(r * 0.2).toString(16).padStart(2, '0')}${Math.floor(g * 0.2).toString(16).padStart(2, '0')}${Math.floor(b * 0.2).toString(16).padStart(2, '0')}`;
          }
     }
     return color;
}

function adjustColorForSepia(color: string): string {
     // Add warm tint for sepia
     if (color.startsWith('#')) {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);

          // Add warmth
          const newR = Math.min(255, r + 10);
          const newG = Math.min(255, g);
          const newB = Math.max(0, b - 20);

          return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
     }
     return color;
}
