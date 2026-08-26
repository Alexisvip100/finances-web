import React, { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { PrimaryButton, TextLinkButton } from '../components/Buttons';
import { ErrorBanner } from '../components/Misc';
import { TextField } from '../components/TextField';
import { colors, fontSize, spacing } from '../theme/theme';
import { useAppDispatch, useAppSelector } from '../store';
import { loginThunk, registerThunk } from '../store/slices/authSlice';

export default function AuthPage() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = email.includes('@') && password.length >= 8;

  const submit = () => {
    if (!canSubmit) return;
    if (mode === 'register') {
      dispatch(registerThunk({ email, password }));
    } else {
      dispatch(loginThunk({ email, password }));
    }
  };

  return (
    <PageShell contentStyle={{ maxWidth: 420, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%' }}>
      <p style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: 800, marginBottom: spacing.xxxl, textAlign: 'center' }}>
        Ciclos<span style={{ color: colors.accent }}>.</span>
      </p>
      <h1 style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800, marginBottom: spacing.sm }}>
        {mode === 'register' ? 'Crea tu cuenta' : 'Inicia sesión'}
      </h1>
      <p style={{ color: colors.textSecondary, fontSize: fontSize.md, marginBottom: spacing.xxl, lineHeight: '21px' }}>
        {mode === 'register' ? 'Tu dinero no vive en meses. Vive en ciclos.' : 'Entra para ver tus tarjetas y tu flujo real.'}
      </p>

      {error ? <ErrorBanner message={error} /> : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <TextField label="Correo" value={email} onChangeText={setEmail} placeholder="tucorreo@ejemplo.com" type="email" />
        <TextField label="Contraseña" value={password} onChangeText={setPassword} placeholder="Mínimo 8 caracteres" secure />

        <PrimaryButton
          label={mode === 'register' ? 'Crear cuenta' : 'Entrar'}
          onPress={submit}
          disabled={!canSubmit}
          loading={status === 'loading'}
          style={{ marginTop: spacing.xl }}
        />
      </form>
      <TextLinkButton
        label={mode === 'register' ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'}
        onPress={() => setMode(mode === 'register' ? 'login' : 'register')}
      />
    </PageShell>
  );
}
