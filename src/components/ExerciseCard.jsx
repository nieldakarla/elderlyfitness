import { thumbnailUrl } from '../lib/youtube.js';

export default function ExerciseCard({ exercise, action }) {
  return (
    <div className="card">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        {exercise.videoId && (
          <img
            src={thumbnailUrl(exercise.videoId)}
            alt=""
            width="96"
            height="72"
            style={{ borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0 }}>{exercise.name}</h3>
          {exercise.durationMin && (
            <div className="muted" style={{ marginTop: 4 }}>
              {exercise.durationMin} min
            </div>
          )}
          {exercise.notes && <div style={{ marginTop: 6 }}>{exercise.notes}</div>}
        </div>
      </div>
      {action && <div className="row-end" style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}
