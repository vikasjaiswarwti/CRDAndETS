import { PLAY_SOUND_STORAGE_KEY } from "./playSoundStorage";
import { setPlaySound } from "../slice/playSoundSlice";
import type { store as AppStoreInstance } from "../../../app/store";

export const initPlaySoundCrossTabSync = (
    store: typeof AppStoreInstance,
): (() => void) => {
    const handleStorage = (event: StorageEvent) => {
        if (event.key !== PLAY_SOUND_STORAGE_KEY || event.newValue === null) return;

        const next = event.newValue === "true";
        if (store.getState().securityUi.enabled !== next) {
            store.dispatch(setPlaySound(next));
        }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
};