import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Hoje', icon: '☀' },
  { to: '/calendario', label: 'Mês', icon: '▦' },
  { to: '/rotina', label: 'Rotina', icon: '↻' },
  { to: '/biblioteca', label: 'Treinos', icon: '☰' },
  { to: '/configuracoes', label: 'Ajustes', icon: '⚙' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
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
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
