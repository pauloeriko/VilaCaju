import type { Locale } from "@/lib/i18n/config";

export interface FaqEntry {
  question: Record<Locale, string>;
  answer: Record<Locale, string>;
  category: "villa" | "booking" | "arrival" | "activities";
}

export const faqEntries: FaqEntry[] = [
  // ——— La villa ———
  {
    category: "villa",
    question: {
      fr: "Combien de personnes la villa peut-elle accueillir ?",
      en: "How many guests can the villa accommodate?",
      pt: "Quantas pessoas a villa comporta?",
    },
    answer: {
      fr: "Vila Caju accueille jusqu'à 17 personnes dans ses 6 chambres avec salle de bain privative. Elle est idéale pour les grandes familles, groupes d'amis et séminaires privés.",
      en: "Vila Caju accommodates up to 17 guests in its 6 en-suite bedrooms. It is ideal for large families, groups of friends and private seminars.",
      pt: "Vila Caju acomoda até 17 pessoas em seus 6 quartos com banheiro privativo. É ideal para famílias grandes, grupos de amigos e seminários privados.",
    },
  },
  {
    category: "villa",
    question: {
      fr: "La villa dispose-t-elle de la climatisation ?",
      en: "Does the villa have air conditioning?",
      pt: "A villa tem ar-condicionado?",
    },
    answer: {
      fr: "Oui, toutes les chambres sont équipées de la climatisation. Les espaces de vie sont conçus pour une ventilation naturelle optimale, avec des ouvertures donnant sur l'océan.",
      en: "Yes, all bedrooms are equipped with air conditioning. The living spaces are designed for optimal natural ventilation, with openings facing the ocean.",
      pt: "Sim, todos os quartos têm ar-condicionado. Os espaços de convivência são projetados para ventilação natural ideal, com aberturas voltadas para o oceano.",
    },
  },
  {
    category: "villa",
    question: {
      fr: "La piscine est-elle chauffée ?",
      en: "Is the pool heated?",
      pt: "A piscina é aquecida?",
    },
    answer: {
      fr: "La piscine n'est pas chauffée, mais la température de l'eau est naturellement agréable toute l'année grâce au climat tropical de Pontal de Maceió (eau entre 27 et 32°C).",
      en: "The pool is not heated, but the water temperature is naturally pleasant year-round thanks to Pontal de Maceió's tropical climate (water between 27–32°C).",
      pt: "A piscina não é aquecida, mas a temperatura da água é naturalmente agradável o ano todo graças ao clima tropical de Pontal de Maceió (água entre 27–32°C).",
    },
  },
  {
    category: "villa",
    question: {
      fr: "Les animaux de compagnie sont-ils acceptés ?",
      en: "Are pets allowed?",
      pt: "Animais de estimação são permitidos?",
    },
    answer: {
      fr: "Les animaux de compagnie peuvent être acceptés sur demande et sous réserve d'accord préalable. Contactez-nous pour en discuter avant votre réservation.",
      en: "Pets may be accepted on request and subject to prior agreement. Contact us to discuss before booking.",
      pt: "Animais de estimação podem ser aceitos mediante solicitação e acordo prévio. Entre em contato conosco para discutir antes de reservar.",
    },
  },

  // ——— Réservation ———
  {
    category: "booking",
    question: {
      fr: "Quelle est la durée minimum de séjour ?",
      en: "What is the minimum stay duration?",
      pt: "Qual é a duração mínima de estadia?",
    },
    answer: {
      fr: "La durée minimum est de 5 nuits en basse saison et de 7 nuits en haute et très haute saison. Des exceptions peuvent être envisagées selon les disponibilités — contactez-nous.",
      en: "The minimum stay is 5 nights in low season and 7 nights in high and peak season. Exceptions may be considered depending on availability — contact us.",
      pt: "A estadia mínima é de 5 noites na baixa temporada e 7 noites na alta e altíssima temporada. Exceções podem ser consideradas conforme disponibilidade — entre em contato.",
    },
  },
  {
    category: "booking",
    question: {
      fr: "Comment confirmer ma réservation ?",
      en: "How do I confirm my booking?",
      pt: "Como confirmo minha reserva?",
    },
    answer: {
      fr: "Après validation de votre demande, vous recevrez un contrat de location et les instructions de paiement. La réservation est confirmée à réception de l'acompte.",
      en: "After your request is validated, you will receive a rental contract and payment instructions. The booking is confirmed upon receipt of the deposit.",
      pt: "Após a validação do seu pedido, você receberá um contrato de aluguel e as instruções de pagamento. A reserva é confirmada após o recebimento do depósito.",
    },
  },
  {
    category: "booking",
    question: {
      fr: "Que comprend le prix affiché ?",
      en: "What is included in the displayed price?",
      pt: "O que está incluído no preço exibido?",
    },
    answer: {
      fr: "Le prix comprend la location de la villa, le linge de maison, le ménage de fin de séjour (800 BRL), l'accès à la piscine, le WiFi haut débit et la climatisation. Les transferts aéroport et le chef cuisinier sont disponibles en option.",
      en: "The price includes villa rental, bed linen, end-of-stay cleaning (800 BRL), pool access, high-speed WiFi and air conditioning. Airport transfers and private chef are available as options.",
      pt: "O preço inclui aluguel da villa, roupa de cama, limpeza de fim de estadia (800 BRL), acesso à piscina, WiFi de alta velocidade e ar-condicionado. Transfer aeroporto e chef particular são opções disponíveis.",
    },
  },
  {
    category: "booking",
    question: {
      fr: "Y a-t-il un dépôt de garantie ?",
      en: "Is there a security deposit?",
      pt: "Há um depósito de segurança?",
    },
    answer: {
      fr: "Oui, un dépôt de garantie de 1 000 € à 2 500 € est pré-autorisé sur votre carte 48h avant l'arrivée. Il est restitué intégralement dans les 7 jours suivant votre départ, en l'absence de dommages.",
      en: "Yes, a security deposit of €1,000–€2,500 is pre-authorized on your card 48h before arrival. It is fully returned within 7 days after your departure, in the absence of damage.",
      pt: "Sim, um depósito de segurança de €1.000–€2.500 é pré-autorizado no seu cartão 48h antes da chegada. É devolvido integralmente em 7 dias após a saída, na ausência de danos.",
    },
  },

  // ——— Arrivée & départ ———
  {
    category: "arrival",
    question: {
      fr: "Quels sont les horaires d'arrivée et de départ ?",
      en: "What are the check-in and check-out times?",
      pt: "Quais são os horários de check-in e check-out?",
    },
    answer: {
      fr: "L'arrivée (check-in) se fait à partir de 15h00. Le départ (check-out) est avant 11h00. Des arrangements horaires flexibles peuvent être convenus selon les disponibilités.",
      en: "Check-in is from 3:00 PM. Check-out is before 11:00 AM. Flexible time arrangements can be made depending on availability.",
      pt: "O check-in é a partir das 15h00. O check-out deve ser feito antes das 11h00. Horários flexíveis podem ser combinados conforme disponibilidade.",
    },
  },
  {
    category: "arrival",
    question: {
      fr: "Comment se rendre à la villa depuis l'aéroport ?",
      en: "How do I get to the villa from the airport?",
      pt: "Como chego à villa do aeroporto?",
    },
    answer: {
      fr: "L'aéroport de Maceió (MCZ) est à 25 km, soit environ 30 à 40 minutes de trajet. Nous organisons des transferts privés sur demande. Il est aussi possible de louer un véhicule sur place.",
      en: "Maceió Airport (MCZ) is 25 km away, about 30–40 minutes by car. We arrange private transfers on request. Car rental is also available on site.",
      pt: "O aeroporto de Maceió (MCZ) fica a 25 km, cerca de 30 a 40 minutos de carro. Organizamos transfers privativos sob demanda. Aluguel de carro também está disponível no local.",
    },
  },
  {
    category: "arrival",
    question: {
      fr: "Un service d'accueil est-il prévu à l'arrivée ?",
      en: "Is there a welcome service upon arrival?",
      pt: "Há um serviço de recepção na chegada?",
    },
    answer: {
      fr: "Oui, notre équipe vous accueille à la villa à votre arrivée pour vous présenter les lieux, répondre à vos questions et vous remettre les clés. Un ménage quotidien est inclus pendant tout votre séjour.",
      en: "Yes, our team welcomes you at the villa upon arrival to show you around, answer your questions and hand over the keys. Daily housekeeping is included throughout your stay.",
      pt: "Sim, nossa equipe recebe você na villa à chegada para apresentar o espaço, responder suas perguntas e entregar as chaves. Limpeza diária está incluída durante toda a estadia.",
    },
  },

  // ——— Activités & séjour ———
  {
    category: "activities",
    question: {
      fr: "Le kitesurf est-il pratiquable depuis la villa ?",
      en: "Can kitesurfing be practiced from the villa?",
      pt: "É possível praticar kitesurf a partir da villa?",
    },
    answer: {
      fr: "Pontal de Maceió est l'une des meilleures destinations mondiales de kitesurf. Les spots sont accessibles à pied ou en quelques minutes. Des cours et locations de matériel peuvent être organisés sur demande, pour tous niveaux.",
      en: "Pontal de Maceió is one of the world's best kitesurfing destinations. Spots are accessible on foot or within minutes. Lessons and equipment rental can be arranged on request, for all levels.",
      pt: "Pontal de Maceió é um dos melhores destinos mundiais de kitesurf. Os spots são acessíveis a pé ou em poucos minutos. Aulas e aluguel de equipamentos podem ser organizados sob demanda, para todos os níveis.",
    },
  },
  {
    category: "activities",
    question: {
      fr: "Peut-on organiser des événements ou séminaires à la villa ?",
      en: "Can events or seminars be organized at the villa?",
      pt: "É possível organizar eventos ou seminários na villa?",
    },
    answer: {
      fr: "Oui, la villa est parfaitement adaptée aux séminaires privés, retraites et événements familiaux jusqu'à 17 personnes. Contactez-nous pour discuter de vos besoins spécifiques (catering, matériel audiovisuel, programme d'activités).",
      en: "Yes, the villa is perfectly suited to private seminars, retreats and family events for up to 17 people. Contact us to discuss your specific needs (catering, audiovisual equipment, activity programme).",
      pt: "Sim, a villa é perfeitamente adequada para seminários privados, retiros e eventos familiares para até 17 pessoas. Entre em contato para discutir suas necessidades específicas (catering, equipamento audiovisual, programa de atividades).",
    },
  },
  {
    category: "activities",
    question: {
      fr: "Y a-t-il des restaurants à proximité ?",
      en: "Are there restaurants nearby?",
      pt: "Há restaurantes nas proximidades?",
    },
    answer: {
      fr: "Oui, plusieurs restaurants proposant fruits de mer frais, tapioca et spécialités du Nordeste se trouvent à quelques minutes à pied. Notre équipe peut également vous recommander les meilleures adresses locales.",
      en: "Yes, several restaurants offering fresh seafood, tapioca and Nordeste specialties are just a few minutes' walk away. Our team can also recommend the best local spots.",
      pt: "Sim, vários restaurantes com frutos do mar frescos, tapioca e especialidades do Nordeste ficam a poucos minutos a pé. Nossa equipe também pode recomendar os melhores endereços locais.",
    },
  },
];
