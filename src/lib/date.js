import { t, DEFAULT_LANGUAGE } from './i18n.js';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

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

export function weekdayLabel(key, lang = DEFAULT_LANGUAGE) {
  return t(`weekday.long.${key}`, lang);
}

export function weekdayShort(key, lang = DEFAULT_LANGUAGE) {
  return t(`weekday.short.${key}`, lang);
}

export function weekdayKeys() {
  return WEEKDAY_KEYS.slice();
}

export function monthLabel(year, month0, lang = DEFAULT_LANGUAGE) {
  return t('date.month_label', lang, {
    month: t(`month.${month0}`, lang),
    year,
  });
}

export function dayLabel(ymd, lang = DEFAULT_LANGUAGE) {
  const d = fromYMD(ymd);
  return t('date.day_label', lang, {
    day: d.getDate(),
    month: t(`month.${d.getMonth()}`, lang),
  });
}

export function dayLabelLong(ymd, lang = DEFAULT_LANGUAGE) {
  const d = fromYMD(ymd);
  return t('date.day_label_long', lang, {
    weekday: t(`weekday.long.${WEEKDAY_KEYS[d.getDay()]}`, lang),
    day: d.getDate(),
    month: t(`month.${d.getMonth()}`, lang),
  });
}

export function addMonths(year, month0, delta) {
  const d = new Date(year, month0 + delta, 1);
  return { year: d.getFullYear(), month0: d.getMonth() };
}

// Returns 6 weeks (42 days) of YMDs covering the given month, padded with prev/next month.
// weekStartsOn: 0 = sunday, 1 = monday
export function buildMonthGrid(year, month0, weekStartsOn = 1) {
  const first = new Date(year, month0, 1);
  const dayOfWeek = first.getDay();
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

export function weekHeader(weekStartsOn = 1, lang = DEFAULT_LANGUAGE) {
  const order = [];
  for (let i = 0; i < 7; i++) {
    order.push(WEEKDAY_KEYS[(weekStartsOn + i) % 7]);
  }
  return order.map((k) => ({ key: k, label: weekdayShort(k, lang) }));
}
