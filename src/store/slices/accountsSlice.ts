import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as accountsApi from '../../api/accounts';
import { extractErrorMessage } from '../../api/client';
import { Account, AccountType } from '../../types';

interface AccountsState {
  items: Account[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: AccountsState = { items: [], status: 'idle', error: null };

export const fetchAccountsThunk = createAsyncThunk('accounts/fetch', async (_: void, { rejectWithValue }) => {
  try {
    return await accountsApi.fetchAccounts();
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const createAccountThunk = createAsyncThunk(
  'accounts/create',
  async (payload: { name: string; type: AccountType; bank?: string; balance?: string }, { rejectWithValue }) => {
    try {
      return await accountsApi.createAccount(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateAccountThunk = createAsyncThunk(
  'accounts/update',
  async ({ id, payload }: { id: number; payload: Parameters<typeof accountsApi.updateAccount>[1] }, { rejectWithValue }) => {
    try {
      return await accountsApi.updateAccount(id, payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteAccountThunk = createAsyncThunk(
  'accounts/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await accountsApi.deleteAccount(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountsThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAccountsThunk.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchAccountsThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      })
      .addCase(createAccountThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateAccountThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteAccountThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
      });
  },
});

export default accountsSlice.reducer;
