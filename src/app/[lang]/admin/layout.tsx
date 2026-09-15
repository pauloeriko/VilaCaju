import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/supabase/queries";
import { CurrencyProvider } from "@/lib/currency/CurrencyContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { ToastProvider } from "@/components/admin/ToastProvider";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Non authentifié : rendu sans sidebar (page login gérée par le middleware)
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50">
        {children}
      </div>
    );
  }

  const { data: settings } = await getSettings();

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex">
      <CurrencyProvider eurRate={settings?.eur_rate}>
        <ToastProvider>
          <AdminSidebar lang={lang} userEmail={user.email ?? ""} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AdminHeader lang={lang} />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </ToastProvider>
      </CurrencyProvider>
    </div>
  );
}
