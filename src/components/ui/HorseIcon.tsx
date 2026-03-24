import React from "react";

interface HorseIconProps {
  className?: string;
}

/** Icône cheval personnalisée — style lucide (stroke, 24×24) */
export default function HorseIcon({ className }: HorseIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Tête */}
      <circle cx="17" cy="5" r="2.5" />
      {/* Oreille */}
      <path d="M15.5 3L15 1.5L16.8 2.5" />
      {/* Encolure */}
      <path d="M15 7.5L13.5 10.5" />
      {/* Corps */}
      <path d="M13.5 10.5C14 12 14 14 13 15.5L8 15.5C6.5 15 6 13 6.5 12C7 10 9 9 11 9C13 9 13.5 9.5 13.5 10.5Z" />
      {/* Antérieurs */}
      <line x1="13" y1="15.5" x2="13.5" y2="21" />
      <line x1="11" y1="15.5" x2="11.5" y2="21" />
      {/* Postérieurs */}
      <line x1="9" y1="15.5" x2="9" y2="21" />
      <line x1="7" y1="15.5" x2="7" y2="21" />
      {/* Queue */}
      <path d="M6.5 12C5 11 3 10 2 8" />
    </svg>
  );
}
