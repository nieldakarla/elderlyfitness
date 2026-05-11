import { useT } from '../lib/useT.js';

export default function ConfirmDialog({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) {
  const { t } = useT();
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
      <div className="dialog">
        <h2 id="dlg-title">{title}</h2>
        {message && <p className="muted">{message}</p>}
        <div className="row-end" style={{ marginTop: 16 }}>
          <button onClick={onCancel}>{cancelLabel ?? t('common.cancel')}</button>
          <button className={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel ?? t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
