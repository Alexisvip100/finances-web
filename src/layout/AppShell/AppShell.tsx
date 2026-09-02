import React, { useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { cssRules } from './AppShell.styles';

const TABS = [
  { to: '/', label: 'Inicio', icon: 'home-outline', iconActive: 'home' },
  { to: '/flujo', label: 'Flujo', icon: 'trending-up-outline', iconActive: 'trending-up' },
  { to: '/tarjetas', label: 'Tarjetas', icon: 'card-outline', iconActive: 'card' },
  { to: '/presupuesto', label: 'Presupuesto', icon: 'pie-chart-outline', iconActive: 'pie-chart' },
  { to: '/ajustes', label: 'Ajustes', icon: 'settings-outline', iconActive: 'settings' },
];

// Umbral mínimo para no confundir un scroll vertical con un swipe de cambio
// de tab, y para no disparar con toques accidentales.
const SWIPE_MIN_DISTANCE = 60;

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const activeIndex = Math.max(
    0,
    TABS.findIndex((tab) => (tab.to === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.to)))
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const deltaX = t.clientX - start.x;
    const deltaY = t.clientY - start.y;
    if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;
    // Swipe de derecha a izquierda (deltaX negativo) avanza a la siguiente tab.
    const direction = deltaX < 0 ? 1 : -1;
    const nextIndex = activeIndex + direction;
    if (nextIndex >= 0 && nextIndex < TABS.length) navigate(TABS[nextIndex].to);
  };

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar-brand">Ciclos</div>
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === '/'} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            {({ isActive }) => (
              <>
                <Icon name={isActive ? tab.iconActive : tab.icon} size={20} />
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <main className="app-content" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <Outlet />
      </main>

      <nav className="tab-bar">
        <div
          className="tab-indicator"
          style={{ width: `${100 / TABS.length}%`, transform: `translateX(${activeIndex * 100}%)` }}
        />
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === '/'} className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>
            {({ isActive }) => (
              <>
                <Icon name={isActive ? tab.iconActive : tab.icon} size={20} />
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <style>{cssRules}</style>
    </div>
  );
}
