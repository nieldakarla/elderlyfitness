const KEY = 'ef:v1';

export const initialState = {
  version: 1,
  exercises: {},
  routine: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
  overrides: {},
  completions: {},
  settings: { theme: 'light', fontScale: 1, weekStartsOn: 1 },
  meta: { createdAt: new Date().toISOString(), lastBackupReminderAt: null },
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ok: true, state: initialState, fresh: true };
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

// Defensive merge with initialState in case stored data is missing keys.
function migrate(stored) {
  const merged = {
    ...initialState,
    ...stored,
    routine: { ...initialState.routine, ...(stored.routine || {}) },
    settings: { ...initialState.settings, ...(stored.settings || {}) },
    meta: { ...initialState.meta, ...(stored.meta || {}) },
    exercises: stored.exercises || {},
    overrides: stored.overrides || {},
    completions: stored.completions || {},
  };
  merged.version = 1;
  return merged;
}
