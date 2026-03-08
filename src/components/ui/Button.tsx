"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "whatsapp";
  href?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  external?: boolean;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-terracotta-500 text-white font-semibold shadow-natural hover:bg-terracotta-600 active:bg-terracotta-700 hover:shadow-natural-lg",
  secondary:
    "border-2 border-terracotta-400 text-terracotta-500 font-semibold hover:bg-terracotta-50 active:bg-terracotta-100",
  ghost:
    "text-terracotta-500 font-medium hover:underline underline-offset-4",
  whatsapp:
    "bg-[#25D366] text-white font-semibold shadow-natural hover:bg-[#1ea952] hover:shadow-natural-lg",
};

const sizeClasses: Record<string, string> = {
  sm: "px-5 py-2.5 text-sm rounded-soft",
  md: "px-8 py-3.5 text-base rounded-soft",
  lg: "px-10 py-4 text-lg rounded-soft",
};

export default function Button({
  children,
  variant = "primary",
  href,
  onClick,
  size = "md",
  className,
  type = "button",
  external,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (href && external) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.a>
    );
  }

  if (href) {
    return (
      <MotionLink
        href={href}
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={classes}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}
