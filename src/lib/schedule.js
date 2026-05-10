import { weekdayKey } from './date.js';

// Returns { exerciseIds: [...], mode: 'normal'|'replace'|'add'|'rest', override }
// 'normal' means rotina semanal, sem override.
export function resolveDay(state, ymd) {
  const wk = weekdayKey(ymd);
  const baseIds = state.routine[wk] || [];
  const override = state.overrides[ymd];

  if (!override) {
    return { exerciseIds: baseIds, mode: 'normal', override: null };
  }

  if (override.mode === 'rest') {
    return { exerciseIds: [], mode: 'rest', override };
  }

  if (override.mode === 'replace') {
    return { exerciseIds: override.exerciseIds || [], mode: 'replace', override };
  }

  if (override.mode === 'add') {
    const merged = [...baseIds, ...(override.exerciseIds || [])];
    return { exerciseIds: merged, mode: 'add', override };
  }

  return { exerciseIds: baseIds, mode: 'normal', override: null };
}

export function dayStatus(state, ymd) {
  const { exerciseIds, mode } = resolveDay(state, ymd);
  const completedMap = state.completions[ymd] || {};
  const total = exerciseIds.length;
  const done = exerciseIds.filter((id) => completedMap[id]).length;
  return {
    total,
    done,
    mode,
    isRest: mode === 'rest',
    hasWorkout: total > 0,
    allDone: total > 0 && done === total,
  };
}

// Look up which weekdays an exercise appears on (rotina) and on which dates (overrides).
export function findExerciseUsage(state, exerciseId) {
  const weekdays = [];
  for (const [k, ids] of Object.entries(state.routine)) {
    if (ids.includes(exerciseId)) weekdays.push(k);
  }
  const overrideDates = [];
  for (const [ymd, ov] of Object.entries(state.overrides)) {
    if ((ov.exerciseIds || []).includes(exerciseId)) overrideDates.push(ymd);
  }
  return { weekdays, overrideDates };
}
