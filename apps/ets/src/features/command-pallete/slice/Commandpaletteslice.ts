// ─── Command Palette Slice ────────────────────────────────────────────────────
// Manages all command palette UI state.
// Search index lives outside Redux (Fuse instance is non-serializable).
// Only serializable state goes here.

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  CommandPaletteState,
  SearchIndexItem,
  RecentSearch,
} from '../types/command-palette.types';

const initialState: CommandPaletteState = {
  isOpen: false,
  query: '',
  results: [],
  selectedIndex: 0,
  recentSearches: [],
  isIndexReady: false,
};

const commandPaletteSlice = createSlice({
  name: 'commandPalette',
  initialState,
  reducers: {
    open(state) {
      state.isOpen = true;
      state.query = '';
      state.results = [];
      state.selectedIndex = 0;
    },

    close(state) {
      state.isOpen = false;
      state.query = '';
      state.results = [];
      state.selectedIndex = 0;
    },

    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
      state.selectedIndex = 0;
    },

    setResults(state, action: PayloadAction<SearchIndexItem[]>) {
      state.results = action.payload;
      state.selectedIndex = 0;
    },

    selectNext(state) {
    if (state.results.length === 0) return;

    const max = state.results.length - 1;

    state.selectedIndex =
      state.selectedIndex >= max
        ? 0
        : state.selectedIndex + 1;
    },

    selectPrev(state) {
      if (state.results.length === 0) return;
        const max = state.results.length - 1;
        state.selectedIndex =
          state.selectedIndex <= 0
            ? max
            : state.selectedIndex - 1;
    },


    setSelectedIndex(state, action: PayloadAction<number>) {
      state.selectedIndex = action.payload;
    },

    markIndexReady(state) {
      state.isIndexReady = true;
    },

    setRecentSearches(state, action: PayloadAction<RecentSearch[]>) {
      state.recentSearches = action.payload;
    },

    addRecentSearch(state, action: PayloadAction<RecentSearch>) {
      // Dedupe by route, cap at 8 for UI (full 20 stored in localStorage)
      const filtered = state.recentSearches.filter(
        (r) => r.selectedItemRoute !== action.payload.selectedItemRoute,
      );
      state.recentSearches = [action.payload, ...filtered].slice(0, 8);
    },
  },
});

export const commandPaletteActions = commandPaletteSlice.actions;
export default commandPaletteSlice.reducer;