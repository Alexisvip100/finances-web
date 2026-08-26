import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as fixedExpensesApi from '../../api/fixedExpenses';
import { extractErrorMessage } from '../../api/client';

interface FixedExpensesState {
  items: fixedExpensesApi.FixedExpense[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: FixedExpensesState = { items: [], status: 'idle', error: null };

export const fetchFixedExpensesThunk = createAsyncThunk(
  'fixedExpenses/fetch',
  async (_: void, { rejectWithValue }) => {
    try {
      return await fixedExpensesApi.fetchFixedExpenses();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createFixedExpenseThunk = createAsyncThunk(
  'fixedExpenses/create',
  async (payload: fixedExpensesApi.CreateFixedExpensePayload, { rejectWithValue }) => {
    try {
      return await fixedExpensesApi.createFixedExpense(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateFixedExpenseThunk = createAsyncThunk(
  'fixedExpenses/update',
  async ({ id, payload }: { id: number; payload: Partial<fixedExpensesApi.CreateFixedExpensePayload> }, { rejectWithValue }) => {
    try {
      return await fixedExpensesApi.updateFixedExpense(id, payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteFixedExpenseThunk = createAsyncThunk(
  'fixedExpenses/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await fixedExpensesApi.deleteFixedExpense(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const fixedExpensesSlice = createSlice({
  name: 'fixedExpenses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFixedExpensesThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFixedExpensesThunk.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchFixedExpensesThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      })
      .addCase(createFixedExpenseThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateFixedExpenseThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((f) => f.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteFixedExpenseThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((f) => f.id !== action.payload);
      });
  },
});

export default fixedExpensesSlice.reducer;
