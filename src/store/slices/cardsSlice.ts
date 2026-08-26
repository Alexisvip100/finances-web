import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as cardsApi from '../../api/cards';
import { extractErrorMessage } from '../../api/client';
import { CreditCard, CreditCardDetail } from '../../types';

interface CardsState {
  items: CreditCard[];
  detailById: Record<number, CreditCardDetail>;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: CardsState = { items: [], detailById: {}, status: 'idle', error: null };

export const fetchCardsThunk = createAsyncThunk('cards/fetch', async (_: void, { rejectWithValue }) => {
  try {
    return await cardsApi.fetchCards();
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const fetchCardDetailThunk = createAsyncThunk(
  'cards/fetchDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      return await cardsApi.fetchCardDetail(id);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createCardThunk = createAsyncThunk(
  'cards/create',
  async (payload: cardsApi.CreateCardPayload, { rejectWithValue }) => {
    try {
      return await cardsApi.createCard(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateCardThunk = createAsyncThunk(
  'cards/update',
  async (
    { id, payload }: { id: number; payload: Parameters<typeof cardsApi.updateCard>[1] },
    { rejectWithValue }
  ) => {
    try {
      return await cardsApi.updateCard(id, payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteCardThunk = createAsyncThunk('cards/delete', async (id: number, { rejectWithValue }) => {
  try {
    await cardsApi.deleteCard(id);
    return id;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCardsThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCardsThunk.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchCardsThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      })
      .addCase(fetchCardDetailThunk.fulfilled, (state, action) => {
        state.detailById[action.payload.id] = action.payload;
      })
      .addCase(createCardThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCardThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteCardThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
        delete state.detailById[action.payload];
      });
  },
});

export default cardsSlice.reducer;
