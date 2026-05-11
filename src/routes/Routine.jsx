import { useState } from 'react';
import { useStore } from '../state/store.jsx';
import { useT } from '../lib/useT.js';
import { weekdayKeys, weekdayLabel } from '../lib/date.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Routine() {
  const { state, actions } = useStore();
  const { t, lang } = useT();
  const [pickerFor, setPickerFor] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null); // { weekday, exerciseId, name, weekdayLabel }

  const orderedDays = (() => {
    const start = state.settings.weekStartsOn || 0;
    const all = weekdayKeys();
    const ordered = [];
    for (let i = 0; i < 7; i++) ordered.push(all[(start + i) % 7]);
    return ordered;
  })();

  const activeExercises = Object.values(state.exercises).filter((e) => !e.archived);

  function exerciseName(id) {
    return state.exercises[id]?.name || t('library.removed_placeholder');
  }

  function removeFromDay(weekday, exerciseId) {
    const next = (state.routine[weekday] || []).filter((id) => id !== exerciseId);
    actions.setRoutineDay(weekday, next);
    setConfirmRemove(null);
  }

  function addToDay(weekday, exerciseId) {
    const current = state.routine[weekday] || [];
    if (current.includes(exerciseId)) {
      setPickerFor(null);
      return;
    }
    actions.setRoutineDay(weekday, [...current, exerciseId]);
    setPickerFor(null);
  }

  return (
    <div className="stack">
      <h1>{t('routine.title')}</h1>
      <p className="muted">{t('routine.description')}</p>

      {orderedDays.map((wk) => {
        const ids = state.routine[wk] || [];
        const wkLabel = weekdayLabel(wk, lang);
        return (
          <div key={wk} className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>{wkLabel}</h2>
              <button
                className="primary"
                onClick={() => setPickerFor(wk)}
                disabled={activeExercises.length === 0}
                aria-label={t('routine.add_aria', { weekday: wkLabel })}
              >
                {t('routine.add')}
              </button>
            </div>
            {ids.length === 0 ? (
              <div className="muted" style={{ marginTop: 8 }}>
                {t('routine.rest')}
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
                {ids.map((id) => (
                  <li
                    key={id}
                    className="row"
                    style={{ justifyContent: 'space-between', padding: '8px 0' }}
                  >
                    <span>{exerciseName(id)}</span>
                    <button
                      className="danger"
                      onClick={() => setConfirmRemove({ weekday: wk, exerciseId: id, name: exerciseName(id), wkLabel })}
                      aria-label={t('routine.remove_aria', { name: exerciseName(id), weekday: wkLabel })}
                    >
                      {t('routine.remove')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {activeExercises.length === 0 && (
        <div className="banner">
          <span dangerouslySetInnerHTML={{ __html: t('routine.no_exercises') }} />
        </div>
      )}

      {confirmRemove && (
        <ConfirmDialog
          title={t('routine.confirm_remove_title', { name: confirmRemove.name })}
          message={t('routine.confirm_remove_message', { weekday: confirmRemove.wkLabel })}
          confirmLabel={t('routine.remove')}
          danger
          onConfirm={() => removeFromDay(confirmRemove.weekday, confirmRemove.exerciseId)}
          onCancel={() => setConfirmRemove(null)}
        />
      )}

      {pickerFor && (
        <div
          className="dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pick-title"
          onClick={() => setPickerFor(null)}
        >
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 id="pick-title">
              {t('routine.picker_title', { weekday: weekdayLabel(pickerFor, lang) })}
            </h2>
            <div className="stack-sm" style={{ marginTop: 12 }}>
              {activeExercises.map((ex) => {
                const already = (state.routine[pickerFor] || []).includes(ex.id);
                return (
                  <button
                    key={ex.id}
                    onClick={() => addToDay(pickerFor, ex.id)}
                    disabled={already}
                    style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  >
                    {ex.name} {already && t('routine.already_added')}
                  </button>
                );
              })}
            </div>
            <div className="row-end" style={{ marginTop: 16 }}>
              <button onClick={() => setPickerFor(null)}>{t('common.close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
