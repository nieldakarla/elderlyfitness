import { NavLink } from 'react-router-dom';
import { useT } from '../lib/useT.js';

const items = [
  { to: '/', labelKey: 'nav.today', icon: '☀' },
  { to: '/calendario', labelKey: 'nav.month', icon: '▦' },
  { to: '/rotina', labelKey: 'nav.routine', icon: '↻' },
  { to: '/biblioteca', labelKey: 'nav.exercises', icon: '☰' },
  { to: '/configuracoes', labelKey: 'nav.settings', icon: '⚙' },
];

export default function BottomNav() {
  const { t } = useT();
  return (
    <nav className="bottom-nav" aria-label={t('nav.aria')}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <span className="icon" aria-hidden="true">
            {item.icon}
          </span>
          <span>{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
