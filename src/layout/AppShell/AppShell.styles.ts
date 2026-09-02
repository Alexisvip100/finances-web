import React from 'react';
import { colors, fontSize, radius, spacing } from '../../theme/theme';

export const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    height: '100vh',
    background: colors.background,
  },
};

export const cssRules = `
  .app-shell {
    display: flex;
    height: 100vh;
    height: 100dvh;
    background: ${colors.background};
  }
  .app-content {
    flex: 1;
    min-width: 0;
    height: 100vh;
    height: 100dvh;
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
`;
