import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { PrimaryButton, TextLinkButton } from '../../components/Buttons';
import { colors, fontSize, radius, spacing } from '../../theme/theme';

export default function ConceptPage() {
  const navigate = useNavigate();

  return (
    <PageShell contentStyle={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.xxl }}>
        <div style={{ flex: 1, height: 3, background: colors.divider, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: 3, width: '25%', background: colors.accent }} />
        </div>
        <TextLinkButton label="Saltar" onPress={() => navigate('/')} style={{ padding: 0, marginLeft: spacing.lg }} />
      </div>

      <h1 style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800, marginBottom: spacing.md, lineHeight: '30px', margin: `0 0 ${spacing.md}px` }}>
        Tu dinero no vive en meses.
      </h1>
      <p style={{ color: colors.textSecondary, fontSize: fontSize.md, lineHeight: '22px', marginBottom: spacing.xxxl, margin: `0 0 ${spacing.xxxl}px` }}>
        Vive en ciclos. Tu tarjeta cerró el 25 de agosto, no el 31.
      </p>

      <div style={{ background: colors.surface, borderRadius: radius.card, padding: spacing.xl }}>
        <p style={{ color: colors.warning, fontSize: fontSize.sm, fontWeight: 700, marginBottom: spacing.xl, margin: `0 0 ${spacing.xl}px` }}>
          Aquí es donde te pierdes
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, marginBottom: spacing.xl }}>
          <div style={{ borderRadius: radius.input, padding: spacing.lg, background: colors.accent, marginLeft: 0, marginRight: '18%' }}>
            <p style={{ color: colors.black, fontWeight: 800, fontSize: fontSize.md, margin: 0 }}>Tu tarjeta</p>
            <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: fontSize.sm, marginTop: 2, margin: '2px 0 0' }}>25 ago – 25 sep</p>
          </div>
          <div style={{ borderRadius: radius.input, padding: spacing.lg, background: colors.surfaceAlt, marginLeft: '12%', marginRight: 0 }}>
            <p style={{ color: colors.textPrimary, fontWeight: 800, fontSize: fontSize.md, margin: 0 }}>Mes natural</p>
            <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2, margin: '2px 0 0' }}>1 sep – 30 sep</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${colors.divider}`, paddingTop: spacing.md }}>
          <span style={{ color: colors.textMuted, fontSize: fontSize.xs }}>ago</span>
          <span style={{ color: colors.textMuted, fontSize: fontSize.xs }}>sep</span>
          <span style={{ color: colors.textMuted, fontSize: fontSize.xs }}>oct</span>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <PrimaryButton label="Entendido" onPress={() => navigate('/onboarding/cuentas')} />
    </PageShell>
  );
}
