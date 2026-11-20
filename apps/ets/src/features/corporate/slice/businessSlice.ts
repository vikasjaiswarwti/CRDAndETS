import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "business_info";

interface BusinessInfo {
  businessFullName: string;
  businessShortName: string;
}

interface BusinessUiState {
  isFilterPanelOpen: boolean;
  activeFilterId: string | null;
  pendingStatusToggleId: string | null;
  businessFullName: string;
  businessShortName: string;
}

// ── Load persisted business info ─────────────────────────────
const loadBusinessInfo = (): BusinessInfo => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        businessFullName: "",
        businessShortName: "",
      };
    }

    const parsed = JSON.parse(raw);

    return {
      businessFullName: parsed.businessFullName ?? "",
      businessShortName: parsed.businessShortName ?? "",
    };
  } catch {
    return {
      businessFullName: "",
      businessShortName: "",
    };
  }
};

// ── Save business info ───────────────────────────────────────
const saveBusinessInfo = (business: BusinessInfo) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(business));
  } catch {
    // Ignore localStorage errors
  }
};

const business = loadBusinessInfo();

const initialState: BusinessUiState = {
  isFilterPanelOpen: false,
  activeFilterId: null,
  pendingStatusToggleId: null,
  businessFullName: business.businessFullName,
  businessShortName: business.businessShortName,
};

export const businessSlice = createSlice({
  name: "businessUi",
  initialState,
  reducers: {
    toggleFilterPanel(state) {
      state.isFilterPanelOpen = !state.isFilterPanelOpen;
    },
    setActiveFilter(state, action: PayloadAction<string | null>) {
      state.activeFilterId = action.payload;
    },
    setPendingStatusToggle(state, action: PayloadAction<string | null>) {
      state.pendingStatusToggleId = action.payload;
    },

    setBusiness(state, action: PayloadAction<BusinessInfo>) {
      state.businessFullName = action.payload.businessFullName;
      state.businessShortName = action.payload.businessShortName;

      // Persist to localStorage
      saveBusinessInfo(action.payload);
    },

    resetBusinessUi(state) {
      state.isFilterPanelOpen = false;
      state.activeFilterId = null;
      state.pendingStatusToggleId = null;
      state.businessFullName = "";
      state.businessShortName = "";

      // Clear persisted values
      saveBusinessInfo({
        businessFullName: "",
        businessShortName: "",
      });
    },
  },
});

export const {
  toggleFilterPanel,
  setActiveFilter,
  setPendingStatusToggle,
  setBusiness,
  resetBusinessUi,
} = businessSlice.actions;

export default businessSlice.reducer;