import { useMemo, useState } from 'react';
import { useStore } from '../state/store.jsx';
import ExerciseCard from '../components/ExerciseCard.jsx';
import ExerciseForm from '../components/ExerciseForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { findExerciseUsage } from '../lib/schedule.js';
import { weekdayLabel } from '../lib/date.js';

export default function Library() {
  const { state, actions } = useStore();
  const [editing, setEditing] = useState(null); // null | 'new' | exercise object
  const [confirm, setConfirm] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const exercises = useMemo(() => {
    return Object.values(state.exercises)
      .filter((e) => (showArchived ? e.archived : !e.archived))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [state.exercises, showArchived]);

  function handleSave(input) {
    actions.saveExercise(input);
    setEditing(null);
  }

  function askArchive(exercise) {
    const usage = findExerciseUsage(state, exercise.id);
    const parts = [];
    if (usage.weekdays.length > 0) {
      parts.push(`Está na rotina de ${usage.weekdays.map(weekdayLabel).join(', ')}.`);
    }
    if (usage.overrideDates.length > 0) {
      parts.push(`Está em ${usage.overrideDates.length} data(s) específica(s).`);
    }
    parts.push('Será removido dessas atribuições e arquivado (o histórico fica preservado).');
    setConfirm({
      title: `Arquivar "${exercise.name}"?`,
      message: parts.join(' '),
      onConfirm: () => {
        actions.archiveExercise(exercise.id);
        setConfirm(null);
      },
    });
  }

  if (editing) {
    return (
      <div className="stack">
        <h1>{editing === 'new' ? 'Novo treino' : 'Editar treino'}</h1>
        <ExerciseForm
          initial={editing === 'new' ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>Biblioteca</h1>
        <button className="primary" onClick={() => setEditing('new')}>
          + Novo
        </button>
      </div>

      <div className="toggle-group" role="tablist" aria-label="Filtro de treinos">
        <button
          role="tab"
          aria-selected={!showArchived}
          className={!showArchived ? 'active' : ''}
          onClick={() => setShowArchived(false)}
        >
          Ativos
        </button>
        <button
          role="tab"
          aria-selected={showArchived}
          className={showArchived ? 'active' : ''}
          onClick={() => setShowArchived(true)}
        >
          Arquivados
        </button>
      </div>

      {exercises.length === 0 ? (
        <div className="empty">
          {showArchived
            ? 'Nenhum treino arquivado.'
            : 'Nenhum treino ainda. Toque em "+ Novo" para começar.'}
        </div>
      ) : (
        exercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            action={
              <>
                {ex.archived ? (
                  <button onClick={() => actions.restoreExercise(ex.id)}>Restaurar</button>
                ) : (
                  <>
                    <button onClick={() => setEditing(ex)}>Editar</button>
                    <button className="danger" onClick={() => askArchive(ex)}>
                      Arquivar
                    </button>
                  </>
                )}
              </>
            }
          />
        ))
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel="Arquivar"
          danger
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
