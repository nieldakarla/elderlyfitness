import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../state/store.jsx';
import { useT } from '../lib/useT.js';
import { weekdayShort, weekdayLabel, todayYMD } from '../lib/date.js';
import { newId } from '../lib/ids.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const ORDERED_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function weeksSince(startDate) {
  const start = new Date(startDate + 'T00:00:00');
  const now = new Date();
  const diffMs = now - start;
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}

function addWeeks(ymd, weeks) {
  const d = new Date(ymd + 'T00:00:00');
  d.setDate(d.getDate() + weeks * 7);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function programStatus(program, today) {
  if (program.periodMode === 'ongoing') return program.active ? 'active' : 'ongoing_inactive';
  if (!program.startDate) return 'draft';
  if (today < program.startDate) return 'scheduled';
  if (program.endDate && today > program.endDate) return 'completed';
  return 'active';
}

function deriveActiveDays(schedule) {
  if (!schedule) return [];
  return ORDERED_DAYS.filter((d) => (schedule[d] || []).length > 0);
}

export default function Routine() {
  const { state, actions } = useStore();
  const { t, lang } = useT();
  const [view, setView] = useState('list'); // 'list' | 'editor'
  const [editingId, setEditingId] = useState(null); // null = new program
  const [confirmRemove, setConfirmRemove] = useState(null); // program object
  const [tab, setTab] = useState('active');

  const programs = state.programs || [];
  const today = todayYMD();
  const activeExercises = Object.values(state.exercises).filter((e) => !e.archived);

  const activePrograms = programs.filter((p) => programStatus(p, today) === 'active');
  const scheduledPrograms = programs.filter((p) => programStatus(p, today) === 'scheduled');
  const completedPrograms = programs.filter(
    (p) => programStatus(p, today) === 'completed' || programStatus(p, today) === 'ongoing_inactive',
  );

  function openNew() {
    setEditingId(null);
    setView('editor');
  }

  function openEdit(id) {
    setEditingId(id);
    setView('editor');
  }

  function handleSaved() {
    setView('list');
    setEditingId(null);
  }

  function handleCancel() {
    setView('list');
    setEditingId(null);
  }

  function handleRemove(program) {
    actions.removeProgram(program.id);
    setConfirmRemove(null);
  }

  if (view === 'editor') {
    const existing = editingId ? programs.find((p) => p.id === editingId) : null;
    return (
      <ProgramEditor
        program={existing}
        exercises={activeExercises}
        lang={lang}
        t={t}
        onSave={(data) => {
          if (existing) {
            actions.updateProgram(existing.id, data);
          } else {
            const prog = { ...data, id: newId() };
            actions.addProgram(prog);
          }
          handleSaved();
        }}
        onCancel={handleCancel}
      />
    );
  }

  const tabList = [
    { key: 'active', label: t('program.tab_active'), programs: activePrograms },
    { key: 'scheduled', label: t('program.tab_scheduled'), programs: scheduledPrograms },
    { key: 'completed', label: t('program.tab_completed'), programs: completedPrograms },
  ];
  const currentTabPrograms = tabList.find((tb) => tb.key === tab)?.programs || [];

  function ProgramCard({ prog }) {
    const status = programStatus(prog, today);
    const isOngoing = prog.periodMode === 'ongoing';
    return (
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0 }}>{prog.name}</h3>
            <div className="muted" style={{ marginTop: 4, fontSize: '0.9em' }}>
              <ProgramMeta program={prog} t={t} lang={lang} today={today} />
            </div>
          </div>
          <div className="stack-sm" style={{ alignItems: 'flex-end' }}>
            {isOngoing && (
              <button
                onClick={() => actions.toggleProgramActive(prog.id)}
                className={prog.active ? undefined : 'primary'}
              >
                {prog.active ? t('program.deactivate') : t('program.activate')}
              </button>
            )}
            <button onClick={() => openEdit(prog.id)}>{t('program.edit')}</button>
            <button className="danger" onClick={() => setConfirmRemove(prog)}>
              {t('program.remove')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>{t('program.title')}</h1>
        <button className="primary" onClick={openNew}>
          {t('program.new')}
        </button>
      </div>

      {programs.length === 0 ? (
        <div className="banner">
          {activeExercises.length === 0
            ? <>{t('program.no_programs_pre')} <Link to="/biblioteca">{t('program.no_programs_link')}</Link> {t('program.no_programs_post')}</>
            : t('program.no_programs_simple')
          }
        </div>
      ) : (
        <>
          {/* Tab toggle group */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tabList.map(({ key, label, programs: tProgs }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  style={{
                    padding: '8px 16px',
                    fontWeight: 700,
                    fontSize: '0.9em',
                    cursor: 'pointer',
                    minHeight: 'var(--touch-min)',
                    border: `2px solid var(--gray-75)`,
                    borderRadius: 'var(--radius)',
                    background: active ? 'var(--gray-90)' : 'transparent',
                    color: active ? 'var(--gray-00)' : 'var(--color-text)',
                  }}
                >
                  {label}
                  {tProgs.length > 0 && (
                    <span style={{ marginLeft: 6, opacity: 0.7, fontWeight: 400 }}>
                      ({tProgs.length})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {currentTabPrograms.length === 0 ? (
            <div className="muted" style={{ fontSize: '0.9em', padding: '8px 0' }}>—</div>
          ) : (
            <div className="stack">
              {currentTabPrograms.map((prog) => (
                <ProgramCard key={prog.id} prog={prog} />
              ))}
            </div>
          )}
        </>
      )}

      {confirmRemove && (
        <ConfirmDialog
          title={t('program.confirm_remove', { name: confirmRemove.name })}
          message={t('program.confirm_remove_msg')}
          confirmLabel={t('program.remove')}
          danger
          onConfirm={() => handleRemove(confirmRemove)}
          onCancel={() => setConfirmRemove(null)}
        />
      )}
    </div>
  );
}

function formatDate(ymd, lang) {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-');
  if (lang === 'en') return `${m}/${d}/${y}`;
  return `${d}/${m}/${y}`;
}

function ProgramMeta({ program, t, lang, today }) {
  if (program.periodMode === 'ongoing') {
    if (!program.active) return <span>{t('program.ongoing_inactive')}</span>;
    return <span>{t('program.by_ongoing')}</span>;
  }
  if (!program.startDate) return null;
  const isActive = today >= program.startDate && (!program.endDate || today <= program.endDate);
  const startFormatted = formatDate(program.startDate, lang);
  const endFormatted = program.endDate ? formatDate(program.endDate, lang) : null;
  const weekNum = isActive ? weeksSince(program.startDate) + 1 : null;
  return (
    <span>
      {startFormatted}
      {endFormatted && ` → ${endFormatted}`}
      {isActive && weekNum != null && (
        <>
          {' · '}
          {program.durationWeeks
            ? t('program.week_of', { current: Math.max(1, Math.min(weekNum, program.durationWeeks)), total: program.durationWeeks })
            : t('program.week_of', { current: weekNum, total: '∞' })}
        </>
      )}
    </span>
  );
}

function ExercisePicker({ exercises, assigned, onAddMany, onClose, t }) {
  const available = exercises.filter((ex) => !assigned.includes(ex.id));
  const [selected, setSelected] = useState([]);

  function toggle(id) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function confirm() {
    if (selected.length > 0) onAddMany(selected);
    onClose();
  }

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="picker-title" onClick={onClose}>
      <div className="dialog" style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 id="picker-title" style={{ margin: 0 }}>{t('program.picker_title')}</h2>
          <button type="button" className="ghost" onClick={onClose} style={{ fontSize: '1.4rem', minHeight: 44, padding: '0 12px' }}>×</button>
        </div>
        {available.length === 0 ? (
          <p className="muted">{t('program.all_added')}</p>
        ) : (
          <>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {available.map((ex) => {
                const checked = selected.includes(ex.id);
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => toggle(ex.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                      padding: '10px 0', background: checked ? 'var(--color-surface-2)' : 'none',
                      border: 'none', borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer', textAlign: 'left', minHeight: 56,
                    }}
                  >
                    {ex.videoId && (
                      <img src={`https://img.youtube.com/vi/${ex.videoId}/mqdefault.jpg`} alt="" width={60} height={45} style={{ borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <span style={{ flex: 1 }}>{ex.name}</span>
                    <span style={{
                      width: 24, height: 24, borderRadius: 6, flexShrink: 0, marginRight: 4,
                      border: '2px solid var(--color-border)',
                      background: checked ? 'var(--color-primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: checked ? 'var(--color-primary-text)' : 'transparent',
                      fontWeight: 700, fontSize: '1rem',
                    }}>✓</span>
                  </button>
                );
              })}
            </div>
            <div style={{ paddingTop: 12 }}>
              <button type="button" className="primary" style={{ width: '100%' }} onClick={confirm} disabled={selected.length === 0}>
                {selected.length > 0 ? `${t('program.add_exercise')} (${selected.length})` : t('program.add_exercise')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DaySection({ day, lang, exercises, schedule, onAdd, onRemove, t }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const assigned = schedule[day] || [];
  const assignedExercises = assigned
    .map((id) => exercises.find((e) => e.id === id))
    .filter(Boolean);

  return (
    <div
      style={{
        borderLeft: '3px solid var(--color-cta-bg, var(--accent, #0a84ff))',
        paddingLeft: 12,
        marginBottom: 16,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>
        {weekdayLabel(day, lang)}
      </div>
      {assignedExercises.map((ex) => (
        <div
          key={ex.id}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--color-border, #333)' }}
        >
          {ex.videoId && (
            <img
              src={`https://img.youtube.com/vi/${ex.videoId}/mqdefault.jpg`}
              alt=""
              width={60}
              height={45}
              style={{ borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <span style={{ flex: 1, fontSize: '0.9em' }}>{ex.name}</span>
          <button
            type="button"
            aria-label={`${t('routine.remove')} ${ex.name}`}
            onClick={() => onRemove(ex.id, day)}
            style={{ padding: '2px 8px', fontSize: '1em', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      ))}
      <div style={{ position: 'relative', marginTop: 8 }}>
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          style={{ fontSize: '0.85em' }}
        >
          {t('program.add_exercise')}
        </button>
        {pickerOpen && (
          <ExercisePicker
            day={day}
            exercises={exercises}
            assigned={assigned}
            onAddMany={(ids) => ids.forEach((id) => onAdd(id, day))}
            onClose={() => setPickerOpen(false)}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

function ProgramEditor({ program, exercises, lang, t, onSave, onCancel }) {
  const [errors, setErrors] = useState({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState(null);
  const [form, setForm] = useState(() => {
    const activeDays = program?.activeDays?.length
      ? program.activeDays
      : deriveActiveDays(program?.schedule);
    // Collect unique exercise ids from all days
    const exerciseIds = program?.schedule
      ? [...new Set(Object.values(program.schedule).flat())]
      : [];
    return {
      name: program?.name || '',
      periodMode: program?.periodMode || 'dates',
      startDate: program?.startDate || todayYMD(),
      durationWeeks: program?.durationWeeks || 4,
      endDate: program?.endDate || '',
      activeDays,
      exerciseIds,
    };
  });

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDay(day) {
    setForm((prev) => {
      const active = prev.activeDays.includes(day)
        ? prev.activeDays.filter((d) => d !== day)
        : [...prev.activeDays, day];
      return { ...prev, activeDays: active };
    });
  }

  function addManyExercises(ids) {
    setForm((prev) => {
      const newIds = ids.filter((id) => !prev.exerciseIds.includes(id));
      return { ...prev, exerciseIds: [...prev.exerciseIds, ...newIds] };
    });
  }

  function removeExercise(id) {
    setForm((prev) => ({ ...prev, exerciseIds: prev.exerciseIds.filter((e) => e !== id) }));
    setPendingRemove(null);
  }

  function moveExercise(id, dir) {
    setForm((prev) => {
      const arr = [...prev.exerciseIds];
      const i = arr.indexOf(id);
      const j = i + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...prev, exerciseIds: arr };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (form.periodMode === 'weeks' && (!form.durationWeeks || Number(form.durationWeeks) < 1)) {
      newErrors.durationWeeks = t('program.error_num_weeks');
    }
    if (form.periodMode === 'dates' && !form.endDate) {
      newErrors.endDate = t('program.error_end_date');
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    let startDate = form.startDate;
    let endDate = form.endDate;
    let durationWeeks = null;

    if (form.periodMode === 'ongoing') {
      startDate = null;
      endDate = null;
      durationWeeks = null;
    } else if (form.periodMode === 'weeks') {
      endDate = addWeeks(form.startDate, Number(form.durationWeeks));
      durationWeeks = Number(form.durationWeeks);
    }

    const schedule = {};
    form.activeDays.forEach((day) => {
      schedule[day] = form.exerciseIds;
    });
    onSave({
      name: form.name.trim(),
      periodMode: form.periodMode,
      startDate,
      endDate,
      durationWeeks,
      activeDays: form.activeDays,
      schedule,
      active: program?.active ?? false,
    });
  }

  const activeDaysInOrder = ORDERED_DAYS.filter((d) => form.activeDays.includes(d));

  return (
    <div className="stack">
      <h1 style={{ margin: 0 }}>{program ? t('program.edit') : t('program.new')}</h1>
      <form className="stack" onSubmit={handleSubmit} style={{ gap: 24 }}>

        {/* Step 1 — Name */}
        <section className="stack-sm">
          <label htmlFor="prog-name" style={{ fontWeight: 600 }}>
            1. {t('program.name_label')}
          </label>
          <input
            id="prog-name"
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder={t('program.name_placeholder')}
            required
            autoFocus
          />
        </section>

        {/* Step 2 — Period */}
        <section className="stack-sm">
          <div style={{ fontWeight: 600, marginBottom: 4 }}>2. {t('program.period_mode')}</div>

          {/* Segmented control */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignSelf: 'flex-start' }}>
            {['dates', 'weeks', 'ongoing'].map((mode) => {
              const active = form.periodMode === mode;
              const label =
                mode === 'weeks'
                  ? t('program.by_weeks')
                  : mode === 'ongoing'
                  ? t('program.by_ongoing')
                  : t('program.by_dates');
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setField('periodMode', mode)}
                  style={{
                    padding: '10px 24px',
                    fontWeight: 700,
                    fontSize: '0.95em',
                    cursor: 'pointer',
                    minHeight: 'var(--touch-min)',
                    border: `2px solid var(--gray-75)`,
                    borderRadius: 'var(--radius)',
                    background: active ? 'var(--gray-90)' : 'transparent',
                    color: active ? 'var(--gray-00)' : 'var(--color-text)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {form.periodMode === 'ongoing' ? (
            <p className="muted" style={{ fontSize: '0.9em', margin: 0 }}>
              {t('program.ongoing_note')}
            </p>
          ) : form.periodMode === 'weeks' ? (
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="stack-sm" style={{ width: 'fit-content' }}>
                <label htmlFor="prog-duration">{t('program.num_weeks')}</label>
                <input
                  id="prog-duration"
                  type="number"
                  min="1"
                  max="52"
                  value={form.durationWeeks}
                  onChange={(e) => { setField('durationWeeks', e.target.value === '' ? '' : Number(e.target.value)); setErrors((prev) => ({ ...prev, durationWeeks: null })); }}
                  style={{ textAlign: 'center', width: '100%' }}
                />
                {errors.durationWeeks && (
                  <span style={{ color: 'var(--color-danger)', fontSize: '0.85em' }}>{errors.durationWeeks}</span>
                )}
              </div>
              <div className="stack-sm" style={{ width: 'fit-content' }}>
                <label htmlFor="prog-start">{t('program.starts_on')}</label>
                <input
                  id="prog-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setField('startDate', e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="stack-sm">
                <label htmlFor="prog-start">{t('program.start_date')}</label>
                <input
                  id="prog-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setField('startDate', e.target.value)}
                  required
                />
              </div>
              <div className="stack-sm">
                <label htmlFor="prog-end">{t('program.end_date')}</label>
                <input
                  id="prog-end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => { setField('endDate', e.target.value); setErrors((prev) => ({ ...prev, endDate: null })); }}
                  min={form.startDate}
                />
                {errors.endDate && <span style={{ color: 'var(--color-danger)', fontSize: '0.85em' }}>{errors.endDate}</span>}
              </div>
            </div>
          )}
        </section>

        {/* Step 3 — Active days */}
        <section className="stack-sm">
          <div style={{ fontWeight: 600 }}>3. {t('program.active_days')}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ORDERED_DAYS.map((day) => {
              const active = form.activeDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  style={{
                    minWidth: 48,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.9em',
                    cursor: 'pointer',
                    border: '2px solid var(--gray-75)',
                    background: active ? 'var(--color-cta-bg)' : 'transparent',
                    color: active ? 'var(--gray-90)' : 'var(--color-text)',
                  }}
                >
                  {weekdayShort(day, lang)}
                </button>
              );
            })}
          </div>
          {form.activeDays.length === 0 && (
            <div className="muted" style={{ fontSize: '0.85em' }}>
              {t('program.no_active_days')}
            </div>
          )}
        </section>

        {/* Step 4 — Exercises (applied to all active days) */}
        {activeDaysInOrder.length > 0 && (
          <section className="stack-sm">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>4. {t('program.exercises_label')}</div>
            {exercises.length === 0 ? (
              <div className="banner">
                {t('program.no_exercises_pre')} <Link to="/biblioteca">{t('program.no_exercises_link_text')}</Link> {t('program.no_exercises_post')}
              </div>
            ) : (
              <>
                {form.exerciseIds.map((id, idx) => {
                  const ex = exercises.find((e) => e.id === id);
                  if (!ex) return null;
                  const isConfirming = pendingRemove === id;
                  return (
                    <div key={id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                        {ex.videoId && (
                          <img src={`https://img.youtube.com/vi/${ex.videoId}/mqdefault.jpg`} alt="" width={56} height={42} style={{ borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                        )}
                        <span style={{ flex: 1 }}>{ex.name}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <button type="button" className="ghost" onClick={() => moveExercise(id, -1)} disabled={idx === 0} aria-label={t('common.move_up')} style={{ minHeight: 28, padding: '0 6px', fontSize: '0.85rem', lineHeight: 1 }}>▲</button>
                          <button type="button" className="ghost" onClick={() => moveExercise(id, 1)} disabled={idx === form.exerciseIds.length - 1} aria-label={t('common.move_down')} style={{ minHeight: 28, padding: '0 6px', fontSize: '0.85rem', lineHeight: 1 }}>▼</button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPendingRemove(isConfirming ? null : id)}
                          aria-label={`${t('routine.remove')} ${ex.name}`}
                          style={{ padding: '2px 10px', minHeight: 36, color: isConfirming ? 'var(--color-danger)' : undefined }}
                        >×</button>
                      </div>
                      {isConfirming && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
                          <span style={{ flex: 1, fontSize: '0.85em', color: 'var(--color-danger)' }}>{t('program.confirm_remove_exercise')}</span>
                          <button type="button" className="danger" onClick={() => removeExercise(id)} style={{ minHeight: 36, padding: '0 12px' }}>{t('common.remove')}</button>
                          <button type="button" onClick={() => setPendingRemove(null)} style={{ minHeight: 36, padding: '0 12px' }}>{t('common.cancel')}</button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div style={{ marginTop: 8 }}>
                  <button type="button" onClick={() => setPickerOpen(true)}>
                    {t('program.add_exercise')}
                  </button>
                </div>
                {pickerOpen && (
                  <ExercisePicker
                    exercises={exercises}
                    assigned={form.exerciseIds}
                    onAddMany={addManyExercises}
                    onClose={() => setPickerOpen(false)}
                    t={t}
                  />
                )}
              </>
            )}
          </section>
        )}

        <div className="row-end" style={{ marginTop: 8 }}>
          <button type="button" onClick={onCancel}>{t('common.cancel')}</button>
          <button type="submit" className="primary">{t('program.save')}</button>
        </div>
      </form>
    </div>
  );
}
