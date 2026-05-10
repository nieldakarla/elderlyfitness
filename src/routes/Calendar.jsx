import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fromYMD, todayYMD, monthLabel, addMonths, dayLabelLong } from '../lib/date.js';
import MonthGrid from '../components/MonthGrid.jsx';
import DayWorkouts from '../components/DayWorkouts.jsx';

export default function Calendar() {
  const { ymd: paramYmd } = useParams();
  const navigate = useNavigate();
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
      <h1>Calendário</h1>

      <div className="month-header">
        <button onClick={() => go(-1)} aria-label="Mês anterior">
          ‹
        </button>
        <strong style={{ fontSize: '1.1rem' }}>{monthLabel(view.year, view.month0)}</strong>
        <button onClick={() => go(1)} aria-label="Próximo mês">
          ›
        </button>
      </div>

      <MonthGrid
        year={view.year}
        month0={view.month0}
        onPickDay={pickDay}
        selectedYmd={selected}
      />

      <div className="row-end">
        <button
          onClick={() => {
            const t = todayYMD();
            const d = fromYMD(t);
            setView({ year: d.getFullYear(), month0: d.getMonth() });
            pickDay(t);
          }}
        >
          Ir para hoje
        </button>
      </div>

      {selected && (
        <section aria-label="Detalhe do dia" className="stack">
          <h2 style={{ marginTop: 16 }}>{dayLabelLong(selected)}</h2>
          <DayWorkouts ymd={selected} />
        </section>
      )}
    </div>
  );
}
