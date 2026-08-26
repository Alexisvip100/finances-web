import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as aggregatesApi from '../../api/aggregates';
import { extractErrorMessage } from '../../api/client';
import { FlowResponse } from '../../types';

interface FlowState {
  data: FlowResponse | null;
  days: 30 | 60 | 90;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: FlowState = { data: null, days: 60, status: 'idle', error: null };

export const fetchFlowThunk = createAsyncThunk(
  'flow/fetch',
  async (days: 30 | 60 | 90, { rejectWithValue }) => {
    try {
      return { days, data: await aggregatesApi.fetchFlow(days) };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const flowSlice = createSlice({
  name: 'flow',
  initialState,
  reducers: {
    setDays(state, action: { payload: 30 | 60 | 90 }) {
      state.days = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlowThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFlowThunk.fulfilled, (state, action) => {
        state.status = 'idle';
        state.data = action.payload.data;
        state.days = action.payload.days;
      })
      .addCase(fetchFlowThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      });
  },
});

export const { setDays } = flowSlice.actions;
export default flowSlice.reducer;
