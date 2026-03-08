import type { Locale } from "@/lib/i18n/config";

export interface GalleryImage {
  src: string;
  alt: Record<Locale, string>;
  colSpan?: number;
  rowSpan?: number;
}

export interface Review {
  id: string;
  name: string;
  country: string;
  flag: string;
  rating: number;
  source: "airbnb" | "google" | "direct";
  text: Record<Locale, string>;
  date: string;
}

export interface Room {
  id: string;
  name: Record<Locale, string>;
  capacity: number;
  beds: Record<Locale, string>;
  ensuite: boolean;
  image: string;
}

export interface Amenity {
  icon: string;
  label: Record<Locale, string>;
}

export interface AmenityCategory {
  title: Record<Locale, string>;
  icon: string;
  items: Amenity[];
}

export interface Activity {
  icon: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  image: string;
}
