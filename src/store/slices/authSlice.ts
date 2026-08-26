import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as authApi from '../../api/auth';
import { setAuthToken, TOKEN_STORAGE_KEY, extractErrorMessage } from '../../api/client';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  bootstrapped: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
  bootstrapped: false,
};

async function persistToken(token: string) {
  setAuthToken(token);
  await localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  const token = await localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return null;
  setAuthToken(token);
  try {
    const user = await authApi.fetchMe();
    return { token, user };
  } catch {
    setAuthToken(null);
    await localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
});

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { access_token } = await authApi.register(payload.email, payload.password);
      await persistToken(access_token);
      const user = await authApi.fetchMe();
      return { token: access_token, user };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { access_token } = await authApi.login(payload.email, payload.password);
      await persistToken(access_token);
      const user = await authApi.fetchMe();
      return { token: access_token, user };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  setAuthToken(null);
  await localStorage.removeItem(TOKEN_STORAGE_KEY);
});

export const updateSpendingGoalThunk = createAsyncThunk(
  'auth/updateSpendingGoal',
  async (monthlySpendingGoal: string | null, { rejectWithValue }) => {
    try {
      return await authApi.updateMe({ monthly_spending_goal: monthlySpendingGoal });
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action: PayloadAction<{ token: string; user: User } | null>) => {
        state.bootstrapped = true;
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.bootstrapped = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.user = null;
      })
      .addCase(updateSpendingGoalThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateSpendingGoalThunk.rejected, (state, action) => {
        state.error = (action.payload as string) ?? 'No se pudo guardar tu meta.';
      });

    for (const thunk of [registerThunk, loginThunk]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = 'idle';
          state.token = action.payload.token;
          state.user = action.payload.user;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'error';
          state.error = (action.payload as string) ?? 'No se pudo completar la operación.';
        });
    }
  },
});

export default authSlice.reducer;
