import { useState } from 'react';
import { extractVideoId } from '../lib/youtube.js';
import { useT } from '../lib/useT.js';

export default function ExerciseForm({ initial, onSave, onCancel }) {
  const { t } = useT();
  const [name, setName] = useState(initial?.name || '');
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtubeUrl || '');
  const [durationMin, setDurationMin] = useState(initial?.durationMin || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [touched, setTouched] = useState(false);

  const trimmedName = name.trim();
  const videoId = extractVideoId(youtubeUrl);
  const urlValid = !youtubeUrl.trim() || !!videoId;
  const canSubmit = trimmedName.length > 0 && !!videoId;

  function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    onSave({
      id: initial?.id,
      name: trimmedName,
      youtubeUrl: youtubeUrl.trim(),
      durationMin: durationMin ? Number(durationMin) : null,
      notes: notes.trim(),
    });
  }

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <div>
        <label htmlFor="ex-name">{t('form.name_label')}</label>
        <input
          id="ex-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('form.name_placeholder')}
          autoComplete="off"
          required
        />
      </div>

      <div>
        <label htmlFor="ex-url">{t('form.url_label')}</label>
        <input
          id="ex-url"
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder={t('form.url_placeholder')}
          inputMode="url"
          autoComplete="off"
          aria-invalid={!urlValid}
        />
        {!urlValid && touched && (
          <div className="muted" style={{ marginTop: 4, color: 'var(--color-danger)' }}>
            {t('form.url_invalid')}
          </div>
        )}
        {videoId && (
          <div className="muted" style={{ marginTop: 4 }}>
            {t('form.url_valid')}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="ex-dur">{t('form.duration_label')}</label>
        <input
          id="ex-dur"
          type="number"
          inputMode="numeric"
          min="1"
          value={durationMin}
          onChange={(e) => setDurationMin(e.target.value)}
          placeholder={t('form.duration_placeholder')}
        />
      </div>

      <div>
        <label htmlFor="ex-notes">{t('form.notes_label')}</label>
        <textarea
          id="ex-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('form.notes_placeholder')}
        />
      </div>

      <div className="row-end">
        {onCancel && <button type="button" onClick={onCancel}>{t('common.cancel')}</button>}
        <button type="submit" className="primary" disabled={!canSubmit}>
          {t('common.save')}
        </button>
      </div>
    </form>
  );
}
