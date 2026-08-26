import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as aggregatesApi from '../../api/aggregates';
import { extractErrorMessage } from '../../api/client';
import { BudgetResponse } from '../../types';

interface BudgetState {
  data: BudgetResponse | null;
  month: string;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const initialState: BudgetState = { data: null, month: currentMonthKey(), status: 'idle', error: null };

export const fetchBudgetThunk = createAsyncThunk(
  'budget/fetch',
  async (month: string, { rejectWithValue }) => {
    try {
      return await aggregatesApi.fetchBudget(month);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setMonth(state, action: { payload: string }) {
      state.month = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgetThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBudgetThunk.fulfilled, (state, action) => {
        state.status = 'idle';
        state.data = action.payload;
        state.month = action.payload.month;
      })
      .addCase(fetchBudgetThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      });
  },
});

export const { setMonth } = budgetSlice.actions;
export default budgetSlice.reducer;
