"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pathname}
        // initial={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        // exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen flex flex-col items-center justify-center gap-6 p-6"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
