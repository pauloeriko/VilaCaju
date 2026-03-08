import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sand-50 px-6">
      <h1 className="font-heading text-6xl font-bold text-charcoal-800 mb-4">404</h1>
      <p className="text-charcoal-700 text-lg mb-8">Page not found</p>
      <Link
        href="/fr"
        className="bg-terracotta-500 text-white font-semibold px-8 py-3.5 rounded-soft hover:bg-terracotta-600 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
