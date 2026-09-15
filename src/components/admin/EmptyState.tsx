import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
}

export default function EmptyState({ icon: Icon, title, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-4">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {hint && <p className="text-xs text-gray-400 mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}
