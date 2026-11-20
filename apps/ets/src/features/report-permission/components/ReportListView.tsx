import { useCallback, useMemo, useState } from "react";
import React from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { C } from "../pages/ReportPage";
import type { Report } from "../types/reports.types";
import { CATEGORY_COLORS, ReportCard } from "./Reportcard";
import CategoryIcon from "./CategoryIcon";
import { useUpdateReportRolesMutation } from "../services/reportPermissionApi";
import { useLookups } from "../../lookups";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ReportListViewProps {
  categoryOrder: string[];
  grouped: Record<string, Report[]>;
  totalReports?: number;
  refetch: any;
}

interface ModalState {
  report: Report;
  category: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const ReportListView: React.FC<ReportListViewProps> = ({
  categoryOrder,
  grouped,
  totalReports = 0,
  refetch,
}) => {
  const { Input, Select, Modal, Button, Switch } = useUILibrary();
  const { roleOptions } = useLookups({
    only: ["roleOptions"],
  });
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [openCats, setOpenCats] = useState<Set<string>>(
    new Set([categoryOrder[0], categoryOrder[1]].filter(Boolean)),
  );

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  // ── RTK mutation ────────────────────────────────────────────────────────────
  const [updateReportRoles, { isLoading: isSaving }] =
    useUpdateReportRolesMutation();

  // ── Filtered groups ─────────────────────────────────────────────────────────
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

  // ── Modal handlers ──────────────────────────────────────────────────────────
  const handleCardClick = useCallback((report: Report, category: string) => {
    setModalState({ report, category });
    setSelectedRoles(report.roleIds ?? []);
    setDisplayName(report.displayName ?? "");
    setIsActive(report.isActive ?? true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState(null);
    setSelectedRoles([]);
    setDisplayName("");
    setIsActive(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!modalState) return;
    try {
      await updateReportRoles({
        reportId: modalState.report.id,
        roleIds: selectedRoles,
        displayName: displayName.trim() || null,
        isActive: isActive,
      });
      // inline instead of calling handleModalClose
      setModalState(null);
      setSelectedRoles([]);
      setDisplayName("");
      setIsActive(true);
      refetch();
      // console.log(data, "data")
    } catch {
      console.log("Error");
      // error handled by RTK — surface via your notification system if needed
    }
  }, [
    modalState,
    selectedRoles,
    displayName,
    isActive,
    updateReportRoles,
    // handleModalClose,
  ]);

  const tabs = ["All", ...categoryOrder];
  const catColors = modalState
    ? (CATEGORY_COLORS[modalState.category] ?? {
        icon: "#6B7280",
        circleBg: "#F9FAFB",
      })
    : null;

  // ── Dirty check — only enable Save if something changed ──────────────────
  const isDirty = useMemo(() => {
    if (!modalState) return false;
    const { report } = modalState;
    const rolesChanged =
      JSON.stringify([...(report.roleIds ?? [])].sort()) !==
      JSON.stringify([...selectedRoles].sort());
    const nameChanged =
      (displayName.trim() || null) !== (report.displayName ?? null);
    const activeChanged = isActive !== report.isActive;
    return rolesChanged || nameChanged || activeChanged;
  }, [modalState, selectedRoles, displayName, isActive]);

  return (
    <div style={{ background: C.pageBg, minHeight: "100%" }}>
      {/* ── Top white header ─────────────────────────────────────────────── */}
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
            Reports Permission
          </h1>
          <p style={{ fontSize: 13, color: C.gray400, margin: "4px 0 0" }}>
            Explore and manage role access for{" "}
            <strong style={{ color: C.gray700 }}>{totalReports}</strong> reports
            across all operations.
          </p>
        </div>

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
            const isTabActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                style={{
                  height: 34,
                  padding: "0 16px",
                  borderRadius: 99,
                  border: `1px solid ${isTabActive ? C.green : C.border}`,
                  background: isTabActive ? C.green : C.white,
                  color: isTabActive ? C.white : C.gray700,
                  fontSize: 13,
                  fontWeight: isTabActive ? 600 : 400,
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

      {/* ── Accordion sections ────────────────────────────────────────────── */}
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
                      onClick={() => handleCardClick(r, cat)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Role Permission Modal ─────────────────────────────────────────── */}
      {modalState && (
        <Modal
          open={!!modalState}
          onCancel={handleModalClose}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {catColors && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: catColors.circleBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CategoryIcon
                    category={modalState.category}
                    color={catColors.icon}
                  />
                </div>
              )}
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: C.gray900,
                    lineHeight: 1.3,
                  }}
                >
                  {modalState.report.displayName}
                </div>
                <div
                  style={{ fontSize: 12, color: C.gray400, fontWeight: 400 }}
                >
                  Manage role access &amp; display settings
                </div>
              </div>
            </div>
          }
          footer={
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                onClick={handleModalClose}
                style={{
                  height: 36,
                  padding: "0 18px",
                  borderRadius: 999,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  color: C.gray500,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <Button
                type="primary"
                loading={isSaving}
                disabled={!isDirty}
                onClick={handleSave}
                style={{
                  height: 36,
                  minWidth: 100,
                  fontWeight: 600,
                  fontSize: 13,
                  background: C.green,
                  border: "none",
                  borderRadius: 999,
                  boxShadow: "none",
                  opacity: isDirty ? 1 : 0.5,
                }}
              >
                Save Changes
              </Button>
            </div>
          }
          width={500}
          style={{ top: 25 }}
        >
          <div
            style={{
              padding: "16px 0 8px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* ── Display Name ─────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.gray400,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Display Name
              </label>
              <Input
                value={displayName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDisplayName(e.target.value)
                }
                placeholder={modalState.report.name}
                style={{
                  height: 36,
                  borderRadius: 8,
                  fontSize: 13,
                  background: C.pageBg,
                  border: `1px solid ${C.border}`,
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.gray400,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Allowed Roles
              </label>
              <Select
                mode="multiple"
                allowClear
                placeholder="Select roles…"
                value={selectedRoles}
                onChange={(vals: string[]) => setSelectedRoles(vals)}
                options={roleOptions}
                filterOption={(input: string, opt: any) =>
                  String(opt?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{
                  width: "100%",
                  background: C.pageBg,
                  border: `1px solid ${C.border}`,
                }}
                maxTagCount="responsive"
              />

              {selectedRoles.length === 0 ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 10px",
                    borderRadius: 99,
                    background: "#FEF2F2",
                    border: "1px solid #FCA5A5",
                    fontSize: 12,
                    color: C.errorRed,
                    fontWeight: 500,
                    alignSelf: "flex-start",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  No roles — report will be inaccessible
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selectedRoles.map((roleId) => {
                    const label =
                      roleOptions.find((o) => o.value === roleId)?.label ??
                      roleId;
                    return (
                      <span
                        key={roleId}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          height: 24,
                          padding: "0 10px",
                          borderRadius: 99,
                          background: "#ECFDF5",
                          border: "1px solid #6EE7B7",
                          fontSize: 12,
                          color: "#065F46",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: C.green,
                            flexShrink: 0,
                          }}
                        />
                        {label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: C.gray100,
                borderRadius: 10,
                padding: "12px 16px",
              }}
            >
              <div>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: C.gray700 }}
                >
                  Active
                </div>
              </div>
              <Switch
                checked={isActive}
                onChange={(val: boolean) => setIsActive(val)}
                style={{ background: isActive ? C.green : C.gray400 }}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReportListView;
