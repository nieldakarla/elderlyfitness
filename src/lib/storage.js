import { detectLanguage, DEFAULT_LANGUAGE } from './i18n.js';

const KEY = 'ef:v1';

export const initialState = {
  version: 1,
  exercises: {},
  routine: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
  programs: [],
  overrides: {},
  completions: {},
  settings: { theme: 'light', fontScale: 1, weekStartsOn: 1, language: DEFAULT_LANGUAGE },
  meta: { createdAt: new Date().toISOString(), lastBackupReminderAt: null },
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const fresh = {
        ...initialState,
        settings: { ...initialState.settings, language: detectLanguage() },
      };
      return { ok: true, state: fresh, fresh: true };
    }
    const parsed = JSON.parse(raw);
    return { ok: true, state: migrate(parsed), fresh: false };
  } catch (err) {
    return { ok: false, error: err, state: initialState, fresh: true };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

function migrateProgram(p) {
  if (p.periodMode != null) {
    return { ...p, active: p.active ?? false };
  }
  let periodMode;
  if (p.durationWeeks != null) {
    periodMode = 'weeks';
  } else if (p.endDate) {
    periodMode = 'dates';
  } else {
    periodMode = 'ongoing';
  }
  return { ...p, periodMode, active: p.active ?? false };
}

// Defensive merge with initialState in case stored data is missing keys.
function migrate(stored) {
  const merged = {
    ...initialState,
    ...stored,
    routine: { ...initialState.routine, ...(stored.routine || {}) },
    programs: (stored.programs || []).map(migrateProgram),
    settings: { ...initialState.settings, ...(stored.settings || {}) },
    meta: { ...initialState.meta, ...(stored.meta || {}) },
    exercises: stored.exercises || {},
    overrides: stored.overrides || {},
    completions: stored.completions || {},
  };
  // Remove legacy activeProgram if present
  delete merged.activeProgram;
  merged.version = 1;
  return merged;
}
