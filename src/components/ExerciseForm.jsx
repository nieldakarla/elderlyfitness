import { useState } from 'react';
import { extractVideoId } from '../lib/youtube.js';

export default function ExerciseForm({ initial, onSave, onCancel }) {
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
        <label htmlFor="ex-name">Nome do treino</label>
        <input
          id="ex-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Alongamento matinal"
          autoComplete="off"
          required
        />
      </div>

      <div>
        <label htmlFor="ex-url">Link do YouTube</label>
        <input
          id="ex-url"
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          inputMode="url"
          autoComplete="off"
          aria-invalid={!urlValid}
        />
        {!urlValid && touched && (
          <div className="muted" style={{ marginTop: 4, color: 'var(--color-danger)' }}>
            Link inválido. Cole um link do YouTube.
          </div>
        )}
        {videoId && (
          <div className="muted" style={{ marginTop: 4 }}>
            ✓ Vídeo identificado
          </div>
        )}
      </div>

      <div>
        <label htmlFor="ex-dur">Duração (minutos)</label>
        <input
          id="ex-dur"
          type="number"
          inputMode="numeric"
          min="1"
          value={durationMin}
          onChange={(e) => setDurationMin(e.target.value)}
          placeholder="20"
        />
      </div>

      <div>
        <label htmlFor="ex-notes">Notas (opcional)</label>
        <textarea
          id="ex-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Lembretes, equipamento, etc."
        />
      </div>

      <div className="row-end">
        {onCancel && <button type="button" onClick={onCancel}>Cancelar</button>}
        <button type="submit" className="primary" disabled={!canSubmit}>
          Salvar
        </button>
      </div>
    </form>
  );
}
