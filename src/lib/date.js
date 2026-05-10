const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const WEEKDAY_LABEL = {
  sun: 'Domingo',
  mon: 'Segunda',
  tue: 'Terça',
  wed: 'Quarta',
  thu: 'Quinta',
  fri: 'Sexta',
  sat: 'Sábado',
};
const WEEKDAY_SHORT = {
  sun: 'Dom',
  mon: 'Seg',
  tue: 'Ter',
  wed: 'Qua',
  thu: 'Qui',
  fri: 'Sex',
  sat: 'Sáb',
};
const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const pad = (n) => String(n).padStart(2, '0');

export function toYMD(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromYMD(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayYMD() {
  return toYMD(new Date());
}

export function weekdayKey(ymd) {
  return WEEKDAY_KEYS[fromYMD(ymd).getDay()];
}

export function weekdayLabel(key) {
  return WEEKDAY_LABEL[key];
}

export function weekdayShort(key) {
  return WEEKDAY_SHORT[key];
}

export function weekdayKeys() {
  return WEEKDAY_KEYS.slice();
}

export function monthLabel(year, month0) {
  return `${MONTH_NAMES[month0]} de ${year}`;
}

export function dayLabel(ymd) {
  const d = fromYMD(ymd);
  return `${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}`;
}

export function dayLabelLong(ymd) {
  const d = fromYMD(ymd);
  const wk = WEEKDAY_LABEL[WEEKDAY_KEYS[d.getDay()]];
  return `${wk}, ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}`;
}

export function addMonths(year, month0, delta) {
  const d = new Date(year, month0 + delta, 1);
  return { year: d.getFullYear(), month0: d.getMonth() };
}

// Returns 6 weeks (42 days) of YMDs covering the given month, padded with prev/next month.
// weekStartsOn: 0 = sunday, 1 = monday
export function buildMonthGrid(year, month0, weekStartsOn = 1) {
  const first = new Date(year, month0, 1);
  const dayOfWeek = first.getDay(); // 0=sun
  const offset = (dayOfWeek - weekStartsOn + 7) % 7;
  const start = new Date(year, month0, 1 - offset);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    days.push({
      ymd: toYMD(d),
      day: d.getDate(),
      inMonth: d.getMonth() === month0,
    });
  }
  return days;
}

export function weekHeader(weekStartsOn = 1) {
  const order = [];
  for (let i = 0; i < 7; i++) {
    order.push(WEEKDAY_KEYS[(weekStartsOn + i) % 7]);
  }
  return order.map((k) => ({ key: k, label: weekdayShort(k) }));
}
