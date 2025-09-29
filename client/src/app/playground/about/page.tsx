"use client";

import Link from "next/link";
import { motion } from "motion/react";

export default function PlaygroundAbout() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      {/* Heading centered */}
      <motion.div
        layoutId="heading"
        className="text-5xl font-bold bg-green-200 px-6 py-4 rounded"
      >
        About Heading
      </motion.div>

      {/* Button below heading */}
      <Link href="/playground">
        <button className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700">
          Back to Home
        </button>
      </Link>
    </div>
  );
}
