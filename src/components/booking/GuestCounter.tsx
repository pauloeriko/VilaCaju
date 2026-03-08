"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";

interface GuestCounterProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export default function GuestCounter({
  label,
  value,
  min,
  max,
  onChange,
}: GuestCounterProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-charcoal-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-9 h-9 rounded-full border border-sand-300 flex items-center justify-center text-charcoal-700 hover:border-terracotta-400 hover:text-terracotta-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-semibold text-charcoal-800">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-9 h-9 rounded-full border border-sand-300 flex items-center justify-center text-charcoal-700 hover:border-terracotta-400 hover:text-terracotta-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
