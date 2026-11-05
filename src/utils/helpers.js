// Utilidades compartidas: períodos de cobro, estados de pago, fechas y portapapeles.

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Fecha local en formato YYYY-MM-DD (evita el corrimiento de día de toISOString en UTC-3).
export function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// "Noviembre 2026" para la fecha actual (o la fecha dada).
export function monthLabel(date = new Date()) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// Convierte "Octubre 2026" en un número ordenable. Devuelve -1 si no se reconoce.
export function periodKey(period = '') {
  const [name, year] = String(period).trim().split(/\s+/);
  const idx = MONTHS.findIndex(m => m.toLowerCase() === (name || '').toLowerCase());
  const y = Number(year);
  if (idx === -1 || !y) return -1;
  return y * 12 + idx;
}

// Período más reciente que tiene cuotas cargadas (para que el tablero nunca quede vacío).
export function latestPeriod(payments = []) {
  let best = null;
  let bestKey = -1;
  payments.forEach(p => {
    const k = periodKey(p.monthPeriod);
    if (k > bestKey) { bestKey = k; best = p.monthPeriod; }
  });
  return best || monthLabel();
}

// Lista de períodos únicos, del más nuevo al más viejo.
export function periodsList(payments = []) {
  const unique = [...new Set(payments.map(p => p.monthPeriod))];
  return unique.sort((a, b) => periodKey(b) - periodKey(a));
}

// Una cuota pendiente cuya fecha de vencimiento ya pasó se considera vencida.
export function effectiveStatus(payment, today = todayISO()) {
  if (payment.status === 'pending' && payment.dueDate && payment.dueDate < today) return 'overdue';
  return payment.status;
}

// 2026-10-04 -> 04/10/2026
export function formatDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso || '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

// Suma meses a una fecha ISO.
export function addMonthsISO(iso, months = 1) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1 + months, d);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

// Copiar al portapapeles con respaldo para navegadores/contextos sin Clipboard API.
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* sigue con el respaldo */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
}

// Extrae el ID de un link de YouTube (watch, shorts, youtu.be, embed). null si no es YouTube.
export function getYouTubeId(url = '') {
  const m = String(url).match(/(?:youtube\.com\/(?:shorts\/|embed\/|watch\?(?:.*&)?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
