import { useState, useEffect } from 'react';
import { useStore } from '../state/store.jsx';
import { resolveDay } from '../lib/schedule.js';
import YouTubeEmbed from './YouTubeEmbed.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

const MODE_LABEL = {
  replace: 'Programa especial',
  add: 'Treino extra',
  rest: 'Descanso',
};

export default function DayWorkouts({ ymd }) {
  const { state, actions } = useStore();
  const { exerciseIds, mode, override } = resolveDay(state, ymd);
  const completedMap = state.completions[ymd] || {};
  const [picking, setPicking] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const items = exerciseIds.map((id) => state.exercises[id]).filter(Boolean);

  // The expanded card: defaults to the first non-completed exercise.
  const firstPending = items.find((ex) => !completedMap[ex.id]);
  const [expandedId, setExpandedId] = useState(firstPending?.id ?? null);

  // When completions change (e.g. user marks done), advance to next pending.
  useEffect(() => {
    const currentDone = expandedId && completedMap[expandedId];
    if (currentDone) {
      const next = items.find((ex) => !completedMap[ex.id] && ex.id !== expandedId);
      setExpandedId(next?.id ?? null);
    }
  }, [completedMap]);

  const activeExercises = Object.values(state.exercises).filter((e) => !e.archived);
  const allDone = items.length > 0 && items.every((ex) => completedMap[ex.id]);

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
    // If unmarking, re-expand that card so the user can interact with it again.
    if (completedMap[exerciseId]) {
      setExpandedId(exerciseId);
    }
  }

  return (
    <div className="stack">
      {mode !== 'normal' && (
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className={`tag ${mode}`}>{MODE_LABEL[mode]}</span>
          <button onClick={() => setConfirmReset(true)} className="ghost">
            Voltar à rotina
          </button>
        </div>
      )}

      {mode === 'rest' ? (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Dia de descanso</h2>
          <p className="muted">Aproveite para descansar.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Sem treino agendado</h2>
          <p className="muted">A rotina deste dia está vazia.</p>
        </div>
      ) : (
        <>
          {allDone && (
            <div className="card" style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>🎉</div>
              <h2 style={{ margin: '4px 0 0' }}>Treinos concluídos!</h2>
              <p style={{ margin: '4px 0 0', opacity: 0.85 }}>Parabéns pelo esforço de hoje.</p>
            </div>
          )}

          {items.map((ex, idx) => {
            const done = !!completedMap[ex.id];
            const isExpanded = expandedId === ex.id;
            const isOverrideEx = override?.exerciseIds?.includes(ex.id);

            // Collapsed (done) card — compact row
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
                      Ver de novo
                    </button>
                  </div>
                </div>
              );
            }

            // Collapsed (pending, not the active one) card — shows name, tap to expand
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
                      {ex.durationMin && <span className="muted" style={{ fontSize: '0.85rem' }}>{ex.durationMin} min</span>}
                    </div>
                    <button
                      className="ghost"
                      onClick={() => setExpandedId(ex.id)}
                      style={{ fontSize: '0.9rem', minHeight: 44, padding: '0 12px', border: '1px solid var(--color-border)' }}
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              );
            }

            // Expanded card (active or only one exercise)
            return (
              <div key={ex.id} className="card stack-sm">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h2 style={{ margin: 0 }}>{ex.name}</h2>
                  {items.length > 1 && (
                    <span className="muted" style={{ fontSize: '0.85rem' }}>
                      {idx + 1} de {items.length}
                    </span>
                  )}
                </div>
                {ex.durationMin && <div className="muted">{ex.durationMin} min</div>}
                {ex.notes && <div>{ex.notes}</div>}
                <YouTubeEmbed videoId={ex.videoId} title={ex.name} />
                <button
                  className={done ? '' : 'primary'}
                  onClick={() => handleToggle(ex.id)}
                  style={{ minHeight: 64, fontSize: '1.05rem' }}
                >
                  {done ? 'Desmarcar' : '✓ Marcar como feito'}
                </button>
                {isOverrideEx && (mode === 'add' || mode === 'replace') && (
                  <button onClick={() => removeOverrideExercise(ex.id)} className="ghost">
                    Remover deste dia
                  </button>
                )}
              </div>
            );
          })}
        </>
      )}

      <div className="card stack-sm">
        <h3 style={{ margin: 0 }}>Ajustes deste dia</h3>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button onClick={() => setPicking('add')} disabled={activeExercises.length === 0 || mode === 'rest'}>
            + Treino extra
          </button>
          <button onClick={() => setPicking('replace')} disabled={activeExercises.length === 0}>
            Trocar programa
          </button>
          {mode !== 'rest' && <button onClick={setRest}>Marcar descanso</button>}
        </div>
      </div>

      {picking && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true" onClick={() => setPicking(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>
              {picking === 'add' ? 'Adicionar treino extra' : 'Trocar para'}
            </h2>
            {picking === 'replace' && (
              <p className="muted">Seleciona os treinos que substituem a rotina deste dia.</p>
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
              <button onClick={() => setPicking(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {confirmReset && (
        <ConfirmDialog
          title="Voltar à rotina semanal?"
          message="Os ajustes deste dia serão removidos. Os treinos marcados como feitos continuam preservados."
          confirmLabel="Voltar à rotina"
          danger
          onConfirm={() => { actions.clearOverride(ymd); setConfirmReset(false); }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}
