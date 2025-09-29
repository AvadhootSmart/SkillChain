"use client";

import Link from "next/link";
import { motion } from "motion/react";

const project = {
  id: "1",
  title: "Awesome Project",
  image: "https://github.com/shadcn.png",
  description:
    "This is a detailed description of the project. It explains everything about it, showing how amazing it is.",
};

export default function ProjectDetailPage() {
  return (
    <div className="flex flex-col items-center min-h-screen p-12 gap-6">
      {/* Image */}
      <motion.div layoutId={`card-${project.id}`} className="w-full max-w-2xl">
        <motion.img
          layoutId={`card-image-${project.id}`}
          src={project.image}
          className="w-full h-96 object-cover rounded-lg shadow-lg"
        />
        <motion.h1
          layoutId={`card-heading-${project.id}`}
          layout={"preserve-aspect"}
          className="text-4xl font-bold mt-6"
        >
          {project.title}
        </motion.h1>
      </motion.div>

      {/* Description */}
      <p className="max-w-2xl text-gray-700">{project.description}</p>

      <Link href="/playground">
        <button className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 mt-6">
          Back to Home
        </button>
      </Link>
    </div>
  );
}
