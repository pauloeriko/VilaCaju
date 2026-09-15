"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import CurrencySwitcher from "@/components/layout/CurrencySwitcher";

const BREADCRUMB_LABELS: Record<string, string> = {
  admin: "Réservations",
  seasons: "Saisons & Tarifs",
  settings: "Paramètres",
};

interface AdminHeaderProps {
  lang: string;
}

export default function AdminHeader({ lang }: AdminHeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  // segments: [lang, "admin", ...rest]
  const crumbs = segments.slice(1); // ["admin", "reservations", ...]

  return (
    <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-3 flex items-center justify-between">
      <nav className="flex items-center gap-1.5 text-sm">
        {crumbs.map((segment, i) => {
          const label = BREADCRUMB_LABELS[segment] ?? segment;
          const href = `/${lang}/${crumbs.slice(0, i + 1).join("/")}`;
          const isLast = i === crumbs.length - 1;

          return (
            <span key={segment} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
              {isLast ? (
                <span className="font-medium text-gray-800">{label}</span>
              ) : (
                <Link href={href} className="text-gray-400 hover:text-gray-600 transition-colors">
                  {label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        <CurrencySwitcher scrolled />
        <Link
          href={`/${lang}`}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-terracotta-500 transition-colors"
          target="_blank"
        >
          Voir le site <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
