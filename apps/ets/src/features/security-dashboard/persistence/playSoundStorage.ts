const STORAGE_KEY = "commutr.playSoundEnabled";
const DEFAULT_ENABLED = true;

export const PLAY_SOUND_STORAGE_KEY = STORAGE_KEY;

export const loadPlaySoundEnabled = (): boolean => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw === null ? DEFAULT_ENABLED : raw === "true";
    } catch {
        return DEFAULT_ENABLED;
    }
};

export const savePlaySoundEnabled = (enabled: boolean): void => {
    try {
        window.localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch (err) {
        console.warn("[playSound] Failed to persist preference:", err);
    }
};