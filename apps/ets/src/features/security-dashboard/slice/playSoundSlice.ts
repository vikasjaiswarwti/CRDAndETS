// // playSoundSlice.ts
// import { createSlice } from "@reduxjs/toolkit";
// import { type PayloadAction } from "@reduxjs/toolkit";

// interface PlaySoundState {
//     enabled: boolean;
// }

// const initialState: PlaySoundState = {
//     enabled: true,
// };

// const playSoundSlice = createSlice({
//     name: "securityUi",
//     initialState,
//     reducers: {
//         setPlaySound(state, action: PayloadAction<boolean>) {
//             state.enabled = action.payload;
//         },
//         togglePlaySound(state) {
//             state.enabled = !state.enabled;
//         },
//     },
// });

// export const { setPlaySound, togglePlaySound } = playSoundSlice.actions;
// export default playSoundSlice.reducer;
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { loadPlaySoundEnabled } from "../persistence/playSoundStorage";

interface PlaySoundState {
    enabled: boolean;
}

const initialState: PlaySoundState = {
    enabled: loadPlaySoundEnabled(),   // ← was hardcoded `true`; now reads localStorage
};

const playSoundSlice = createSlice({
    name: "securityUi",
    initialState,
    reducers: {
        setPlaySound(state, action: PayloadAction<boolean>) {
            state.enabled = action.payload;
        },
        togglePlaySound(state) {
            state.enabled = !state.enabled;
        },
    },
});

export const { setPlaySound, togglePlaySound } = playSoundSlice.actions;
export default playSoundSlice.reducer;