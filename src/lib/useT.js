import { useStore } from '../state/store.jsx';
import { t, DEFAULT_LANGUAGE } from './i18n.js';

export function useT() {
  const { state } = useStore();
  const lang = state.settings.language || DEFAULT_LANGUAGE;
  return {
    t: (key, params) => t(key, lang, params),
    lang,
  };
}
