import { useCallback, useMemo, useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { C } from "../pages/ReportPage";
import type { Report } from "../types/reports.types";
import { CATEGORY_COLORS, ReportCard } from "./Reportcard";
import CategoryIcon from "./CategoryIcon";
interface ReportListViewProps {
  categoryOrder: string[];
  grouped: Record<string, Report[]>;
  totalReports?:number;
}

const ReportListView: React.FC<ReportListViewProps> = ({
  categoryOrder,
  grouped,
  totalReports=0,
}) => {
  const { Input } = useUILibrary();

  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [openCats, setOpenCats] = useState<Set<string>>(
    new Set([categoryOrder[0], categoryOrder[1]].filter(Boolean)),
  );

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categoryOrder
      .map((cat) => {
        const reports = (grouped[cat] ?? []).filter((r) => {
          if (activeTab !== "All" && cat !== activeTab) return false;
          if (q && !r.displayName.toLowerCase().includes(q)) return false;
          return true;
        });
        return { cat, reports };
      })
      .filter(({ reports }) => reports.length > 0);
  }, [search, activeTab, categoryOrder, grouped]);

  const toggleCat = useCallback((cat: string) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }, []);

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      if (tab !== "All") {
        setOpenCats((prev) => (prev.has(tab) ? prev : new Set([...prev, tab])));
      } else {
        setOpenCats(
          new Set([categoryOrder[0], categoryOrder[1]].filter(Boolean)),
        );
      }
    },
    [categoryOrder],
  );
  const tabs = ["All", ...categoryOrder];
  return (
    <div style={{ background: C.pageBg, minHeight: "100%" }}>
      {/* ── Top white header ────────────────────────────────────────────── */}
      <div
        style={{
          background: C.white,
          borderBottom: `1px solid ${C.border}`,
          padding: "24px 28px 0",
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: C.gray900,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Reports
          </h1>
          <p style={{ fontSize: 13, color: C.gray400, margin: "4px 0 0" }}>
            Explore and generate insights with{" "}
            <strong style={{ color: C.gray700 }}>{totalReports}</strong>{" "}
            comprehensive reports across all operations.
          </p>
        </div>

        {/* Search + action buttons */}
        <div style={{ display: "inline-flex", gap: 10, marginBottom: 10 }}>
          <Input
            prefix={
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#9CA3AF"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
            placeholder="Search reports..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            allowClear
            style={{
              flex: 1,
              height: 38,
              width: 320,
              borderRadius: 999,
              fontSize: 13,
              color: C.gray700,
              background: C.white,
              border: `1px solid ${C.border}`,
              boxShadow: "none",
            }}
          />

          {/* <Button
            style={{
              height: 38,
              padding: "0 16px",
              borderRadius: 999,
              background: C.green,
              border: "none",
              fontWeight: 600,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              color: C.white,
              gap: 6,
              whiteSpace: "nowrap",
              flexShrink: 0,
              boxShadow: "none",
            }}
            icon={
              <svg
                width="13"
                height="13"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            Custom Report
          </Button> */}
{/* 
          <Button
            style={{
              height: 38,
              padding: "0 16px",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 13,
              color: C.green,
              border: `1px solid ${C.green}`,
              background: C.white,
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
              flexShrink: 0,
              boxShadow: "none",
            }}
            icon={
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          >
            Reports History
          </Button> */}
        </div>

        {/* Category tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            paddingBottom: 2,
          }}
        >
          {tabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                style={{
                  height: 34,
                  padding: "0 16px",
                  borderRadius: 99,
                  border: `1px solid ${isActive ? C.green : C.border}`,
                  background: isActive ? C.green : C.white,
                  color: isActive ? C.white : C.gray700,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.12s ease",
                  whiteSpace: "nowrap",
                  marginBottom: 8,
                }}
              >
                {tab === "All" ? "All Categories" : tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Accordion sections ───────────────────────────────────────────── */}
      <div
        style={{
          padding: "20px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {filteredGroups.length === 0 && (
          <div
            style={{
              background: C.white,
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              padding: "60px 24px",
              textAlign: "center",
              color: C.gray400,
              fontSize: 14,
            }}
          >
            No reports match your search.
          </div>
        )}

        {filteredGroups.map(({ cat, reports }) => {
          const isOpen = openCats.has(cat);
          const colors = CATEGORY_COLORS[cat] ?? {
            icon: "#6B7280",
            circleBg: "#F9FAFB",
          };

          return (
            <div
              key={cat}
              style={{
                background: C.white,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                overflow: "hidden",
              }}
            >
              {/* Section header */}
              <button
                onClick={() => toggleCat(cat)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 20px",
                  background: "transparent",
                  border: "none",
                  borderBottom: isOpen ? `1px solid ${C.borderLight}` : "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: colors.circleBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CategoryIcon category={cat} color={colors.icon} />
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 15, fontWeight: 700, color: C.gray900 }}
                  >
                    {cat}
                  </div>
                  <div style={{ fontSize: 12, color: C.gray400, marginTop: 1 }}>
                    {reports.length} report{reports.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={C.gray400}
                  strokeWidth={2}
                  style={{
                    flexShrink: 0,
                    transition: "transform 0.2s ease",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Card grid */}
              {isOpen && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(210px, 1fr))",
                    gap: 12,
                    padding: 20,
                  }}
                >
                  {reports.map((r) => (
                    <ReportCard
                      key={r.id}
                      displayName={r.displayName}
                      category={cat}
                      onClick={() =>
                        window.open(`/reports/analytics?id=${r.id}`, "_blank")
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ReportListView;