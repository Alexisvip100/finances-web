import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as categoriesApi from '../../api/categories';
import { extractErrorMessage } from '../../api/client';
import { Category } from '../../types';

interface CategoriesState {
  items: Category[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: CategoriesState = { items: [], status: 'idle', error: null };

export const fetchCategoriesThunk = createAsyncThunk('categories/fetch', async (_: void, { rejectWithValue }) => {
  try {
    return await categoriesApi.fetchCategories();
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const createCategoryThunk = createAsyncThunk(
  'categories/create',
  async (payload: Parameters<typeof categoriesApi.createCategory>[0], { rejectWithValue }) => {
    try {
      return await categoriesApi.createCategory(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateCategoryThunk = createAsyncThunk(
  'categories/update',
  async ({ id, payload }: { id: number; payload: Parameters<typeof categoriesApi.updateCategory>[1] }, { rejectWithValue }) => {
    try {
      return await categoriesApi.updateCategory(id, payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteCategoryThunk = createAsyncThunk(
  'categories/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await categoriesApi.deleteCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoriesThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchCategoriesThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      })
      .addCase(createCategoryThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCategoryThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteCategoryThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      })
      .addCase(updateCategoryThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteCategoryThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default categoriesSlice.reducer;
