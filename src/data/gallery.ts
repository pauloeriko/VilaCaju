import type { GalleryImage } from "@/types";

export const galleryImages: GalleryImage[] = [
  {
    // Grande image principale — piscine + mer + palmiers (vue de magazine)
    src: "/images/villa-piscine-mer-palmiers.png",
    alt: { fr: "Piscine privée avec vue sur l'océan", en: "Private pool overlooking the ocean", pt: "Piscina privativa com vista para o oceano" },
    colSpan: 7,
    rowSpan: 2,
  },
  {
    // Façade villa + cour de sable
    src: "/images/villa-facade-cour-sable.png",
    alt: { fr: "Façade de la villa et cour de sable", en: "Villa facade and sand courtyard", pt: "Fachada da villa e pátio de areia" },
    colSpan: 5,
  },
  {
    // Salon intérieur avec volume
    src: "/images/villa-salon-interieur-volume.jpg",
    alt: { fr: "Salon intérieur aux volumes généreux", en: "Spacious interior living room", pt: "Sala de estar interna ampla" },
    colSpan: 5,
  },
  {
    // Piscine + transats + pergola + mer (grand angle)
    src: "/images/villa-piscine-transats-pergola.jpg",
    alt: { fr: "Piscine, transats et jardin tropical", en: "Pool, sun loungers and tropical garden", pt: "Piscina, espreguiçadeiras e jardim tropical" },
    colSpan: 4,
  },
  {
    // Salon extérieur en lumière naturelle
    src: "/images/villa-salon-exterieur-lumiere.jpg",
    alt: { fr: "Salon extérieur baigné de lumière", en: "Outdoor lounge bathed in light", pt: "Sala externa banhada de luz" },
    colSpan: 4,
  },
  {
    // Terrasse couverte avec fleurs
    src: "/images/villa-terrasse-couverte-fleurs.jpg",
    alt: { fr: "Terrasse couverte fleurie", en: "Covered terrace with flowers", pt: "Terraço coberto com flores" },
    colSpan: 4,
  },
];
