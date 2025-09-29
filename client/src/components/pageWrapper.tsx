"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { useTransitionStore } from "../store/transition.store";

interface Props {
  children: ReactNode;
  variants?: Variants;
  className?: string;
}

export default function Page({ children, variants, className }: Props) {
  const { isTransitioning, duration } = useTransitionStore();

  const defaultVariants: Variants = {
    initial: { opacity: 0, y: 20, filter: "blur(5px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: 20, filter: "blur(5px)" },
  };
  // We use a key that toggles on isTransitioning to force re-mount
  const key = isTransitioning ? "exit" : "enter";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants ? variants : defaultVariants}
        transition={{ duration: (duration + 100) / 1000, ease: "easeInOut" }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
