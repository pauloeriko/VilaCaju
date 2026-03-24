import type { Room, AmenityCategory } from "@/types";

export const rooms: Room[] = [
  {
    id: "master",
    name: { fr: "Suite Master", en: "Master Suite", pt: "Suíte Master" },
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
    image: "/images/photo-chambre1.jpg",
  },
  {
    id: "ocean",
    name: { fr: "Chambre Océan", en: "Ocean Room", pt: "Quarto Oceano" },
    capacity: 3,
    beds: { fr: "1 lit double + 1 lit simple", en: "1 double + 1 single bed", pt: "1 cama casal + 1 solteiro" },
    ensuite: true,
    image: "/images/photo-chambres2.jpg",
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
    image: "/images/photo-chambre3.jpg",
  },
  {
    id: "caju",
    name: { fr: "Chambre Caju", en: "Caju Room", pt: "Quarto Caju" },
    capacity: 3,
    beds: { fr: "1 lit double + 1 lit simple", en: "1 double + 1 single bed", pt: "1 cama casal + 1 solteiro" },
    ensuite: true,
    image: "/images/photo-chambre4.jpg",
  },
  {
    id: "brisa",
    name: { fr: "Chambre Brisa", en: "Brisa Room", pt: "Quarto Brisa" },
    capacity: 2,
    beds: { fr: "1 lit double", en: "1 double bed", pt: "1 cama casal" },
    ensuite: true,
    image: "/images/villa-chambre-master-king.jpg",
  },
];

export const amenityCategories: AmenityCategory[] = [
  {
    title: { fr: "Piscine & Jardin", en: "Pool & Garden", pt: "Piscina & Jardim" },
    icon: "Waves",
    items: [
      { icon: "Waves", label: { fr: "Piscine privée", en: "Private pool", pt: "Piscina privativa" } },
      { icon: "TreePalm", label: { fr: "Jardin tropical", en: "Tropical garden", pt: "Jardim tropical" } },
      { icon: "Armchair", label: { fr: "Terrasse meublée", en: "Furnished terrace", pt: "Terraço mobiliado" } },
      { icon: "Flame", label: { fr: "Barbecue", en: "BBQ grill", pt: "Churrasqueira" } },
    ],
  },
  {
    title: { fr: "Cuisine & Repas", en: "Kitchen & Dining", pt: "Cozinha & Refeições" },
    icon: "UtensilsCrossed",
    items: [
      { icon: "UtensilsCrossed", label: { fr: "Cuisine équipée", en: "Fully equipped kitchen", pt: "Cozinha equipada" } },
      { icon: "Coffee", label: { fr: "Machine à café", en: "Coffee machine", pt: "Máquina de café" } },
      { icon: "Wine", label: { fr: "Cave à vin", en: "Wine cellar", pt: "Adega" } },
      { icon: "ChefHat", label: { fr: "Chef sur demande (option)", en: "Private chef (option)", pt: "Chef particular (opção)" } },
    ],
  },
  {
    title: { fr: "Divertissement", en: "Entertainment", pt: "Entretenimento" },
    icon: "Tv",
    items: [
      { icon: "Tv", label: { fr: "TV écran plat", en: "Flat screen TV", pt: "TV tela plana" } },
      { icon: "Wifi", label: { fr: "Wi-Fi haut débit", en: "High-speed Wi-Fi", pt: "Wi-Fi alta velocidade" } },
      { icon: "Music", label: { fr: "Système audio", en: "Sound system", pt: "Sistema de som" } },
      { icon: "Gamepad2", label: { fr: "Jeux de société", en: "Board games", pt: "Jogos de tabuleiro" } },
    ],
  },
  {
    title: { fr: "Services", en: "Services", pt: "Serviços" },
    icon: "ConciergeBell",
    items: [
      { icon: "SprayCan", label: { fr: "Ménage quotidien", en: "Daily housekeeping", pt: "Limpeza diária" } },
      { icon: "Car", label: { fr: "Parking privé", en: "Private parking", pt: "Estacionamento privativo" } },
      { icon: "Plane", label: { fr: "Transfert aéroport (option)", en: "Airport transfer (option)", pt: "Transfer aeroporto (opção)" } },
      { icon: "Footprints", label: { fr: "Sortie à cheval (option)", en: "Horse riding (option)", pt: "Passeio a cavalo (opção)" } },
      { icon: "Route", label: { fr: "Location de buggy (option)", en: "Buggy rental (option)", pt: "Aluguel de buggy (opção)" } },
    ],
  },
];
