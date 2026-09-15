// Helper serveur — notification WhatsApp au propriétaire après réservation
// Ne jamais appeler depuis un composant client

import type { Reservation } from './supabase/types'

/**
 * Construit l'URL WhatsApp API pour notifier le propriétaire d'une nouvelle réservation.
 * Retourne l'URL prête à être ouverte par le client (redirect ou window.open).
 * `number` provient des paramètres admin (table `settings`), éditables sans redéploiement.
 */
export function notifyOwnerWhatsApp(reservation: Reservation, number: string): string {
  const nights = computeNights(reservation.check_in, reservation.check_out)

  const message = [
    `*Nouvelle demande de réservation — Vila Caju*`,
    ``,
    `Arrivée : ${reservation.check_in}`,
    `Départ  : ${reservation.check_out}`,
    `Durée   : ${nights} nuit${nights > 1 ? 's' : ''}`,
    `Personnes : ${reservation.guests_count}`,
    ``,
    `Nom   : ${reservation.guest_name}`,
    `Email : ${reservation.guest_email}`,
    `Tél   : ${reservation.guest_phone ?? '—'}`,
    reservation.message ? `Message : ${reservation.message}` : '',
    ``,
    `Total : ${formatBRL(reservation.total_price)}`,
    ``,
    `ID réservation : ${reservation.id}`,
  ]
    .filter((line) => line !== '')
    .join('\n')

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

function computeNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function formatBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(amount)
}
