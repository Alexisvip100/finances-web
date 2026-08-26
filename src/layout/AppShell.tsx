import React, { useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { colors, fontSize, radius, spacing } from '../theme/theme';
import { Icon } from '../components/Icon';

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

      <style>{`
        .app-shell {
          display: flex;
          height: 100vh;
          background: ${colors.background};
        }
        .app-content {
          flex: 1;
          min-width: 0;
          height: 100vh;
          overflow: hidden;
          padding-bottom: 76px;
        }
        .sidebar { display: none; }
        .tab-bar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          height: 76px;
          background: ${colors.surface};
          border-top: 1px solid ${colors.divider};
          display: flex;
          padding: 8px 0 14px;
        }
        .tab-indicator {
          position: absolute;
          top: 0;
          left: 0;
          height: 3px;
          background: ${colors.accent};
          border-radius: 0 0 3px 3px;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tab-link {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: ${colors.textMuted};
          font-size: ${fontSize.xs}px;
          font-weight: 700;
        }
        .tab-link.active { color: ${colors.accent}; }

        @media (min-width: 900px) {
          .app-content { padding-bottom: 0; }
          .tab-bar { display: none; }
          .sidebar {
            display: flex;
            flex-direction: column;
            width: 240px;
            flex-shrink: 0;
            background: ${colors.surface};
            border-right: 1px solid ${colors.divider};
            padding: ${spacing.xl}px ${spacing.md}px;
          }
          .sidebar-brand {
            color: ${colors.textPrimary};
            font-size: ${fontSize.xxl}px;
            font-weight: 800;
            padding: 0 ${spacing.md}px;
            margin-bottom: ${spacing.xl}px;
          }
          .sidebar-link {
            display: flex;
            align-items: center;
            gap: ${spacing.md}px;
            padding: ${spacing.md}px;
            border-radius: ${radius.input}px;
            color: ${colors.textSecondary};
            font-size: ${fontSize.md}px;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .sidebar-link:hover { background: ${colors.surfaceAlt}; }
          .sidebar-link.active { background: ${colors.accentMuted}; color: ${colors.accent}; }
        }
      `}</style>
    </div>
  );
}
