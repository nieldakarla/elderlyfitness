import BottomNav from './BottomNav.jsx';

export default function AppShell({ children }) {
  return (
    <div className="app">
      <main className="app-main">{children}</main>
      <BottomNav />
    </div>
  );
}
