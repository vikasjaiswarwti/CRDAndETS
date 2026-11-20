// src/features/routeManagement/components/TableShimmer.tsx
export function TableShimmer({
  rows = 6,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  // AFTER — returns Fragment of <tr> rows, slots cleanly inside any <tbody>
  return (
    <>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} style={{ borderBottom: "1px solid #F3F4F6" }}>
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} style={{ padding: "14px 10px" }}>
              <div
                style={{
                  height: 12,
                  borderRadius: 6,
                  background:
                    "linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.4s infinite",
                  width: ci === 0 ? 20 : ci === 1 ? "70%" : "50%",
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
