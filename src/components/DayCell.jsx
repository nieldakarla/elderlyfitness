import { useT } from '../lib/useT.js';

export default function DayCell({ day, ymd, inMonth, isToday, status, onClick }) {
  const { t } = useT();
  const classes = ['day-cell'];
  if (!inMonth) classes.push('outside');
  if (isToday) classes.push('today');
  if (status?.isRest) classes.push('rest');
  else if (status?.allDone) classes.push('completed');
  else if (status?.hasWorkout) classes.push('has-workout');

  const aria = (() => {
    const parts = [t('daycell.aria_day', { day })];
    if (status?.isRest) parts.push(t('daycell.aria_rest'));
    else if (status?.allDone) parts.push(t('daycell.aria_all_done'));
    else if (status?.hasWorkout)
      parts.push(t('daycell.aria_progress', { done: status.done, total: status.total }));
    if (isToday) parts.push(t('daycell.aria_today'));
    return parts.join(', ');
  })();

  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={() => onClick(ymd)}
      aria-label={aria}
    >
      <span>{day}</span>
      <span className="marker" aria-hidden="true" />
    </button>
  );
}
