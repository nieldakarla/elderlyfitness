import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './state/store.jsx';
import AppShell from './components/AppShell.jsx';
import Today from './routes/Today.jsx';
import Calendar from './routes/Calendar.jsx';
import Library from './routes/Library.jsx';
import Routine from './routes/Routine.jsx';
import Settings from './routes/Settings.jsx';

export default function App() {
  const { state } = useStore();

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme;
    document.documentElement.style.setProperty('--font-scale', String(state.settings.fontScale));
  }, [state.settings.theme, state.settings.fontScale]);

  useEffect(() => {
    const o = window.screen?.orientation;
    if (!o?.lock) return;

    const lockPortrait = () => {
      try {
        o.lock('portrait').catch(() => {});
      } catch {}
    };
    const unlock = () => { try { o.unlock(); } catch {} };

    lockPortrait();

    function handleFullscreenChange() {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        unlock();
      } else {
        lockPortrait();
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      unlock();
    };
  }, []);

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Today />} />
        <Route path="/calendario" element={<Calendar />} />
        <Route path="/calendario/:ymd" element={<Calendar />} />
        <Route path="/biblioteca" element={<Library />} />
        <Route path="/rotina" element={<Routine />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
