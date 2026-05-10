export default function DayCell({ day, ymd, inMonth, isToday, status, onClick }) {
  const classes = ['day-cell'];
  if (!inMonth) classes.push('outside');
  if (isToday) classes.push('today');
  if (status?.isRest) classes.push('rest');
  else if (status?.allDone) classes.push('completed');
  else if (status?.hasWorkout) classes.push('has-workout');

  const aria = (() => {
    const parts = [`Dia ${day}`];
    if (status?.isRest) parts.push('descanso');
    else if (status?.allDone) parts.push('todos os treinos feitos');
    else if (status?.hasWorkout) parts.push(`${status.done} de ${status.total} treinos feitos`);
    if (isToday) parts.push('hoje');
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
