"use client";

import Link from "next/link";
import { motion } from "motion/react";

const project = {
  id: "1",
  title: "Awesome Project",
  image: "https://github.com/shadcn.png",
};

export default function PlaygroundHome() {
  return (
    <div className="flex flex-col items-center gap-12 min-h-screen pt-12">
      {/* Project Card */}
      <Link href="/playground/project/1" className="w-full max-w-sm">
        <motion.div
          layoutId={`card-${project.id}`}
          className="bg-white shadow rounded-lg cursor-pointer overflow-hidden"
        >
          <motion.img
            layoutId={`card-image-${project.id}`}
            src={project.image}
            alt={project.title}
            className="w-full h-48 object-cover"
          />
          <motion.h2
            layoutId={`card-heading-${project.id}`}
            className="text-2xl font-bold p-4"
          >
            {project.title}
          </motion.h2>
        </motion.div>
      </Link>
    </div>
  );
}
