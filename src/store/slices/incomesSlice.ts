import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as incomesApi from '../../api/incomes';
import { extractErrorMessage } from '../../api/client';

interface IncomesState {
  items: incomesApi.Income[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: IncomesState = { items: [], status: 'idle', error: null };

export const fetchIncomesThunk = createAsyncThunk('incomes/fetch', async (_: void, { rejectWithValue }) => {
  try {
    return await incomesApi.fetchIncomes();
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const createIncomeThunk = createAsyncThunk(
  'incomes/create',
  async (payload: incomesApi.CreateIncomePayload, { rejectWithValue }) => {
    try {
      return await incomesApi.createIncome(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateIncomeThunk = createAsyncThunk(
  'incomes/update',
  async ({ id, payload }: { id: number; payload: Partial<incomesApi.CreateIncomePayload> }, { rejectWithValue }) => {
    try {
      return await incomesApi.updateIncome(id, payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteIncomeThunk = createAsyncThunk('incomes/delete', async (id: number, { rejectWithValue }) => {
  try {
    await incomesApi.deleteIncome(id);
    return id;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const receiveIncomeThunk = createAsyncThunk(
  'incomes/receive',
  async ({ id, payload }: { id: number; payload?: { received_date?: string; amount?: string } }, { rejectWithValue }) => {
    try {
      return await incomesApi.receiveIncome(id, payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteIncomeReceiptThunk = createAsyncThunk(
  'incomes/deleteReceipt',
  async (id: number, { rejectWithValue }) => {
    try {
      await incomesApi.deleteIncomeReceipt(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const incomesSlice = createSlice({
  name: 'incomes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncomesThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchIncomesThunk.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchIncomesThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      })
      .addCase(createIncomeThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateIncomeThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteIncomeThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      })
      .addCase(receiveIncomeThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteIncomeReceiptThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default incomesSlice.reducer;
