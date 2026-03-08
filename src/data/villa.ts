import type { Room, AmenityCategory } from "@/types";

export const rooms: Room[] = [
  {
    id: "master",
    name: { fr: "Suite Master", en: "Master Suite", pt: "Su\u00edte Master" },
    capacity: 2,
    beds: { fr: "1 lit king-size", en: "1 king bed", pt: "1 cama king" },
    ensuite: true,
    image: "/images/villa-chambre-master-king.jpg",
  },
  {
    id: "palmier",
    name: { fr: "Chambre Palmier", en: "Palm Room", pt: "Quarto Palmeira" },
    capacity: 3,
    beds: { fr: "1 lit double + 1 lit simple", en: "1 double + 1 single bed", pt: "1 cama casal + 1 solteiro" },
    ensuite: true,
    image: "/images/villa-chambre-palmier-exterieur.jpg",
  },
  {
    id: "ocean",
    name: { fr: "Chambre Oc\u00e9an", en: "Ocean Room", pt: "Quarto Oceano" },
    capacity: 3,
    beds: { fr: "1 lit double + 1 lit simple", en: "1 double + 1 single bed", pt: "1 cama casal + 1 solteiro" },
    ensuite: true,
    image: "/images/villa-chambre-ocean-exterieur.jpg",
  },
  {
    id: "jardin",
    name: { fr: "Chambre Jardin", en: "Garden Room", pt: "Quarto Jardim" },
    capacity: 3,
    beds: { fr: "1 lit double + 1 lit simple", en: "1 double + 1 single bed", pt: "1 cama casal + 1 solteiro" },
    ensuite: true,
    image: "/images/villa-sdb-bois-miroir.jpg",
  },
  {
    id: "soleil",
    name: { fr: "Chambre Soleil", en: "Sun Room", pt: "Quarto Sol" },
    capacity: 3,
    beds: { fr: "3 lits simples", en: "3 single beds", pt: "3 camas solteiro" },
    ensuite: true,
    image: "/images/villa-douche-galets-pluie.jpg",
  },
  {
    id: "caju",
    name: { fr: "Chambre Caju", en: "Caju Room", pt: "Quarto Caju" },
    capacity: 3,
    beds: { fr: "1 lit double + 1 lit simple", en: "1 double + 1 single bed", pt: "1 cama casal + 1 solteiro" },
    ensuite: true,
    image: "/images/villa-couloir-cave-a-vin.jpg",
  },
];

export const amenityCategories: AmenityCategory[] = [
  {
    title: { fr: "Piscine & Jardin", en: "Pool & Garden", pt: "Piscina & Jardim" },
    icon: "Waves",
    items: [
      { icon: "Waves", label: { fr: "Piscine priv\u00e9e", en: "Private pool", pt: "Piscina privativa" } },
      { icon: "TreePalm", label: { fr: "Jardin tropical", en: "Tropical garden", pt: "Jardim tropical" } },
      { icon: "Armchair", label: { fr: "Terrasse meubl\u00e9e", en: "Furnished terrace", pt: "Terra\u00e7o mobiliado" } },
      { icon: "Flame", label: { fr: "Barbecue", en: "BBQ grill", pt: "Churrasqueira" } },
    ],
  },
  {
    title: { fr: "Cuisine & Repas", en: "Kitchen & Dining", pt: "Cozinha & Refei\u00e7\u00f5es" },
    icon: "UtensilsCrossed",
    items: [
      { icon: "UtensilsCrossed", label: { fr: "Cuisine \u00e9quip\u00e9e", en: "Fully equipped kitchen", pt: "Cozinha equipada" } },
      { icon: "Coffee", label: { fr: "Machine \u00e0 caf\u00e9", en: "Coffee machine", pt: "M\u00e1quina de caf\u00e9" } },
      { icon: "Wine", label: { fr: "Cave \u00e0 vin", en: "Wine cellar", pt: "Adega" } },
      { icon: "ChefHat", label: { fr: "Chef sur demande", en: "Private chef", pt: "Chef particular" } },
    ],
  },
  {
    title: { fr: "Divertissement", en: "Entertainment", pt: "Entretenimento" },
    icon: "Tv",
    items: [
      { icon: "Tv", label: { fr: "TV \u00e9cran plat", en: "Flat screen TV", pt: "TV tela plana" } },
      { icon: "Wifi", label: { fr: "Wi-Fi haut d\u00e9bit", en: "High-speed Wi-Fi", pt: "Wi-Fi alta velocidade" } },
      { icon: "Music", label: { fr: "Syst\u00e8me audio", en: "Sound system", pt: "Sistema de som" } },
      { icon: "Gamepad2", label: { fr: "Jeux de soci\u00e9t\u00e9", en: "Board games", pt: "Jogos de tabuleiro" } },
    ],
  },
  {
    title: { fr: "Services", en: "Services", pt: "Servi\u00e7os" },
    icon: "ConciergeBell",
    items: [
      { icon: "SprayCan", label: { fr: "M\u00e9nage quotidien", en: "Daily housekeeping", pt: "Limpeza di\u00e1ria" } },
      { icon: "Car", label: { fr: "Parking priv\u00e9", en: "Private parking", pt: "Estacionamento privativo" } },
      { icon: "ShieldCheck", label: { fr: "S\u00e9curit\u00e9 24h", en: "24h security", pt: "Seguran\u00e7a 24h" } },
      { icon: "Plane", label: { fr: "Transfert a\u00e9roport", en: "Airport transfer", pt: "Transfer aeroporto" } },
    ],
  },
];
