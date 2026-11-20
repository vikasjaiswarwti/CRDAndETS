import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { setPlaySound, togglePlaySound } from "../slice/playSoundSlice";
import { savePlaySoundEnabled } from "../persistence/playSoundStorage";

export const playSoundListenerMiddleware = createListenerMiddleware();

playSoundListenerMiddleware.startListening({
    matcher: isAnyOf(setPlaySound, togglePlaySound),
    effect: (_action, listenerApi) => {
        const state = listenerApi.getState() as {
            securityUi: { enabled: boolean };
        };
        savePlaySoundEnabled(state.securityUi.enabled);
    },
});