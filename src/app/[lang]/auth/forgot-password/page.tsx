"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

const ERROR_MESSAGES: Record<string, string> = {
  "Email rate limit exceeded": "Trop de tentatives. Réessayez dans quelques minutes.",
};

function translateError(message: string): string {
  return ERROR_MESSAGES[message] ?? "Une erreur est survenue. Réessayez.";
}

export default function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);

  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState<string | null>(null);
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/${lang}/auth/callback` },
    );

    setLoading(false);

    if (authError) {
      setError(translateError(authError.message));
      return;
    }

    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vila Caju</h1>
          <p className="text-sm text-gray-500 mt-1">Espace administrateur</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Mot de passe oublié</h2>

          {sent ? (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3.5 py-2.5">
              Si un compte existe avec cet email, un lien de réinitialisation vient de lui être envoyé.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent transition"
                  placeholder="admin@example.com"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors mt-2"
              >
                {loading ? "Envoi…" : "Envoyer le lien"}
              </button>
            </form>
          )}

          <p className="text-sm text-gray-500 text-center mt-6">
            <Link href={`/${lang}/admin/login`} className="text-terracotta-600 hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
