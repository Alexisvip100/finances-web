import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../../components/PageShell';
import { PrimaryButton, TextLinkButton } from '../../../components/Buttons';
import { styles } from './ConceptPage.styles';

export default function ConceptPage() {
  const navigate = useNavigate();

  return (
    <PageShell contentStyle={styles.content}>
      <div style={styles.progressRow}>
        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>
        <TextLinkButton label="Saltar" onPress={() => navigate('/')} style={styles.skipBtn} />
      </div>

      <h1 style={styles.title}>
        Tu dinero no vive en meses.
      </h1>
      <p style={styles.subtitle}>
        Vive en ciclos. Tu tarjeta cerró el 25 de agosto, no el 31.
      </p>

      <div style={styles.card}>
        <p style={styles.cardTitle}>
          Aquí es donde te pierdes
        </p>
        <div style={styles.blocksColumn}>
          <div style={styles.cardBlock}>
            <p style={styles.blockTitleDark}>Tu tarjeta</p>
            <p style={styles.blockSubDark}>25 ago – 25 sep</p>
          </div>
          <div style={styles.monthBlock}>
            <p style={styles.blockTitleLight}>Mes natural</p>
            <p style={styles.blockSubLight}>1 sep – 30 sep</p>
          </div>
        </div>
        <div style={styles.monthsRow}>
          <span style={styles.monthLabel}>ago</span>
          <span style={styles.monthLabel}>sep</span>
          <span style={styles.monthLabel}>oct</span>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <PrimaryButton label="Entendido" onPress={() => navigate('/onboarding/cuentas')} />
    </PageShell>
  );
}
