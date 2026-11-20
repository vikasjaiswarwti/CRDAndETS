import React from "react";

const DAY_COUNT = 7;
const HOUR_COUNT = 24;

const shimmer = "speed-skeleton-shimmer";

const SpeedHeatmapSkeleton: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <style>{`
        .${shimmer} {
          background: linear-gradient(90deg, #eef0f3 25%, #e2e6ee 37%, #eef0f3 63%);
          background-size: 400% 100%;
          animation: speed-skeleton-shimmer-move 1.4s ease-in-out infinite;
        }
        @keyframes speed-skeleton-shimmer-move {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <table
        className="min-w-180 text-xs"
        style={{ borderCollapse: "separate", borderSpacing: 1 }}
      >
        <thead>
          <tr>
            <th className="w-18" />
            {Array.from({ length: DAY_COUNT }).map((_, i) => (
              <th key={i} className="py-2 text-center">
                <div className={`mx-auto h-3 w-8 rounded ${shimmer}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: HOUR_COUNT }).map((_, hour) => (
            <tr key={hour}>
              <td style={{ paddingRight: 4 }}>
                {hour % 2 === 0 && (
                  <div className={`ml-auto h-3 w-12 rounded ${shimmer}`} />
                )}
              </td>
              {Array.from({ length: DAY_COUNT }).map((_, day) => (
                <td key={day} className="h-6 w-34 p-0.5">
                  <div
                    className={`h-full w-full rounded-sm ${shimmer}`}
                    style={{ animationDelay: `${(hour * DAY_COUNT + day) * 15}ms` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend placeholder */}
      <div
        className="flex flex-wrap items-center justify-center gap-3"
        style={{ margin: "12px 0" }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className={`h-3 w-3 rounded-sm ${shimmer}`} />
            <span className={`h-3 w-10 rounded ${shimmer}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpeedHeatmapSkeleton;
