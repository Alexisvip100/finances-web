import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { colors, fontSize, radius, spacing } from '../theme/theme';
import { Icon } from '../components/Icon';

const TABS = [
  { to: '/', label: 'Inicio', icon: 'home-outline', iconActive: 'home' },
  { to: '/flujo', label: 'Flujo', icon: 'trending-up-outline', iconActive: 'trending-up' },
  { to: '/tarjetas', label: 'Tarjetas', icon: 'card-outline', iconActive: 'card' },
  { to: '/presupuesto', label: 'Presupuesto', icon: 'pie-chart-outline', iconActive: 'pie-chart' },
  { to: '/ajustes', label: 'Ajustes', icon: 'settings-outline', iconActive: 'settings' },
];

export default function AppShell() {
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

      <main className="app-content">
        <Outlet />
      </main>

      <nav className="tab-bar">
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
