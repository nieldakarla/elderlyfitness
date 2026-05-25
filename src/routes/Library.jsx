import { useMemo, useState } from 'react';
import { useStore } from '../state/store.jsx';
import { useT } from '../lib/useT.js';
import ExerciseCard from '../components/ExerciseCard.jsx';
import ExerciseForm from '../components/ExerciseForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { findExerciseUsage } from '../lib/schedule.js';
import { weekdayLabel } from '../lib/date.js';

export default function Library() {
  const { state, actions } = useStore();
  const { t, lang } = useT();
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const exercises = useMemo(() => {
    return Object.values(state.exercises)
      .filter((e) => (showArchived ? e.archived : !e.archived))
      .sort((a, b) => a.name.localeCompare(b.name, lang));
  }, [state.exercises, showArchived, lang]);

  function handleSave(input, createAnother) {
    actions.saveExercise(input);
    if (!createAnother) setEditing(null);
  }

  function askArchive(exercise) {
    const usage = findExerciseUsage(state, exercise.id);
    const parts = [];
    if (usage.weekdays.length > 0) {
      parts.push(t('library.archive_in_routine', {
        days: usage.weekdays.map((k) => weekdayLabel(k, lang)).join(', '),
      }));
    }
    if (usage.overrideDates.length > 0) {
      parts.push(t('library.archive_in_dates', { count: usage.overrideDates.length }));
    }
    parts.push(t('library.archive_explanation'));
    setConfirm({
      title: t('library.archive_title', { name: exercise.name }),
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
        <h1>{editing === 'new' ? t('library.new_title') : t('library.edit_title')}</h1>
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
        <h1>{t('library.title')}</h1>
        <button className="primary" onClick={() => setEditing('new')}>
          {t('library.new')}
        </button>
      </div>

      <div className="toggle-group" role="tablist" aria-label={t('library.filter_aria')}>
        <button
          role="tab"
          aria-selected={!showArchived}
          className={!showArchived ? 'active' : ''}
          onClick={() => setShowArchived(false)}
        >
          {t('library.tab_active')}
        </button>
        <button
          role="tab"
          aria-selected={showArchived}
          className={showArchived ? 'active' : ''}
          onClick={() => setShowArchived(true)}
        >
          {t('library.tab_archived')}
        </button>
      </div>

      {exercises.length === 0 ? (
        <div className="empty">
          {showArchived ? t('library.empty_archived') : t('library.empty_active')}
        </div>
      ) : (
        exercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            action={
              <>
                {ex.archived ? (
                  <button onClick={() => actions.restoreExercise(ex.id)}>
                    {t('library.restore')}
                  </button>
                ) : (
                  <>
                    <button onClick={() => setEditing(ex)}>{t('common.edit')}</button>
                    <button className="danger" onClick={() => askArchive(ex)}>
                      {t('library.archive')}
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
          confirmLabel={t('library.archive_confirm_label')}
          danger
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
