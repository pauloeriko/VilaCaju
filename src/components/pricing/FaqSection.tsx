"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface FaqItem {
  question: Record<Locale, string>;
  answer: Record<Locale, string>;
}

const faqItems: FaqItem[] = [
  {
    question: {
      fr: "Que comprend le prix affiché ?",
      en: "What is included in the displayed price?",
      pt: "O que está incluído no preço exibido?",
    },
    answer: {
      fr: "Le prix inclut la location de la villa, le linge de maison, le ménage de fin de séjour (800 BRL), l'accès à la piscine, le WiFi et la climatisation dans toutes les chambres. Les transferts aéroport et le chef cuisinier sont disponibles en option.",
      en: "The price includes villa rental, bed linen, end-of-stay cleaning (800 BRL), pool access, WiFi and air conditioning in all rooms. Airport transfers and private chef are available as options.",
      pt: "O preço inclui aluguel da villa, roupa de cama, limpeza de fim de estadia (800 BRL), acesso à piscina, WiFi e ar-condicionado em todos os quartos. Transfer aeroporto e chef particular são opções disponíveis.",
    },
  },
  {
    question: {
      fr: "Comment fonctionne le paiement ?",
      en: "How does payment work?",
      pt: "Como funciona o pagamento?",
    },
    answer: {
      fr: "Selon la saison, un acompte de 30 à 40% est requis à la réservation (100% pour le Réveillon). Le solde est réglé 30 à 45 jours avant l'arrivée. Le paiement s'effectue par virement bancaire ou Stripe.",
      en: "Depending on the season, a deposit of 30–40% is required at booking (100% for New Year's Eve). The balance is due 30–45 days before arrival. Payment is made by bank transfer or Stripe.",
      pt: "Dependendo da temporada, um depósito de 30–40% é necessário na reserva (100% para o Réveillon). O saldo vence 30–45 dias antes da chegada. O pagamento é feito por transferência bancária ou Stripe.",
    },
  },
  {
    question: {
      fr: "Puis-je annuler ma réservation ?",
      en: "Can I cancel my booking?",
      pt: "Posso cancelar minha reserva?",
    },
    answer: {
      fr: "Les conditions d'annulation varient selon la saison. En basse saison, annulation gratuite jusqu'à 45 jours avant l'arrivée. En haute saison, jusqu'à 60 jours. Le Réveillon est non remboursable. Consultez la section 'Politiques d'annulation' pour le détail complet.",
      en: "Cancellation conditions vary by season. In low season, free cancellation up to 45 days before arrival. In high season, up to 60 days. New Year's Eve is non-refundable. See the 'Cancellation policies' section for full details.",
      pt: "As condições de cancelamento variam por temporada. Na baixa temporada, cancelamento gratuito até 45 dias antes da chegada. Na alta temporada, até 60 dias. O Réveillon não é reembolsável. Veja a seção 'Políticas de cancelamento' para detalhes.",
    },
  },
  {
    question: {
      fr: "Y a-t-il un dépôt de garantie ?",
      en: "Is there a security deposit?",
      pt: "Há um depósito de segurança?",
    },
    answer: {
      fr: "Oui, un dépôt de garantie de 1 000€ à 2 500€ est pré-autorisé sur votre carte bancaire 48h avant l'arrivée. Il est intégralement restitué dans les 7 jours suivant votre départ, en l'absence de dommages.",
      en: "Yes, a security deposit of €1,000–€2,500 is pre-authorized on your credit card 48h before arrival. It is fully returned within 7 days after your departure, in the absence of damage.",
      pt: "Sim, um depósito de segurança de €1.000–€2.500 é pré-autorizado no seu cartão 48h antes da chegada. É devolvido integralmente em 7 dias após a saída, na ausência de danos.",
    },
  },
  {
    question: {
      fr: "Combien de personnes la villa peut-elle accueillir ?",
      en: "How many guests can the villa accommodate?",
      pt: "Quantas pessoas a villa comporta?",
    },
    answer: {
      fr: "La vila Caju accueille jusqu'à 17 personnes dans ses 6 chambres. Chaque chambre dispose de sa propre salle de bain. La villa est idéale pour les grandes familles, groupes d'amis et séminaires privés.",
      en: "Vila Caju accommodates up to 17 guests in its 6 bedrooms. Each room has its own bathroom. The villa is ideal for large families, groups of friends and private seminars.",
      pt: "Vila Caju acomoda até 17 pessoas em seus 6 quartos. Cada quarto tem seu próprio banheiro. A villa é ideal para famílias grandes, grupos de amigos e seminários privados.",
    },
  },
  {
    question: {
      fr: "Comment se rendre à la villa depuis l'aéroport ?",
      en: "How do I get to the villa from the airport?",
      pt: "Como chego à villa do aeroporto?",
    },
    answer: {
      fr: "L'aéroport de Maceió (MCZ) est à 25 km. Nous organisons des transferts privés sur demande. Comptez environ 30–40 minutes de trajet selon la circulation.",
      en: "Maceió Airport (MCZ) is 25 km away. We arrange private transfers on request. Journey time is approximately 30–40 minutes depending on traffic.",
      pt: "O aeroporto de Maceió (MCZ) fica a 25 km. Organizamos transfers privativos sob demanda. O tempo de viagem é de aproximadamente 30–40 minutos dependendo do tráfego.",
    },
  },
];

interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqAccordionItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-sand-200 rounded-soft overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-sand-50 transition-colors"
      >
        <span className="font-medium text-charcoal-800 text-sm">{question}</span>
        <ChevronDown className={cn("w-4 h-4 text-charcoal-500 shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 bg-sand-50/50 border-t border-sand-100">
          <p className="text-sm text-charcoal-700/75 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

interface FaqSectionProps {
  lang: Locale;
  dict: Dictionary["rates"];
}

export default function FaqSection({ lang, dict }: FaqSectionProps) {
  return (
    <div>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-800 mb-8 text-center">
        {dict.faqTitle}
      </h2>
      <div className="max-w-2xl mx-auto space-y-3">
        {faqItems.map((item, i) => (
          <FaqAccordionItem key={i} question={item.question[lang]} answer={item.answer[lang]} />
        ))}
      </div>
    </div>
  );
}
