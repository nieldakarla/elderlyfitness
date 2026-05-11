import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { loadState, saveState, initialState } from '../lib/storage.js';
import { newId } from '../lib/ids.js';
import { extractVideoId } from '../lib/youtube.js';

const StoreContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'EXERCISE_UPSERT': {
      const { exercise } = action;
      return {
        ...state,
        exercises: { ...state.exercises, [exercise.id]: exercise },
      };
    }

    case 'EXERCISE_ARCHIVE': {
      const { id } = action;
      const ex = state.exercises[id];
      if (!ex) return state;
      const exercises = { ...state.exercises, [id]: { ...ex, archived: true } };
      const routine = Object.fromEntries(
        Object.entries(state.routine).map(([k, ids]) => [k, ids.filter((x) => x !== id)]),
      );
      const overrides = Object.fromEntries(
        Object.entries(state.overrides).map(([ymd, ov]) => [
          ymd,
          { ...ov, exerciseIds: (ov.exerciseIds || []).filter((x) => x !== id) },
        ]),
      );
      return { ...state, exercises, routine, overrides };
    }

    case 'EXERCISE_RESTORE': {
      const { id } = action;
      const ex = state.exercises[id];
      if (!ex) return state;
      return { ...state, exercises: { ...state.exercises, [id]: { ...ex, archived: false } } };
    }

    case 'ROUTINE_SET': {
      const { weekday, exerciseIds } = action;
      return { ...state, routine: { ...state.routine, [weekday]: exerciseIds } };
    }

    case 'OVERRIDE_SET': {
      const { ymd, override } = action;
      const overrides = { ...state.overrides };
      if (!override) {
        delete overrides[ymd];
      } else {
        overrides[ymd] = override;
      }
      return { ...state, overrides };
    }

    case 'COMPLETION_TOGGLE': {
      const { ymd, exerciseId } = action;
      const dayMap = { ...(state.completions[ymd] || {}) };
      if (dayMap[exerciseId]) {
        delete dayMap[exerciseId];
      } else {
        dayMap[exerciseId] = { at: new Date().toISOString() };
      }
      const completions = { ...state.completions };
      if (Object.keys(dayMap).length === 0) {
        delete completions[ymd];
      } else {
        completions[ymd] = dayMap;
      }
      return { ...state, completions };
    }

    case 'SETTINGS_UPDATE':
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case 'META_UPDATE':
      return { ...state, meta: { ...state.meta, ...action.patch } };

    case 'REPLACE_ALL':
      return action.state;

    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hydratedRef = useRef(false);
  const errorRef = useRef(null);

  useEffect(() => {
    const result = loadState();
    if (!result.ok) {
      errorRef.current = 'error.load';
    }
    dispatch({ type: 'HYDRATE', state: result.state });
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const result = saveState(state);
    if (!result.ok) {
      errorRef.current = 'error.save';
    }
  }, [state]);

  const actions = useMemo(
    () => ({
      saveExercise(input) {
        const videoId = extractVideoId(input.youtubeUrl);
        const exercise = {
          id: input.id || newId(),
          name: input.name.trim(),
          youtubeUrl: input.youtubeUrl.trim(),
          videoId,
          durationMin: Number(input.durationMin) || null,
          notes: (input.notes || '').trim(),
          archived: false,
        };
        dispatch({ type: 'EXERCISE_UPSERT', exercise });
        return exercise;
      },
      archiveExercise(id) {
        dispatch({ type: 'EXERCISE_ARCHIVE', id });
      },
      restoreExercise(id) {
        dispatch({ type: 'EXERCISE_RESTORE', id });
      },
      setRoutineDay(weekday, exerciseIds) {
        dispatch({ type: 'ROUTINE_SET', weekday, exerciseIds });
      },
      setOverride(ymd, override) {
        dispatch({ type: 'OVERRIDE_SET', ymd, override });
      },
      clearOverride(ymd) {
        dispatch({ type: 'OVERRIDE_SET', ymd, override: null });
      },
      toggleCompletion(ymd, exerciseId) {
        dispatch({ type: 'COMPLETION_TOGGLE', ymd, exerciseId });
      },
      updateSettings(patch) {
        dispatch({ type: 'SETTINGS_UPDATE', patch });
      },
      updateMeta(patch) {
        dispatch({ type: 'META_UPDATE', patch });
      },
      replaceAll(newState) {
        dispatch({ type: 'REPLACE_ALL', state: newState });
      },
    }),
    [],
  );

  const value = useMemo(
    () => ({ state, actions, error: errorRef.current }),
    [state, actions],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
