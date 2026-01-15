// ==========================================================================
// ANIMATION PRESETS - Framer Motion (Performance Optimized)
// ==========================================================================
import type { Variants, Transition } from 'framer-motion';

// ==========================================================================
// TRANSITION PRESETS - Fast & Mature
// ==========================================================================
export const easeOutQuart: Transition = {
     duration: 0.15,  // Faster
     ease: [0.25, 1, 0.5, 1]
};

export const easeInOutQuart: Transition = {
     duration: 0.15,  // Faster
     ease: [0.76, 0, 0.24, 1]
};

export const spring: Transition = {
     type: 'spring',
     stiffness: 400,  // Snappier
     damping: 30      // Less bouncy
};

export const springGentle: Transition = {
     type: 'spring',
     stiffness: 300,
     damping: 25
};

// Instant for canvas/graph interactions
export const instant: Transition = {
     duration: 0.08,
     ease: 'easeOut'
};

// ==========================================================================
// FADE ANIMATIONS - Subtle
// ==========================================================================
export const fadeIn: Variants = {
     initial: { opacity: 0 },
     animate: { opacity: 1, transition: { duration: 0.12 } },
     exit: { opacity: 0, transition: { duration: 0.08 } }
};

export const fadeInUp: Variants = {
     initial: { opacity: 0, y: 12 },  // Smaller offset
     animate: { opacity: 1, y: 0, transition: { duration: 0.15 } },
     exit: { opacity: 0, y: -6, transition: { duration: 0.1 } }
};

export const fadeInDown: Variants = {
     initial: { opacity: 0, y: -12 },
     animate: { opacity: 1, y: 0, transition: { duration: 0.15 } },
     exit: { opacity: 0, y: 6, transition: { duration: 0.1 } }
};

// ==========================================================================
// SCALE ANIMATIONS - Quick
// ==========================================================================
export const scaleIn: Variants = {
     initial: { opacity: 0, scale: 0.97 },  // Subtler
     animate: { opacity: 1, scale: 1, transition: { duration: 0.12 } },
     exit: { opacity: 0, scale: 0.98, transition: { duration: 0.08 } }
};

export const scaleInSpring: Variants = {
     initial: { opacity: 0, scale: 0.9 },
     animate: {
          opacity: 1,
          scale: 1,
          transition: spring
     },
     exit: {
          opacity: 0,
          scale: 0.95,
          transition: { duration: 0.1 }
     }
};

// ==========================================================================
// SLIDE ANIMATIONS - Fast
// ==========================================================================
export const slideInFromLeft: Variants = {
     initial: { x: -15, opacity: 0 },
     animate: { x: 0, opacity: 1, transition: { duration: 0.15 } },
     exit: { x: -15, opacity: 0, transition: { duration: 0.1 } }
};

export const slideInFromRight: Variants = {
     initial: { x: 15, opacity: 0 },
     animate: { x: 0, opacity: 1, transition: { duration: 0.15 } },
     exit: { x: 15, opacity: 0, transition: { duration: 0.1 } }
};

// Sidebar specific - Fast transitions
export const sidebarSlide: Variants = {
     open: {
          x: 0,
          transition: { duration: 0.15, ease: [0.25, 1, 0.5, 1] }
     },
     closed: {
          x: -260,
          transition: { duration: 0.12, ease: [0.76, 0, 0.24, 1] }
     }
};

// AI Panel specific
export const aiPanelSlide: Variants = {
     open: {
          x: 0,
          transition: { duration: 0.15, ease: [0.25, 1, 0.5, 1] }
     },
     closed: {
          x: 360,
          transition: { duration: 0.12, ease: [0.76, 0, 0.24, 1] }
     }
};

// ==========================================================================
// LIST ANIMATIONS (Stagger) - Faster stagger
// ==========================================================================
export const staggerContainer: Variants = {
     initial: {},
     animate: {
          transition: {
               staggerChildren: 0.03,  // Faster stagger
               delayChildren: 0.05
          }
     },
     exit: {
          transition: {
               staggerChildren: 0.02,
               staggerDirection: -1
          }
     }
};

export const staggerItem: Variants = {
     initial: { opacity: 0, y: 10 },
     animate: {
          opacity: 1,
          y: 0,
          transition: easeOutQuart
     },
     exit: {
          opacity: 0,
          y: -5,
          transition: { duration: 0.15 }
     }
};

// ==========================================================================
// GRAPH ANIMATIONS
// ==========================================================================
export const nodeAppear: Variants = {
     initial: { scale: 0, opacity: 0 },
     animate: {
          scale: 1,
          opacity: 1,
          transition: spring
     },
     exit: {
          scale: 0,
          opacity: 0,
          transition: { duration: 0.2 }
     }
};

