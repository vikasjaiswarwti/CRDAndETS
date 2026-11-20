interface LiveButtonProps {
  label?: string;
  isLive?: boolean;
}

const LiveButton: React.FC<LiveButtonProps> = ({
  isLive = false,
  label = "Live",
}) => {
  const color = isLive ? "#EF4444" : "#9CA3AF";
  const textColor = isLive ? "#B91C1C" : "#6B7280";
  const background = isLive ? "#EF444422" : "#F3F4F6";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 12px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        background,
        color: textColor,
        userSelect: "none",
      }}
    >
      <span
        style={{
          position: "relative",
          width: 7,
          height: 7,
          flexShrink: 0,
        }}
      >
        {isLive && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: color,
              animation: "livePing 1.4s ease-out infinite",
              opacity: 0,
            }}
          />
        )}

        <span
          style={{
            display: "block",
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: color,
          }}
        />
      </span>

      {isLive ? label : "Disconnected"}
      <style>{`
        @keyframes livePing {
          0%   { transform: scale(0.8); opacity: 0.7; }
          80%  { transform: scale(3); opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LiveButton;