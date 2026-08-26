import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as aggregatesApi from '../../api/aggregates';
import { extractErrorMessage } from '../../api/client';
import { DashboardResponse } from '../../types';

interface DashboardState {
  data: DashboardResponse | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: DashboardState = { data: null, status: 'idle', error: null };

export const fetchDashboardThunk = createAsyncThunk('dashboard/fetch', async (_: void, { rejectWithValue }) => {
  try {
    return await aggregatesApi.fetchDashboard();
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDashboardThunk.fulfilled, (state, action) => {
        state.status = 'idle';
        state.data = action.payload;
      })
      .addCase(fetchDashboardThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
