import React from 'react';
import { PageShell } from '../../components/PageShell';
import { PrimaryButton, TextLinkButton } from '../../components/Buttons';
import { ErrorBanner } from '../../components/Misc';
import { TextField } from '../../components/TextField';
import { styles } from './AuthPage.styles';
import { useAuthPage } from './AuthPage.hooks';

export default function AuthPage() {
  const {
    mode,
    email,
    password,
    canSubmit,
    status,
    error,
    setEmail,
    setPassword,
    toggleMode,
    submit,
  } = useAuthPage();

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
        onPress={toggleMode}
      />
    </PageShell>
  );
}
