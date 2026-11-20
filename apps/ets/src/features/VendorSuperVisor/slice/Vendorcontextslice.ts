// // features/vendorContext/slices/vendorContextSlice.ts
// import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// interface VendorContextState {
//   transporterId: number | null;
// }

// const initialState: VendorContextState = {
//   transporterId: null,
// };

// const vendorContextSlice = createSlice({
//   name: "vendorContext",
//   initialState,
//   reducers: {
//     setTransporterId(state, action: PayloadAction<number | null>) {
//       state.transporterId = action.payload;
//     },
//     clearVendorContext(state) {
//       state.transporterId = null;
//     },
//   },
// });

// export const { setTransporterId, clearVendorContext } =
//   vendorContextSlice.actions;
// export default vendorContextSlice.reducer;

// // ─── Selectors ────────────────────────────────────────────────────────────────
// // RootState type — adjust the import path to wherever your store is defined
// // e.g. import type { RootState } from "../../../app/store";
// export const selectTransporterId = (state: {
//   vendorContext: VendorContextState;
// }) => state.vendorContext.transporterId;

// features/vendorContext/slices/vendorContextSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface VendorTransporter {
  transporterId: number;
  vendorName: string;
}

interface VendorContextState {
  /** Primary (first) transporter ID — used as the default for single-vendor users */
  transporterId: number | null;
  /** Full list of transporters this vendor supervisor is mapped to */
  transporters: VendorTransporter[];
}

const initialState: VendorContextState = {
  transporterId: null,
  transporters: [],
};

const vendorContextSlice = createSlice({
  name: "vendorContext",
  initialState,
  reducers: {
    setTransporterId(state, action: PayloadAction<number | null>) {
      state.transporterId = action.payload;
    },
    setTransporters(state, action: PayloadAction<VendorTransporter[]>) {
      state.transporters = action.payload;
      // Auto-set primary transporterId from first entry if not already set
      if (action.payload.length > 0 && state.transporterId == null) {
        state.transporterId = action.payload[0].transporterId;
      }
    },
    clearVendorContext(state) {
      state.transporterId = null;
      state.transporters = [];
    },
  },
});

export const { setTransporterId, setTransporters, clearVendorContext } =
  vendorContextSlice.actions;
export default vendorContextSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
// Adjust the RootState type import to wherever your store is defined.
type SliceState = { vendorContext: VendorContextState };

export const selectTransporterId = (state: SliceState) =>
  state.vendorContext.transporterId;

export const selectVendorTransporters = (state: SliceState) =>
  state.vendorContext.transporters;
