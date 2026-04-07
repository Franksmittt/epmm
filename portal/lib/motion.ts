import type { Transition } from "framer-motion";

/** Premium expansion tuning per architecture spec (Samsung-style fluidity). */
export const premiumSpring: Transition = {
  type: "spring",
  stiffness: 80,
  damping: 20,
  mass: 1.2,
};
