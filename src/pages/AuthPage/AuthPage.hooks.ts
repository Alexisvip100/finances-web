import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginThunk, registerThunk } from '../../store/slices/authSlice';
import type { AuthMode, AuthPageTypes } from './AuthPage.types';

export const useAuthPage = (): AuthPageTypes => {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);
  const [mode, setMode] = useState<AuthMode>('register');
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

  const toggleMode = () => {
    setMode((prev) => (prev === 'register' ? 'login' : 'register'));
  };

  return {
    mode,
    email,
    password,
    canSubmit,
    status,
    error,
    setMode,
    setEmail,
    setPassword,
    toggleMode,
    submit,
  };
};
