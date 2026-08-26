import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ToastTone = 'success' | 'error';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface UiState {
  toast: Toast | null;
}

const initialState: UiState = { toast: null };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<{ message: string; tone?: ToastTone }>) => {
      state.toast = {
        id: Date.now(),
        message: action.payload.message,
        tone: action.payload.tone ?? 'success',
      };
    },
    hideToast: (state) => {
      state.toast = null;
    },
  },
});

export const { showToast, hideToast } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
