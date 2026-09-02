import React, { useState } from 'react';
import { PageShell } from '../../components/PageShell';
import { PrimaryButton, TextLinkButton } from '../../components/Buttons';
import { ErrorBanner } from '../../components/Misc';
import { TextField } from '../../components/TextField';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginThunk, registerThunk } from '../../store/slices/authSlice';
import { styles } from './AuthPage.styles';

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
    <PageShell contentStyle={styles.pageContent}>
      <p style={styles.brand}>
        Ciclos<span style={styles.brandAccent}>.</span>
      </p>
      <h1 style={styles.title}>
        {mode === 'register' ? 'Crea tu cuenta' : 'Inicia sesión'}
      </h1>
      <p style={styles.subtitle}>
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
          style={styles.submitBtn}
        />
      </form>
      <TextLinkButton
        label={mode === 'register' ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'}
        onPress={() => setMode(mode === 'register' ? 'login' : 'register')}
      />
    </PageShell>
  );
}
