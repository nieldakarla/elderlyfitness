import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fromYMD, todayYMD, monthLabel, addMonths, dayLabelLong } from '../lib/date.js';
import { useT } from '../lib/useT.js';
import MonthGrid from '../components/MonthGrid.jsx';
import DayWorkouts from '../components/DayWorkouts.jsx';

export default function Calendar() {
  const { ymd: paramYmd } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const initialYmd = paramYmd || todayYMD();
  const initialDate = fromYMD(initialYmd);

  const [view, setView] = useState({
    year: initialDate.getFullYear(),
    month0: initialDate.getMonth(),
  });
  const [selected, setSelected] = useState(paramYmd || null);

  function go(delta) {
    setView((v) => addMonths(v.year, v.month0, delta));
  }

  function pickDay(ymd) {
    setSelected(ymd);
    navigate(`/calendario/${ymd}`, { replace: true });
  }

  return (
    <div className="stack">
      <div className="month-header">
        <button onClick={() => go(-1)} aria-label={t('calendar.prev_month')} style={{ fontSize: '1.6rem', minWidth: 56 }}>
          ‹
        </button>
        <strong style={{ fontSize: '1.15rem' }}>{monthLabel(view.year, view.month0, lang)}</strong>
        <button onClick={() => go(1)} aria-label={t('calendar.next_month')} style={{ fontSize: '1.6rem', minWidth: 56 }}>
          ›
        </button>
      </div>

      <div style={{ margin: '0 calc(-1 * var(--gap))' }}>
        <MonthGrid
          year={view.year}
          month0={view.month0}
          onPickDay={pickDay}
          selectedYmd={selected}
        />
      </div>

      <div className="row-end">
        <button
          onClick={() => {
            const tYmd = todayYMD();
            const d = fromYMD(tYmd);
            setView({ year: d.getFullYear(), month0: d.getMonth() });
            pickDay(tYmd);
          }}
        >
          {t('calendar.go_today')}
        </button>
      </div>

      {selected && (
        <section aria-label={t('calendar.day_detail')} className="stack">
          <h2 style={{ marginTop: 16 }}>{dayLabelLong(selected, lang)}</h2>
          <DayWorkouts ymd={selected} />
        </section>
      )}
    </div>
  );
}
