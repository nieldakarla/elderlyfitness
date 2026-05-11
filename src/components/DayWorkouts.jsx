import { useState, useEffect } from 'react';
import { useStore } from '../state/store.jsx';
import { useT } from '../lib/useT.js';
import { resolveDay } from '../lib/schedule.js';
import YouTubeEmbed from './YouTubeEmbed.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

export default function DayWorkouts({ ymd }) {
  const { state, actions } = useStore();
  const { t } = useT();
  const { exerciseIds, mode, override } = resolveDay(state, ymd);
  const completedMap = state.completions[ymd] || {};
  const [picking, setPicking] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const items = exerciseIds.map((id) => state.exercises[id]).filter(Boolean);

  const firstPending = items.find((ex) => !completedMap[ex.id]);
  const [expandedId, setExpandedId] = useState(firstPending?.id ?? null);

  useEffect(() => {
    const currentDone = expandedId && completedMap[expandedId];
    if (currentDone) {
      const next = items.find((ex) => !completedMap[ex.id] && ex.id !== expandedId);
      setExpandedId(next?.id ?? null);
    }
  }, [completedMap]);

  const activeExercises = Object.values(state.exercises).filter((e) => !e.archived);
  const allDone = items.length > 0 && items.every((ex) => completedMap[ex.id]);

  const modeLabel = {
    replace: t('day.mode_replace'),
    add: t('day.mode_add'),
    rest: t('day.mode_rest'),
  };

  function setRest() {
    actions.setOverride(ymd, { mode: 'rest', exerciseIds: [] });
  }

  function addExtra(exerciseId) {
    const existing = override?.mode === 'add' ? override.exerciseIds || [] : [];
    if (existing.includes(exerciseId)) { setPicking(null); return; }
    actions.setOverride(ymd, { mode: 'add', exerciseIds: [...existing, exerciseId] });
    setPicking(null);
  }

  function replaceWith(exerciseId) {
    const existing = override?.mode === 'replace' ? override.exerciseIds || [] : [];
    if (existing.includes(exerciseId)) { setPicking(null); return; }
    actions.setOverride(ymd, { mode: 'replace', exerciseIds: [...existing, exerciseId] });
    setPicking(null);
  }

  function removeOverrideExercise(exerciseId) {
    if (!override) return;
    const next = (override.exerciseIds || []).filter((id) => id !== exerciseId);
    if (next.length === 0 && override.mode !== 'replace') {
      actions.clearOverride(ymd);
    } else {
      actions.setOverride(ymd, { ...override, exerciseIds: next });
    }
  }

  function handleToggle(exerciseId) {
    actions.toggleCompletion(ymd, exerciseId);
    if (completedMap[exerciseId]) {
      setExpandedId(exerciseId);
    }
  }

  return (
    <div className="stack">
      {mode !== 'normal' && (
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className={`tag ${mode}`}>{modeLabel[mode]}</span>
          <button onClick={() => setConfirmReset(true)} className="ghost">
            {t('day.back_to_routine')}
          </button>
        </div>
      )}

      {mode === 'rest' ? (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{t('day.rest_title')}</h2>
          <p className="muted">{t('day.rest_message')}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{t('day.no_workout_title')}</h2>
          <p className="muted">{t('day.no_workout_message')}</p>
        </div>
      ) : (
        <>
          {allDone && (
            <div className="card" style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>🎉</div>
              <h2 style={{ margin: '4px 0 0' }}>{t('day.all_done_title')}</h2>
              <p style={{ margin: '4px 0 0', opacity: 0.85 }}>{t('day.all_done_message')}</p>
            </div>
          )}

          {items.map((ex, idx) => {
            const done = !!completedMap[ex.id];
            const isExpanded = expandedId === ex.id;
            const isOverrideEx = override?.exerciseIds?.includes(ex.id);

            if (done && !isExpanded) {
              return (
                <div
                  key={ex.id}
                  className="card"
                  style={{ padding: '12px 16px' }}
                >
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <div className="row" style={{ gap: 10 }}>
                      <span style={{ fontSize: '1.3rem', color: 'var(--color-success)' }}>✓</span>
                      <span style={{ fontWeight: 600 }}>{ex.name}</span>
                    </div>
                    <button
                      className="ghost"
                      onClick={() => setExpandedId(ex.id)}
                      style={{ fontSize: '0.9rem', minHeight: 44, padding: '0 12px', border: '1px solid var(--color-border)' }}
                    >
                      {t('day.see_again')}
                    </button>
                  </div>
                </div>
              );
            }

            if (!done && !isExpanded && items.length > 1) {
              return (
                <div
                  key={ex.id}
                  className="card"
                  style={{ padding: '12px 16px', opacity: 0.6 }}
                >
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <div className="row" style={{ gap: 10 }}>
                      <span style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>○</span>
                      <span style={{ fontWeight: 600 }}>{ex.name}</span>
                      {ex.durationMin && (
                        <span className="muted" style={{ fontSize: '0.85rem' }}>
                          {t('day.minutes', { n: ex.durationMin })}
                        </span>
                      )}
                    </div>
                    <button
                      className="ghost"
                      onClick={() => setExpandedId(ex.id)}
                      style={{ fontSize: '0.9rem', minHeight: 44, padding: '0 12px', border: '1px solid var(--color-border)' }}
                    >
                      {t('day.open')}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={ex.id} className="card stack-sm">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h2 style={{ margin: 0 }}>{ex.name}</h2>
                  {items.length > 1 && (
                    <span className="muted" style={{ fontSize: '0.85rem' }}>
                      {t('day.x_of_y', { idx: idx + 1, total: items.length })}
                    </span>
                  )}
                </div>
                {ex.durationMin && <div className="muted">{t('day.minutes', { n: ex.durationMin })}</div>}
                {ex.notes && <div>{ex.notes}</div>}
                <YouTubeEmbed videoId={ex.videoId} title={ex.name} />
                <button
                  className={done ? '' : 'primary'}
                  onClick={() => handleToggle(ex.id)}
                  style={{ minHeight: 64, fontSize: '1.05rem' }}
                >
                  {done ? t('day.unmark') : t('day.mark_done')}
                </button>
                {isOverrideEx && (mode === 'add' || mode === 'replace') && (
                  <button onClick={() => removeOverrideExercise(ex.id)} className="ghost">
                    {t('day.remove_from_day')}
                  </button>
                )}
              </div>
            );
          })}
        </>
      )}

      <div className="card stack-sm">
        <h3 style={{ margin: 0 }}>{t('day.adjustments')}</h3>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button onClick={() => setPicking('add')} disabled={activeExercises.length === 0 || mode === 'rest'}>
            {t('day.add_extra')}
          </button>
          <button onClick={() => setPicking('replace')} disabled={activeExercises.length === 0}>
            {t('day.replace_program')}
          </button>
          {mode !== 'rest' && <button onClick={setRest}>{t('day.set_rest')}</button>}
        </div>
      </div>

      {picking && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true" onClick={() => setPicking(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>
              {picking === 'add' ? t('day.add_extra_title') : t('day.replace_title')}
            </h2>
            {picking === 'replace' && (
              <p className="muted">{t('day.replace_subtitle')}</p>
            )}
            <div className="stack-sm" style={{ marginTop: 12 }}>
              {activeExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => (picking === 'add' ? addExtra(ex.id) : replaceWith(ex.id))}
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  {ex.name}
                </button>
              ))}
            </div>
            <div className="row-end" style={{ marginTop: 16 }}>
              <button onClick={() => setPicking(null)}>{t('common.close')}</button>
            </div>
          </div>
        </div>
      )}

      {confirmReset && (
        <ConfirmDialog
          title={t('day.confirm_reset_title')}
          message={t('day.confirm_reset_message')}
          confirmLabel={t('day.confirm_reset_label')}
          danger
          onConfirm={() => { actions.clearOverride(ymd); setConfirmReset(false); }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}
