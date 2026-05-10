import { useRef, useState } from 'react';
import { useStore } from '../state/store.jsx';
import { exportJSON, readJSONFile, validateImported } from '../lib/backup.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const FONT_OPTIONS = [
  { value: 1, label: 'Normal' },
  { value: 1.25, label: 'Grande' },
  { value: 1.5, label: 'Maior' },
];

export default function Settings() {
  const { state, actions } = useStore();
  const fileRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState('');

  function changeTheme(theme) {
    actions.updateSettings({ theme });
  }
  function changeFont(scale) {
    actions.updateSettings({ fontScale: scale });
  }
  function changeWeekStart(day) {
    actions.updateSettings({ weekStartsOn: Number(day) });
  }

  async function handleFile(e) {
    setImportError('');
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readJSONFile(file);
      if (!validateImported(data)) {
        setImportError('Arquivo inválido. Selecione um backup gerado pelo próprio app.');
        return;
      }
      setImportPreview(data);
    } catch (err) {
      setImportError('Não foi possível ler o arquivo.');
    } finally {
      e.target.value = '';
    }
  }

  function confirmImport() {
    if (!importPreview) return;
    actions.replaceAll(importPreview);
    setImportPreview(null);
  }

  const exerciseCount = Object.values(state.exercises).filter((e) => !e.archived).length;
  const completionDays = Object.keys(state.completions).length;

  return (
    <div className="stack">
      <h1>Ajustes</h1>

      <section className="card stack-sm">
        <h2 style={{ marginTop: 0 }}>Aparência</h2>

        <div>
          <label>Tema</label>
          <div className="toggle-group">
            <button
              className={state.settings.theme === 'light' ? 'active' : ''}
              onClick={() => changeTheme('light')}
            >
              Claro
            </button>
            <button
              className={state.settings.theme === 'dark' ? 'active' : ''}
              onClick={() => changeTheme('dark')}
            >
              Escuro
            </button>
          </div>
        </div>

        <div>
          <label>Tamanho da fonte</label>
          <div className="toggle-group">
            {FONT_OPTIONS.map((opt) => (
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
          <label>Início da semana</label>
          <div className="toggle-group">
            <button
              className={state.settings.weekStartsOn === 0 ? 'active' : ''}
              onClick={() => changeWeekStart(0)}
            >
              Domingo
            </button>
            <button
              className={state.settings.weekStartsOn === 1 ? 'active' : ''}
              onClick={() => changeWeekStart(1)}
            >
              Segunda
            </button>
          </div>
        </div>
      </section>

      <section className="card stack-sm">
        <h2 style={{ marginTop: 0 }}>Backup</h2>
        <p className="muted" style={{ margin: 0 }}>
          Seus dados ficam só neste aparelho. Exporte um arquivo regularmente para não perder nada
          se trocar de celular ou limpar dados do navegador.
        </p>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button className="primary" onClick={() => exportJSON(state)}>
            Exportar dados
          </button>
          <button onClick={() => fileRef.current?.click()}>Importar dados</button>
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
        <h2 style={{ marginTop: 0 }}>Resumo</h2>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>{exerciseCount} treinos ativos na biblioteca</li>
          <li>{completionDays} dias com treino marcado</li>
          <li>Versão dos dados: {state.version}</li>
        </ul>
      </section>

      {importPreview && (
        <ConfirmDialog
          title="Substituir todos os dados?"
          message="Importar este backup apaga todos os treinos, rotina, calendário e histórico atuais. Não dá para desfazer."
          confirmLabel="Substituir"
          danger
          onConfirm={confirmImport}
          onCancel={() => setImportPreview(null)}
        />
      )}
    </div>
  );
}
