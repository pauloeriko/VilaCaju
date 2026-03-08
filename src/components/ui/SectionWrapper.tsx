"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  narrow?: boolean;
}

export default function SectionWrapper({
  children,
  id,
  className,
  narrow,
}: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "py-20 md:py-28 px-6 md:px-8",
        narrow ? "max-w-3xl" : "max-w-6xl",
        "mx-auto",
        className
      )}
    >
      {children}
    </motion.section>
  );
}
