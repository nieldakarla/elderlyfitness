import { buildMonthGrid, todayYMD, weekHeader } from '../lib/date.js';
import { useStore } from '../state/store.jsx';
import { dayStatus } from '../lib/schedule.js';
import DayCell from './DayCell.jsx';

export default function MonthGrid({ year, month0, onPickDay, selectedYmd }) {
  const { state } = useStore();
  const days = buildMonthGrid(year, month0, state.settings.weekStartsOn);
  const today = todayYMD();
  const header = weekHeader(state.settings.weekStartsOn);

  return (
    <div className="month-grid" role="grid" aria-label="Calendário do mês">
      {header.map((h) => (
        <div key={h.key} className="weekday" role="columnheader">
          {h.label}
        </div>
      ))}
      {days.map((d) => {
        const status = dayStatus(state, d.ymd);
        const selected = selectedYmd === d.ymd;
        return (
          <DayCell
            key={d.ymd}
            day={d.day}
            ymd={d.ymd}
            inMonth={d.inMonth}
            isToday={d.ymd === today || selected}
            status={status}
            onClick={onPickDay}
          />
        );
      })}
    </div>
  );
}
