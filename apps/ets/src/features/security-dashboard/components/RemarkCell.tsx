import { useState } from "react";

const RemarkCell: React.FC<{ text: string }> = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const limit = 90;
  const isLong = text.length > limit;
  const displayText = expanded || !isLong ? text : text.slice(0, limit);

  return (
    <span>
      “{displayText}
      {!expanded && isLong && "…"}”
      {isLong && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          style={{
            color: "#2563EB",
            fontWeight: 600,
            fontStyle: "normal",
            cursor: "pointer",
            marginLeft: 5,
          }}
        >
          {expanded ? "less" : "more"}
        </span>
      )}
    </span>
  );
};

export default RemarkCell;
