"use client";

import React from "react";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  error?: string;
}

export default function DatePicker({
  label,
  value,
  onChange,
  min,
  error,
}: DatePickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        className={`w-full px-4 py-3 border rounded-soft bg-white text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400/50 focus:border-terracotta-400 transition-colors ${
          error ? "border-red-400" : "border-sand-300"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
