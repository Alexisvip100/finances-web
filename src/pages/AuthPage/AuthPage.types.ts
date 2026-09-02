export type AuthMode = 'login' | 'register';

export interface AuthPageTypes {
  mode: AuthMode;
  email: string;
  password: string;
  canSubmit: boolean;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  setMode: (mode: AuthMode) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  toggleMode: () => void;
  submit: () => void;
}
