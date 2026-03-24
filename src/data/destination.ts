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
    icon: "Footprints",
    title: { fr: "Balades à cheval", en: "Horse riding", pt: "Passeios a cavalo" },
    description: {
      fr: "Partez à l'aventure sur des plages sauvages et des dunes à cheval, une expérience inoubliable au coucher du soleil.",
      en: "Ride along wild beaches and dunes on horseback — an unforgettable experience at sunset.",
      pt: "Aventure-se em praias selvagens e dunas a cavalo — uma experiência inesquecível ao pôr do sol.",
    },
    image: "/images/destination-plage-sable-blanc.jpg",
  },
  {
    icon: "Route",
    title: { fr: "Excursion en buggy", en: "Buggy excursion", pt: "Excursão de buggy" },
    description: {
      fr: "Explorez les paysages spectaculaires de la région — lagunes, falaises et villages de pêcheurs — à bord d'un buggy.",
      en: "Explore the region's spectacular landscapes — lagoons, cliffs and fishing villages — by buggy.",
      pt: "Explore as paisagens espetaculares da região — lagoas, falésias e vilas de pescadores — de buggy.",
    },
    image: "/images/destination-eaux-turquoise.jpg",
  },
  {
    icon: "Sailboat",
    title: { fr: "Excursions en bateau", en: "Boat excursions", pt: "Passeios de barco" },
    description: {
      fr: "Découvrez le littoral depuis la mer avec des sorties en jangada traditionnelle.",
      en: "Discover the coastline from the sea with traditional jangada boat trips.",
      pt: "Descubra o litoral pelo mar com passeios de jangada tradicional.",
    },
    image: "/images/destination-jangadas-colorees.jpg",
  },
  {
    icon: "UtensilsCrossed",
    title: { fr: "Gastronomie locale", en: "Local cuisine", pt: "Gastronomia local" },
    description: {
      fr: "Fruits de mer frais, tapioca, açaí et spécialités du Nordeste.",
      en: "Fresh seafood, tapioca, açaí and Nordeste specialties.",
      pt: "Frutos do mar frescos, tapioca, açaí e especialidades do Nordeste.",
    },
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  },
  {
    icon: "TreePalm",
    title: { fr: "Randonnées côtières", en: "Coastal hikes", pt: "Trilhas costeiras" },
    description: {
      fr: "Sentiers entre cocotiers et falaises, avec des vues imprenables sur l'Atlantique.",
      en: "Trails between coconut palms and cliffs, with stunning Atlantic views.",
      pt: "Trilhas entre coqueiros e falésias, com vistas deslumbrantes do Atlântico.",
    },
    image: "/images/destination-falaises-cotieres-colorees.jpg",
  },
];
