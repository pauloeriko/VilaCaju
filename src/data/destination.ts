import type { Activity } from "@/types";

export const activities: Activity[] = [
  {
    icon: "Wind",
    title: { fr: "Kitesurf de classe mondiale", en: "World-class kitesurfing", pt: "Kitesurf de classe mundial" },
    description: {
      fr: "Pontal de Maceió figure parmi les meilleures destinations mondiales de kitesurf : vent constant, lagunes peu profondes et spots accessibles à tous niveaux.",
      en: "Pontal de Maceió ranks among the world's best kitesurfing destinations: consistent winds, shallow lagoons and spots for all skill levels.",
      pt: "Pontal de Maceió está entre os melhores destinos mundiais de kitesurf: vento constante, lagoas rasas e spots para todos os níveis.",
    },
    image: "/images/destination-kitesurf-phare-pontal.jpg",
  },
  {
    icon: "Waves",
    title: { fr: "Plages paradisiaques", en: "Paradise beaches", pt: "Praias paradis\u00edacas" },
    description: {
      fr: "Des kilom\u00e8tres de sable blanc et d\u2019eaux cristallines, loin de la foule.",
      en: "Kilometers of white sand and crystal-clear waters, far from the crowds.",
      pt: "Quil\u00f4metros de areia branca e \u00e1guas cristalinas, longe da multid\u00e3o.",
    },
    image: "/images/destination-plage-sable-blanc.jpg",
  },
  {
    icon: "Fish",
    title: { fr: "Piscines naturelles", en: "Natural pools", pt: "Piscinas naturais" },
    description: {
      fr: "Formations coralliennes cr\u00e9ant des bassins naturels accessibles \u00e0 mar\u00e9e basse.",
      en: "Coral formations creating natural pools accessible at low tide.",
      pt: "Forma\u00e7\u00f5es de coral criando piscinas naturais acess\u00edveis na mar\u00e9 baixa.",
    },
    image: "/images/destination-eaux-turquoise.jpg",
  },
  {
    icon: "Sailboat",
    title: { fr: "Excursions en bateau", en: "Boat excursions", pt: "Passeios de barco" },
    description: {
      fr: "D\u00e9couvrez le littoral depuis la mer avec des sorties en jangada traditionnelle.",
      en: "Discover the coastline from the sea with traditional jangada boat trips.",
      pt: "Descubra o litoral pelo mar com passeios de jangada tradicional.",
    },
    image: "/images/destination-jangadas-colorees.jpg",
  },
  {
    icon: "UtensilsCrossed",
    title: { fr: "Gastronomie locale", en: "Local cuisine", pt: "Gastronomia local" },
    description: {
      fr: "Fruits de mer frais, tapioca, a\u00e7a\u00ed et sp\u00e9cialit\u00e9s du Nordeste.",
      en: "Fresh seafood, tapioca, a\u00e7a\u00ed and Nordeste specialties.",
      pt: "Frutos do mar frescos, tapioca, a\u00e7a\u00ed e especialidades do Nordeste.",
    },
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  },
  {
    icon: "TreePalm",
    title: { fr: "Randonn\u00e9es c\u00f4ti\u00e8res", en: "Coastal hikes", pt: "Trilhas costeiras" },
    description: {
      fr: "Sentiers entre cocotiers et falaises, avec des vues imprenables sur l\u2019Atlantique.",
      en: "Trails between coconut palms and cliffs, with stunning Atlantic views.",
      pt: "Trilhas entre coqueiros e falésias, com vistas deslumbrantes do Atl\u00e2ntico.",
    },
    image: "/images/destination-falaises-cotieres-colorees.jpg",
  },
];
