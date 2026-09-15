"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Sun,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  lang: string;
  userEmail: string;
}

const NAV_ITEMS = [
  { key: "reservations", icon: CalendarDays, label: "Réservations", path: "" },
  { key: "seasons", icon: Sun, label: "Saisons & Tarifs", path: "/seasons" },
  { key: "settings", icon: Settings, label: "Paramètres", path: "/settings" },
];

export default function AdminSidebar({ lang, userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const basePath = `/${lang}/admin`;

  // Fermer le menu mobile quand on navigue
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function isActive(itemPath: string): boolean {
    const fullPath = basePath + itemPath;
    if (itemPath === "") {
      return pathname === basePath || pathname === basePath + "/";
    }
    return pathname.startsWith(fullPath);
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100 shrink-0">
        <span className="w-8 h-8 rounded-lg bg-terracotta-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          VC
        </span>
        {(!collapsed || mobileOpen) && (
          <span className="font-bold text-gray-900 text-sm tracking-tight truncate">
            Vila Caju
          </span>
        )}
        {/* Close button mobile */}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto md:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const showLabel = !collapsed || mobileOpen;
          return (
            <Link
              key={item.key}
              href={basePath + item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-terracotta-50 text-terracotta-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                !showLabel && "justify-center px-0",
              )}
              title={!showLabel ? item.label : undefined}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", active ? "text-terracotta-500" : "text-gray-400")} />
              {showLabel && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3 space-y-2 shrink-0">
        {(!collapsed || mobileOpen) && (
          <p className="text-[10px] text-gray-400 truncate px-1">{userEmail}</p>
        )}
        <a
          href="/api/admin/logout"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors",
            !(!collapsed || mobileOpen) && "justify-center px-0",
          )}
          title={collapsed && !mobileOpen ? "Déconnexion" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || mobileOpen) && "Déconnexion"}
        </a>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="hidden md:flex w-full items-center justify-center py-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          aria-label={collapsed ? "Déplier" : "Replier"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar mobile (drawer) */}
      <aside
        className={cn(
          "md:hidden fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-white border-r border-gray-200 w-64 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar desktop */}
      <aside
        className={cn(
          "hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-white border-r border-gray-200 transition-all duration-200",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Spacer desktop */}
      <div className={cn("hidden md:block shrink-0 transition-all duration-200", collapsed ? "w-16" : "w-60")} />
    </>
  );
}
