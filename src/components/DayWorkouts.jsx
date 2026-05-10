import { useState } from 'react';
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
  const [picking, setPicking] = useState(null); // 'add' | 'replace' | null
  const [confirmReset, setConfirmReset] = useState(false);

  const items = exerciseIds
    .map((id) => state.exercises[id])
    .filter(Boolean);

  const activeExercises = Object.values(state.exercises).filter((e) => !e.archived);

  function setRest() {
    actions.setOverride(ymd, { mode: 'rest', exerciseIds: [] });
  }

  function addExtra(exerciseId) {
    const existing = override?.mode === 'add' ? override.exerciseIds || [] : [];
    if (existing.includes(exerciseId)) {
      setPicking(null);
      return;
    }
    actions.setOverride(ymd, { mode: 'add', exerciseIds: [...existing, exerciseId] });
    setPicking(null);
  }

  function replaceWith(exerciseId) {
    const existing = override?.mode === 'replace' ? override.exerciseIds || [] : [];
    if (existing.includes(exerciseId)) {
      setPicking(null);
      return;
    }
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
        items.map((ex) => {
          const done = !!completedMap[ex.id];
          const isOverrideEx = override?.exerciseIds?.includes(ex.id);
          return (
            <div key={ex.id} className="card stack-sm">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0 }}>{ex.name}</h2>
                {done && <span className="tag" style={{ background: 'var(--color-success)', color: 'var(--color-primary-text)' }}>Feito</span>}
              </div>
              {ex.durationMin && <div className="muted">{ex.durationMin} min</div>}
              {ex.notes && <div>{ex.notes}</div>}
              <YouTubeEmbed videoId={ex.videoId} title={ex.name} />
              <button
                className={done ? '' : 'primary'}
                onClick={() => actions.toggleCompletion(ymd, ex.id)}
                style={{ minHeight: 64, fontSize: '1.05rem' }}
              >
                {done ? 'Desmarcar' : 'Marcar como feito'}
              </button>
              {isOverrideEx && (mode === 'add' || mode === 'replace') && (
                <button onClick={() => removeOverrideExercise(ex.id)} className="ghost">
                  Remover deste dia
                </button>
              )}
            </div>
          );
        })
      )}

      <div className="card stack-sm">
        <h3 style={{ margin: 0 }}>Ajustes deste dia</h3>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button
            onClick={() => setPicking('add')}
            disabled={activeExercises.length === 0 || mode === 'rest'}
          >
            + Treino extra
          </button>
          <button
            onClick={() => setPicking('replace')}
            disabled={activeExercises.length === 0}
          >
            Trocar programa
          </button>
          {mode !== 'rest' && <button onClick={setRest}>Marcar descanso</button>}
        </div>
      </div>

      {picking && (
        <div
          className="dialog-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setPicking(null)}
        >
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
          onConfirm={() => {
            actions.clearOverride(ymd);
            setConfirmReset(false);
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}
