import { useState } from 'react';
import { useStore } from '../state/store.jsx';
import { weekdayKeys, weekdayLabel } from '../lib/date.js';

export default function Routine() {
  const { state, actions } = useStore();
  const [pickerFor, setPickerFor] = useState(null); // weekday key or null

  const orderedDays = (() => {
    const start = state.settings.weekStartsOn || 0;
    const all = weekdayKeys();
    const ordered = [];
    for (let i = 0; i < 7; i++) ordered.push(all[(start + i) % 7]);
    return ordered;
  })();

  const activeExercises = Object.values(state.exercises).filter((e) => !e.archived);

  function exerciseName(id) {
    return state.exercises[id]?.name || '(treino removido)';
  }

  function removeFromDay(weekday, exerciseId) {
    const next = (state.routine[weekday] || []).filter((id) => id !== exerciseId);
    actions.setRoutineDay(weekday, next);
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
      <h1>Rotina semanal</h1>
      <p className="muted">
        Defina o que fazer em cada dia. Repete toda semana. Ajustes pontuais por data são feitos no
        Calendário.
      </p>

      {orderedDays.map((wk) => {
        const ids = state.routine[wk] || [];
        return (
          <div key={wk} className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>{weekdayLabel(wk)}</h2>
              <button
                onClick={() => setPickerFor(wk)}
                disabled={activeExercises.length === 0}
                aria-label={`Adicionar treino em ${weekdayLabel(wk)}`}
              >
                + Adicionar
              </button>
            </div>
            {ids.length === 0 ? (
              <div className="muted" style={{ marginTop: 8 }}>
                Descanso
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
                      onClick={() => removeFromDay(wk, id)}
                      aria-label={`Remover ${exerciseName(id)} de ${weekdayLabel(wk)}`}
                    >
                      Remover
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
          Cadastre treinos na <strong>Biblioteca</strong> primeiro para poder atribuí-los aqui.
        </div>
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
            <h2 id="pick-title">Adicionar em {weekdayLabel(pickerFor)}</h2>
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
                    {ex.name} {already && '(já adicionado)'}
                  </button>
                );
              })}
            </div>
            <div className="row-end" style={{ marginTop: 16 }}>
              <button onClick={() => setPickerFor(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
