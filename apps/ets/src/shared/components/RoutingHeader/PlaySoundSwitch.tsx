import React from "react";
import { useUILibrary } from "../../lib/ui-lib/ui-library-context";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store/index";
import { setPlaySound } from "../../../features/security-dashboard/slice/playSoundSlice";
import { useIsMobile } from "../../customHooks/useIsMobile";
/* ── Styles ──────────────────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  playSoundWrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  playSoundLabel: {
    fontSize: "var(--text-label-sm-size)" as unknown as number,
    color: "var(--color-text-tertiary)",
    marginRight: 4,
  },
  toggleLabel: {
    fontSize: "var(--text-caption-size)" as unknown as number,
    fontWeight: 600,
    minWidth: 16,
    textAlign: "center" as const,
  },
};
const mobileStyles: Record<string, React.CSSProperties> = {
  playSoundWrap: {
    gap: 4,
    width: "100%",
    justifyContent: "center",
  },
  playSoundLabel: {
    fontSize: "var(--text-caption-size)" as unknown as number,
    marginRight: 2,
    display: "none",
  },
  toggleLabel: {
    fontSize: 12,
    minWidth: 14,
    display: "none",
  },
};

const PlaySoundSwitch = () => {
  const { Switch } = useUILibrary();
  const dispatch = useDispatch();
  const isMobile = useIsMobile();

  const playSoundEnabled = useSelector(
    (state: RootState) => state.securityUi.enabled,
  );

  return (
    <div
      style={{
        ...s.playSoundWrap,
        ...(isMobile ? mobileStyles.playSoundWrap : {}),
      }}
    >
      <span
        style={{
          ...s.playSoundLabel,
          // ...(isMobile ? mobileStyles.playSoundLabel : {}),
        }}
      >
        <>{playSoundEnabled ? "Close" : "Play"}</> Sound
      </span>
      <span
        style={{
          ...s.toggleLabel,
          ...(isMobile ? mobileStyles.toggleLabel : {}),
          color: !playSoundEnabled
            ? "var(--color-text-primary)"
            : "var(--color-text-placeholder)",
        }}
      >
        No
      </span>
      <Switch
        size="small"
        checked={playSoundEnabled}
        onChange={(checked) => dispatch(setPlaySound(checked))}
        style={{
          backgroundColor: playSoundEnabled
            ? "var(--color-brand-primary)"
            : undefined,
        }}
      />
      <span
        style={{
          ...s.toggleLabel,
          ...(isMobile ? mobileStyles.toggleLabel : {}),
          color: playSoundEnabled
            ? "var(--color-brand-primary)"
            : "var(--color-text-placeholder)",
        }}
      >
        Yes
      </span>
    </div>
  );
};

export default PlaySoundSwitch;
