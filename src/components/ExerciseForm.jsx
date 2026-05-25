import { useState, useRef } from 'react';
import { extractVideoId } from '../lib/youtube.js';
import { useT } from '../lib/useT.js';

export default function ExerciseForm({ initial, onSave, onCancel }) {
  const { t } = useT();
  const isNew = !initial?.id;
  const [name, setName] = useState(initial?.name || '');
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtubeUrl || '');
  const [durationMin, setDurationMin] = useState(initial?.durationMin || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [touched, setTouched] = useState(false);
  const [createAnother, setCreateAnother] = useState(false);
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const lastFetchedId = useRef(null);

  const trimmedName = name.trim();
  const videoId = extractVideoId(youtubeUrl);
  const urlValid = !youtubeUrl.trim() || !!videoId;
  const canSubmit = trimmedName.length > 0 && !!videoId;

  function reset() {
    setName('');
    setYoutubeUrl('');
    setDurationMin('');
    setNotes('');
    setTouched(false);
  }

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
    }, createAnother);
    if (createAnother) reset();
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
          placeholder={fetchingTitle ? t('form.name_fetching') : t('form.name_placeholder')}
          autoComplete="off"
          required
          disabled={fetchingTitle}
        />
      </div>

      <div>
        <label htmlFor="ex-url">{t('form.url_label')}</label>
        <input
          id="ex-url"
          type="url"
          value={youtubeUrl}
          onChange={(e) => {
          const url = e.target.value;
          setYoutubeUrl(url);
          const vid = extractVideoId(url);
          if (vid && vid !== lastFetchedId.current && !name.trim()) {
            lastFetchedId.current = vid;
            setFetchingTitle(true);
            fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`)
              .then((r) => r.json())
              .then((data) => { if (data.title && !name.trim()) setName(data.title); })
              .catch(() => {})
              .finally(() => setFetchingTitle(false));
          }
        }}
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        {isNew ? (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 400, cursor: 'pointer' }}>
            <input type="checkbox" checked={createAnother} onChange={(e) => setCreateAnother(e.target.checked)} style={{ width: 20, height: 20 }} />
            {t('form.create_another')}
          </label>
        ) : <span />}
        <div className="row-end" style={{ margin: 0 }}>
          {onCancel && <button type="button" onClick={onCancel}>{t('common.cancel')}</button>}
          <button type="submit" className="primary" disabled={!canSubmit}>
            {t('common.save')}
          </button>
        </div>
      </div>
    </form>
  );
}
