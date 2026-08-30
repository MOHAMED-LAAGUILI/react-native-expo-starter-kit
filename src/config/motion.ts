import type { WithSpringConfig } from 'react-native-reanimated';

/**
 * Shared motion presets — single source of truth for spring physics.
 * Components must reference these instead of inlining `{ damping, stiffness, mass }`
 * literals so the whole app animates with one consistent feel.
 */

/** Tactile press feedback (buttons, switches, checkboxes, gooey squash). */
export const SPRING_PRESS: WithSpringConfig = {
  damping: 13,
  mass: 0.9,
  stiffness: 150,
};

/** Gentle settle for larger surfaces (sheets, modals, cards). */
export const SPRING_GENTLE: WithSpringConfig = {
  damping: 18,
  mass: 1,
  stiffness: 180,
};