export const nodeHover: Variants = {
     initial: { scale: 1 },
     hover: {
          scale: 1.05,
          transition: { duration: 0.2 }
     },
     tap: { scale: 0.98 }
};

export const nodeSelected: Variants = {
     initial: {
          boxShadow: '0 0 0 0 rgba(212, 165, 116, 0)'
     },
     animate: {
          boxShadow: '0 0 0 4px rgba(212, 165, 116, 0.3)',
          transition: { duration: 0.3 }
     }
};

// ==========================================================================
// MODAL / OVERLAY ANIMATIONS
// ==========================================================================
export const overlayFade: Variants = {
     initial: { opacity: 0 },
     animate: {
          opacity: 1,
          transition: { duration: 0.2 }
     },
     exit: {
          opacity: 0,
          transition: { duration: 0.15 }
     }
};

export const modalScale: Variants = {
     initial: {
          opacity: 0,
          scale: 0.95,
          y: 10
     },
     animate: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
               duration: 0.25,
               ease: [0.4, 0, 0.2, 1]
          }
     },
     exit: {
          opacity: 0,
          scale: 0.97,
          y: 5,
          transition: { duration: 0.15 }
     }
};

// ==========================================================================
// TOOLTIP ANIMATIONS
// ==========================================================================
export const tooltipFade: Variants = {
     initial: { opacity: 0, y: 4 },
     animate: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.15 }
     },
     exit: {
          opacity: 0,
          transition: { duration: 0.1 }
     }
};

// ==========================================================================
// COMMAND PALETTE ANIMATIONS
// ==========================================================================
export const commandPalette: Variants = {
     initial: {
          opacity: 0,
          scale: 0.98,
          y: -20
     },
     animate: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
               duration: 0.2,
               ease: [0.4, 0, 0.2, 1]
          }
     },
     exit: {
          opacity: 0,
          scale: 0.98,
          transition: { duration: 0.1 }
     }
};

// ==========================================================================
// EDITOR ANIMATIONS
// ==========================================================================
export const floatingToolbar: Variants = {
     initial: {
          opacity: 0,
          y: 10,
          scale: 0.95
     },
     animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.15 }
     },
     exit: {
          opacity: 0,
          y: 5,
          scale: 0.98,
          transition: { duration: 0.1 }
     }
};

export const slashMenu: Variants = {
     initial: {
          opacity: 0,
          y: 10,
          height: 0
     },
     animate: {
          opacity: 1,
          y: 0,
          height: 'auto',
          transition: { duration: 0.2 }
     },
     exit: {
          opacity: 0,
          y: -5,
          height: 0,
          transition: { duration: 0.15 }
     }
};

// ==========================================================================
// AI SPECIFIC ANIMATIONS
// ==========================================================================
export const aiGlow: Variants = {
     initial: {
          boxShadow: '0 0 20px rgba(123, 163, 199, 0.2)'
     },
     animate: {
          boxShadow: [
               '0 0 20px rgba(123, 163, 199, 0.2)',
               '0 0 40px rgba(123, 163, 199, 0.4)',
               '0 0 20px rgba(123, 163, 199, 0.2)'
          ],
          transition: {
               duration: 2,
               repeat: Infinity,
               ease: 'easeInOut'
          }
     }
};

export const typewriter = {
     hidden: { opacity: 0 },
     visible: (i: number) => ({
          opacity: 1,
          transition: { delay: i * 0.03 }
     })
};

// ==========================================================================
// CANVAS ANIMATIONS
// ==========================================================================
export const canvasElementDrag: Variants = {
     idle: {
          scale: 1,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
     },
     dragging: {
          scale: 1.02,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          cursor: 'grabbing'
     }
};

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================

/**
 * Create staggered children animation
 */
export function createStaggerChildren(
     stagger: number = 0.05,
     delay: number = 0
): Variants {
     return {
          initial: {},
          animate: {
               transition: {
                    staggerChildren: stagger,
                    delayChildren: delay
               }
          }
     };
}

/**
 * Create custom fade animation
 */
export function createFade(
     duration: number = 0.2,
     yOffset: number = 0
): Variants {
     return {
          initial: { opacity: 0, y: yOffset },
          animate: {
               opacity: 1,
               y: 0,
               transition: { duration }
          },
          exit: {
               opacity: 0,
               y: -yOffset / 2,
               transition: { duration: duration * 0.75 }
          }
     };
}
