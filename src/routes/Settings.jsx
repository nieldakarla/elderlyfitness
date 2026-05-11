import { useRef, useState } from 'react';
import { useStore } from '../state/store.jsx';
import { useT } from '../lib/useT.js';
import { exportJSON, readJSONFile, validateImported } from '../lib/backup.js';
import { SUPPORTED_LANGUAGES } from '../lib/i18n.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Settings() {
  const { state, actions } = useStore();
  const { t, lang } = useT();
  const fileRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState('');

  const fontOptions = [
    { value: 1, label: t('settings.font_normal') },
    { value: 1.25, label: t('settings.font_large') },
    { value: 1.5, label: t('settings.font_larger') },
  ];

  const languageLabels = {
    'pt-BR': t('settings.lang_pt'),
    en: t('settings.lang_en'),
  };

  function changeTheme(theme) {
    actions.updateSettings({ theme });
  }
  function changeFont(scale) {
    actions.updateSettings({ fontScale: scale });
  }
  function changeWeekStart(day) {
    actions.updateSettings({ weekStartsOn: Number(day) });
  }
  function changeLanguage(value) {
    actions.updateSettings({ language: value });
  }

  async function handleFile(e) {
    setImportError('');
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readJSONFile(file);
      if (!validateImported(data)) {
        setImportError(t('settings.import_invalid'));
        return;
      }
      setImportPreview(data);
    } catch (err) {
      setImportError(t('settings.import_read_error'));
    } finally {
      e.target.value = '';
    }
  }

  function confirmImport() {
    if (!importPreview) return;
    actions.replaceAll(importPreview);
    setImportPreview(null);
  }

  function handleExport() {
    exportJSON(state, t('backup.filename_prefix'));
  }

  const exerciseCount = Object.values(state.exercises).filter((e) => !e.archived).length;
  const completionDays = Object.keys(state.completions).length;

  return (
    <div className="stack">
      <h1>{t('settings.title')}</h1>

      <section className="card stack-sm">
        <h2 style={{ marginTop: 0 }}>{t('settings.appearance')}</h2>

        <div>
          <label>{t('settings.theme')}</label>
          <div className="toggle-group">
            <button
              className={state.settings.theme === 'light' ? 'active' : ''}
              onClick={() => changeTheme('light')}
            >
              {t('settings.theme_light')}
            </button>
            <button
              className={state.settings.theme === 'dark' ? 'active' : ''}
              onClick={() => changeTheme('dark')}
            >
              {t('settings.theme_dark')}
            </button>
          </div>
        </div>

        <div>
          <label>{t('settings.font_size')}</label>
          <div className="toggle-group">
            {fontOptions.map((opt) => (
              <button
                key={opt.value}
                className={state.settings.fontScale === opt.value ? 'active' : ''}
                onClick={() => changeFont(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label>{t('settings.week_start')}</label>
          <div className="toggle-group">
            <button
              className={state.settings.weekStartsOn === 0 ? 'active' : ''}
              onClick={() => changeWeekStart(0)}
            >
              {t('settings.week_sunday')}
            </button>
            <button
              className={state.settings.weekStartsOn === 1 ? 'active' : ''}
              onClick={() => changeWeekStart(1)}
            >
              {t('settings.week_monday')}
            </button>
          </div>
        </div>

        <div>
          <label>{t('settings.language')}</label>
          <div className="toggle-group">
            {SUPPORTED_LANGUAGES.map((code) => (
              <button
                key={code}
                className={lang === code ? 'active' : ''}
                onClick={() => changeLanguage(code)}
              >
                {languageLabels[code] || code}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card stack-sm">
        <h2 style={{ marginTop: 0 }}>{t('settings.backup')}</h2>
        <p className="muted" style={{ margin: 0 }}>
          {t('settings.backup_description')}
        </p>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button className="primary" onClick={handleExport}>
            {t('settings.export')}
          </button>
          <button onClick={() => fileRef.current?.click()}>{t('settings.import')}</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        </div>
        {importError && (
          <div className="banner error" role="alert">
            {importError}
          </div>
        )}
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>{t('settings.summary')}</h2>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>{t('settings.summary_active', { count: exerciseCount })}</li>
          <li>{t('settings.summary_days', { count: completionDays })}</li>
          <li>{t('settings.summary_version', { version: state.version })}</li>
        </ul>
      </section>

      {importPreview && (
        <ConfirmDialog
          title={t('settings.replace_title')}
          message={t('settings.replace_message')}
          confirmLabel={t('settings.replace_label')}
          danger
          onConfirm={confirmImport}
          onCancel={() => setImportPreview(null)}
        />
      )}
    </div>
  );
}
