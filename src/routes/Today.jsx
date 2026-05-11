import { useStore } from '../state/store.jsx';
import { useT } from '../lib/useT.js';
import { todayYMD, dayLabelLong } from '../lib/date.js';
import DayWorkouts from '../components/DayWorkouts.jsx';

const BACKUP_REMINDER_DAYS = 30;
const DAY_MS = 1000 * 60 * 60 * 24;

export default function Today() {
  const { state, actions } = useStore();
  const { t, lang } = useT();
  const ymd = todayYMD();

  const showBackupReminder = (() => {
    const created = state.meta.createdAt;
    if (!created) return false;
    const ageDays = (Date.now() - new Date(created).getTime()) / DAY_MS;
    if (ageDays < BACKUP_REMINDER_DAYS) return false;
    const last = state.meta.lastBackupReminderAt;
    if (!last) return true;
    const sinceLast = (Date.now() - new Date(last).getTime()) / DAY_MS;
    return sinceLast >= BACKUP_REMINDER_DAYS;
  })();

  const exerciseCount = Object.values(state.exercises).filter((e) => !e.archived).length;

  return (
    <div className="stack">
      <div>
        <h1>{t('nav.today')}</h1>
        <p className="muted" style={{ marginTop: -4 }}>{dayLabelLong(ymd, lang)}</p>
      </div>

      {exerciseCount === 0 && (
        <div className="banner">
          <strong>{t('today.welcome')}</strong>
          <p
            style={{ margin: '4px 0 0' }}
            dangerouslySetInnerHTML={{ __html: t('today.welcome_message') }}
          />
        </div>
      )}

      {showBackupReminder && (
        <div className="banner">
          <span dangerouslySetInnerHTML={{ __html: t('today.backup_reminder') }} />
          <div className="row-end" style={{ marginTop: 8 }}>
            <button
              onClick={() =>
                actions.updateMeta({ lastBackupReminderAt: new Date().toISOString() })
              }
            >
              {t('today.remind_later')}
            </button>
          </div>
        </div>
      )}

      <DayWorkouts ymd={ymd} />
    </div>
  );
}
