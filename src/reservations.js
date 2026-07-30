export const reservationWeekDays = [
  ['sunday', 'Domingo'],
  ['monday', 'Segunda'],
  ['tuesday', 'Terça'],
  ['wednesday', 'Quarta'],
  ['thursday', 'Quinta'],
  ['friday', 'Sexta'],
  ['saturday', 'Sábado']
];

const defaultWeekly = {
  sunday: { enabled: true, start: '11:30', end: '15:30' },
  monday: { enabled: false, start: '18:00', end: '22:00' },
  tuesday: { enabled: true, start: '18:00', end: '22:00' },
  wednesday: { enabled: true, start: '18:00', end: '22:00' },
  thursday: { enabled: true, start: '18:00', end: '22:00' },
  friday: { enabled: true, start: '18:00', end: '23:00' },
  saturday: { enabled: true, start: '11:30', end: '23:00' }
};

export function reservationSettingsFor(restaurant = {}) {
  const value = restaurant.reservationSettings || {};
  return {
    enabled: value.enabled !== false,
    autoConfirm: value.autoConfirm !== false,
    slotMinutes: [30, 60, 90].includes(Number(value.slotMinutes)) ? Number(value.slotMinutes) : 60,
    capacityPerSlot: Math.max(1, Number(value.capacityPerSlot || 20)),
    maxPartySize: Math.max(1, Number(value.maxPartySize || 12)),
    advanceDays: Math.max(1, Math.min(90, Number(value.advanceDays || 30))),
    weekly: reservationWeekDays.reduce((weekly, [key]) => ({
      ...weekly,
      [key]: { ...defaultWeekly[key], ...(value.weekly?.[key] || {}) }
    }), {})
  };
}

export function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function nextReservationDates(advanceDays = 30, take = 7) {
  const dates = [];
  const limit = Math.min(Math.max(1, Number(advanceDays || 30)), Math.max(1, take));
  const now = new Date();
  for (let index = 0; index < limit; index += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + index);
    dates.push({
      key: localDateKey(date),
      weekday: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', ''),
      day: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date),
      fullLabel: new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(date)
    });
  }
  return dates;
}

function minutesFor(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function timeFor(minutes) {
  return `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function reservationSlotsForDate(restaurant, dateKey, reservations = []) {
  const settings = reservationSettingsFor(restaurant);
  if (!settings.enabled || !dateKey) return [];
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekdayKey = reservationWeekDays[date.getDay()]?.[0];
  const schedule = settings.weekly[weekdayKey];
  if (!schedule?.enabled) return [];
  const start = minutesFor(schedule.start);
  const end = minutesFor(schedule.end);
  if (start === null || end === null || end <= start) return [];
  const now = new Date();
  const slots = [];
  for (let minutes = start; minutes < end; minutes += settings.slotMinutes) {
    const time = timeFor(minutes);
    const slotDate = new Date(year, month - 1, day, Math.floor(minutes / 60), minutes % 60);
    if (slotDate.getTime() <= now.getTime() + 30 * 60 * 1000) continue;
    const occupied = reservations
      .filter((reservation) => (
        String(reservation.restaurantId) === String(restaurant.id)
        && reservation.date === dateKey
        && reservation.time === time
        && !['cancelled', 'no_show'].includes(reservation.status)
      ))
      .reduce((total, reservation) => total + Number(reservation.partySize || 0), 0);
    slots.push({
      time,
      occupied,
      remaining: Math.max(0, settings.capacityPerSlot - occupied),
      available: occupied < settings.capacityPerSlot
    });
  }
  return slots;
}

export function reservationStatusLabel(status) {
  return {
    pending: 'Aguardando confirmação',
    confirmed: 'Confirmada',
    seated: 'Cliente na mesa',
    completed: 'Concluída',
    cancelled: 'Cancelada',
    no_show: 'Não compareceu'
  }[status] || status;
}

export function reservationStatusColor(status) {
  return {
    pending: '#D97706',
    confirmed: '#267A78',
    seated: '#2E8B57',
    completed: '#218A4B',
    cancelled: '#8A8179',
    no_show: '#B83250'
  }[status] || '#6F6A66';
}

export function waitlistStatusLabel(status) {
  return {
    waiting: 'Na espera',
    notified: 'Cliente avisado',
    converted: 'Reserva criada',
    cancelled: 'Cancelada'
  }[status] || status;
}
