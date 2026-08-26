import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as transactionsApi from '../../api/transactions';
import * as fixedExpensesApi from '../../api/fixedExpenses';
import { extractErrorMessage } from '../../api/client';
import { Transaction } from '../../types';

interface TransactionsState {
  items: Transaction[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: TransactionsState = { items: [], status: 'idle', error: null };

export const fetchTransactionsThunk = createAsyncThunk(
  'transactions/fetch',
  async (params: Parameters<typeof transactionsApi.fetchTransactions>[0], { rejectWithValue }) => {
    try {
      return await transactionsApi.fetchTransactions(params);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createTransactionThunk = createAsyncThunk(
  'transactions/create',
  async (payload: transactionsApi.CreateTransactionPayload, { rejectWithValue }) => {
    try {
      return await transactionsApi.createTransaction(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const payFixedExpenseThunk = createAsyncThunk(
  'transactions/payFixedExpense',
  async ({ id, transactionDate }: { id: number; transactionDate?: string }, { rejectWithValue }) => {
    try {
      return await fixedExpensesApi.payFixedExpense(id, transactionDate);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteTransactionThunk = createAsyncThunk(
  'transactions/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await transactionsApi.deleteTransaction(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionsThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTransactionsThunk.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchTransactionsThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      })
      .addCase(createTransactionThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(payFixedExpenseThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteTransactionThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export default transactionsSlice.reducer;
