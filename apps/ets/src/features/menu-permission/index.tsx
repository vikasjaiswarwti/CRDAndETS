// import React, { useState, useMemo, useCallback } from "react";
// import {
//     Select,
//     Button,
//     Checkbox,
//     Tag,
//     Alert,
//     Spin,
//     Badge,
//     Divider,
//     message,
// } from "antd";
// import {
//     CheckCircleOutlined,
//     CloseCircleOutlined,
//     LockOutlined,
//     MenuOutlined,
//     SendOutlined,
//     ReloadOutlined,
// } from "@ant-design/icons";
// import {
//     useGetAllPermissionQuery,
//     useGetAllAdminMenusQuery,
//     useAssignMenuPermissionMutation,
// } from "./services/menuPermissionApi";

// const { Option } = Select;

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface PermissionGroup {
//     groupName: string;
//     permissions: { id: number; name: string }[];
// }

// interface SubmitResult {
//     permissionId: number;
//     permissionName: string;
//     success: boolean;
//     error?: string;
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// const MenuPermissionPage = () => {
//     const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
//     const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());
//     const [submitting, setSubmitting] = useState(false);
//     const [submitResults, setSubmitResults] = useState<SubmitResult[] | null>(null);

//     const { data: menuData, isLoading: menusLoading, isError: menusError } = useGetAllAdminMenusQuery();
//     const { data: permissionsData, isLoading: permissionsLoading, isError: permissionsError } = useGetAllPermissionQuery();
//     const [assignPermission] = useAssignMenuPermissionMutation();

//     // Group permissions by prefix: "Bookings.View" → group "Bookings", action "View"
//     const permissionGroups: PermissionGroup[] = useMemo(() => {
//         if (!permissionsData) return [];
//         const map = new Map<string, PermissionGroup>();
//         for (const perm of permissionsData) {
//             const dot = perm.name.indexOf(".");
//             const groupName = dot !== -1 ? perm.name.slice(0, dot) : perm.name;
//             if (!map.has(groupName)) map.set(groupName, { groupName, permissions: [] });
//             map.get(groupName)!.permissions.push(perm);
//         }
//         return Array.from(map.values()).sort((a, b) => a.groupName.localeCompare(b.groupName));
//     }, [permissionsData]);

//     const menus = menuData ?? [];

//     // ─── Toggle handlers ───────────────────────────────────────────────────────

//     const togglePermission = useCallback((id: number) => {
//         setSelectedPermissionIds((prev) => {
//             const next = new Set(prev);
//             next.has(id) ? next.delete(id) : next.add(id);
//             return next;
//         });
//     }, []);

//     const toggleGroup = useCallback(
//         (groupName: string) => {
//             const group = permissionGroups.find((g) => g.groupName === groupName);
//             if (!group) return;
//             const allSelected = group.permissions.every((p) => selectedPermissionIds.has(p.id));
//             setSelectedPermissionIds((prev) => {
//                 const next = new Set(prev);
//                 allSelected
//                     ? group.permissions.forEach((p) => next.delete(p.id))
//                     : group.permissions.forEach((p) => next.add(p.id));
//                 return next;
//             });
//         },
//         [permissionGroups, selectedPermissionIds]
//     );

//     const isGroupFull = (groupName: string) => {
//         const g = permissionGroups.find((g) => g.groupName === groupName);
//         return !!g && g.permissions.length > 0 && g.permissions.every((p) => selectedPermissionIds.has(p.id));
//     };

//     const isGroupPartial = (groupName: string) => {
//         const g = permissionGroups.find((g) => g.groupName === groupName);
//         if (!g) return false;
//         const count = g.permissions.filter((p) => selectedPermissionIds.has(p.id)).length;
//         return count > 0 && count < g.permissions.length;
//     };

//     // ─── Submit ────────────────────────────────────────────────────────────────

//     const handleSubmit = async () => {
//         if (!selectedMenuId || selectedPermissionIds.size === 0) return;
//         setSubmitting(true);
//         setSubmitResults(null);

//         const permMap = new Map((permissionsData ?? []).map((p) => [p.id, p.name]));

//         const settled = await Promise.allSettled(
//             Array.from(selectedPermissionIds).map((permissionId) =>
//                 assignPermission({ menuId: selectedMenuId, permissionId }).unwrap()
//             )
//         );

//         const results: SubmitResult[] = settled.map((res, i) => {
//             const permId = Array.from(selectedPermissionIds)[i];
//             return {
//                 permissionId: permId,
//                 permissionName: permMap.get(permId) ?? String(permId),
//                 success: res.status === "fulfilled",
//                 error: res.status === "rejected" ? String((res.reason as Error)?.message ?? "Failed") : undefined,
//             };
//         });

//         setSubmitResults(results);

//         const failures = results.filter((r) => !r.success).length;
//         const successes = results.filter((r) => r.success).length;

//         if (failures === 0) {
//             message.success(`${successes} permission${successes !== 1 ? "s" : ""} assigned successfully.`);
//             setSelectedMenuId(null);
//             setSelectedPermissionIds(new Set());
//             setSubmitResults(null);
//         } else if (successes === 0) {
//             message.error("All assignments failed.");
//         } else {
//             message.warning(`${successes} assigned, ${failures} failed.`);
//         }

//         setSubmitting(false);
//     };

//     const resetForm = () => {
//         setSelectedMenuId(null);
//         setSelectedPermissionIds(new Set());
//         setSubmitResults(null);
//     };

//     const isValid = !!selectedMenuId && selectedPermissionIds.size > 0;
//     const selectedCount = selectedPermissionIds.size;
//     const allPerms = permissionGroups.flatMap((g) => g.permissions);

//     // ─── Loading / Error guards ────────────────────────────────────────────────

//     if (menusLoading || permissionsLoading) {
//         return (
//             <div style={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
//                 <Spin size="large" tip="Loading..." />
//             </div>
//         );
//     }

//     if (menusError || permissionsError) {
//         return (
//             <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 16px" }}>
//                 <Alert
//                     type="error"
//                     showIcon
//                     message="Failed to load data"
//                     description="Could not fetch menus or permissions. Please refresh the page."
//                     action={
//                         <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
//                             Refresh
//                         </Button>
//                     }
//                 />
//             </div>
//         );
//     }

//     // ─── Render ────────────────────────────────────────────────────────────────

//     return (
//         <div style={s.page}>
//             {/* Header */}
//             <div style={s.header}>
//                 <div style={s.headerIcon}><LockOutlined /></div>
//                 <div>
//                     <h1 style={s.title}>Assign Permissions</h1>
//                     <p style={s.subtitle}>Select a menu and choose which permissions to grant.</p>
//                 </div>
//             </div>

//             <div style={s.layout}>

//                 {/* ── Left Panel ── */}
//                 <div style={s.leftPanel}>

//                     {/* Menu dropdown */}
//                     <div style={s.card}>
//                         <div style={s.fieldLabel}>
//                             <MenuOutlined style={{ color: "#1677ff" }} />
//                             Menu
//                         </div>
//                         <Select
//                             style={{ width: "100%" }}
//                             placeholder="Select a menu"
//                             value={selectedMenuId}
//                             onChange={setSelectedMenuId}
//                             showSearch
//                             optionFilterProp="children"
//                             size="large"
//                         >
//                             {menus.map((menu) => (
//                                 <Option key={menu.id} value={menu.id}>
//                                     {menu.menuName}
//                                 </Option>
//                             ))}
//                         </Select>
//                         {selectedMenuId && (
//                             <div style={{ marginTop: 10 }}>
//                                 <Tag color="blue">
//                                     {menus.find((m) => m.id === selectedMenuId)?.routeUrl}
//                                 </Tag>
//                             </div>
//                         )}
//                     </div>

//                     {/* Selection summary */}
//                     <div style={s.summaryCard}>
//                         <div style={s.summaryRow}>
//                             <span style={s.summaryLabel}>Selected permissions</span>
//                             <Badge
//                                 count={selectedCount}
//                                 showZero
//                                 style={{ backgroundColor: selectedCount > 0 ? "#1677ff" : "#d9d9d9" }}
//                             />
//                         </div>
//                         {selectedCount > 0 && (
//                             <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
//                                 {Array.from(selectedPermissionIds).slice(0, 8).map((id) => {
//                                     const perm = allPerms.find((p) => p.id === id);
//                                     return (
//                                         <Tag key={id} closable onClose={() => togglePermission(id)}
//                                             style={{ fontSize: 11, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                                             {perm?.name ?? id}
//                                         </Tag>
//                                     );
//                                 })}
//                                 {selectedCount > 8 && <Tag style={{ fontSize: 11 }}>+{selectedCount - 8} more</Tag>}
//                             </div>
//                         )}
//                     </div>

//                     {/* Submit */}
//                     <Button
//                         type="primary" size="large" block
//                         icon={<SendOutlined />}
//                         disabled={!isValid || submitting}
//                         loading={submitting}
//                         onClick={handleSubmit}
//                         style={{ borderRadius: 8, height: 44, fontWeight: 600 }}
//                     >
//                         {submitting
//                             ? "Assigning..."
//                             : `Assign ${selectedCount > 0 ? selectedCount : ""} Permission${selectedCount !== 1 ? "s" : ""}`}
//                     </Button>

//                     {isValid && (
//                         <Button type="text" block onClick={resetForm}
//                             style={{ color: "#8c8c8c", fontSize: 13, marginTop: 4 }}>
//                             Clear selection
//                         </Button>
//                     )}

//                     {/* Per-item results */}
//                     {submitResults && submitResults.length > 0 && (
//                         <div style={s.resultsCard}>
//                             <div style={s.resultsTitle}>Assignment Results</div>
//                             {submitResults.map((r) => (
//                                 <div key={r.permissionId}
//                                     style={{ ...s.resultRow, background: r.success ? "#f6ffed" : "#fff2f0" }}>
//                                     {r.success
//                                         ? <CheckCircleOutlined style={{ color: "#52c41a", flexShrink: 0 }} />
//                                         : <CloseCircleOutlined style={{ color: "#ff4d4f", flexShrink: 0 }} />}
//                                     <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{r.permissionName}</span>
//                                     {!r.success && <span style={{ fontSize: 11, color: "#ff4d4f" }}>{r.error}</span>}
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>

//                 {/* ── Right Panel — Permission Groups ── */}
//                 <div style={s.card}>
//                     <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
//                         <div style={s.fieldLabel}>
//                             <LockOutlined style={{ color: "#1677ff" }} />
//                             Permissions
//                         </div>
//                         <span style={s.totalBadge}>
//                             {allPerms.length} total
//                         </span>
//                     </div>

//                     <div style={s.groupsScroll}>
//                         {permissionGroups.map((group, idx) => (
//                             <div key={group.groupName}>
//                                 {idx > 0 && <Divider style={{ margin: "10px 0" }} />}

//                                 {/* Group header checkbox */}
//                                 <div style={s.groupHeader} onClick={() => toggleGroup(group.groupName)}>
//                                     <Checkbox
//                                         checked={isGroupFull(group.groupName)}
//                                         indeterminate={isGroupPartial(group.groupName)}
//                                         onChange={() => toggleGroup(group.groupName)}
//                                         onClick={(e) => e.stopPropagation()}
//                                     >
//                                         <span style={s.groupName}>{group.groupName}</span>
//                                     </Checkbox>
//                                     <Tag style={{ fontSize: 11, background: "#f0f0f0", border: "none", borderRadius: 10 }}>
//                                         {group.permissions.length}
//                                     </Tag>
//                                 </div>

//                                 {/* Individual permissions */}
//                                 <div style={s.permGrid}>
//                                     {group.permissions.map((perm) => {
//                                         const dot = perm.name.indexOf(".");
//                                         const action = dot !== -1 ? perm.name.slice(dot + 1) : perm.name;
//                                         const checked = selectedPermissionIds.has(perm.id);
//                                         return (
//                                             <div key={perm.id}
//                                                 style={{ ...s.permItem, ...(checked ? s.permItemSelected : {}) }}
//                                                 onClick={() => togglePermission(perm.id)}>
//                                                 <Checkbox
//                                                     checked={checked}
//                                                     onChange={() => togglePermission(perm.id)}
//                                                     onClick={(e) => e.stopPropagation()}
//                                                 />
//                                                 <span style={s.actionLabel}>{action}</span>
//                                                 <span style={s.permId}>#{perm.id}</span>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ─── Inline styles (no CSS module dependency) ─────────────────────────────────

// const s: Record<string, React.CSSProperties> = {
//     page: {
//         minHeight: "100vh",
//         padding: "32px 40px",
//         background: "#f5f6fa",
//         fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
//     },
//     header: { display: "flex", alignItems: "center", gap: 16, marginBottom: 32 },
//     headerIcon: {
//         width: 48, height: 48, borderRadius: 12,
//         background: "#1677ff", display: "flex", alignItems: "center",
//         justifyContent: "center", color: "#fff", fontSize: 22, flexShrink: 0,
//     },
//     title: { fontSize: 22, fontWeight: 700, color: "#1a1a2e", margin: "0 0 4px", lineHeight: 1.2 },
//     subtitle: { fontSize: 14, color: "#8c8c8c", margin: 0 },
//     layout: { display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start" },
//     leftPanel: { display: "flex", flexDirection: "column", gap: 16 },
//     card: {
//         background: "#fff", borderRadius: 12, padding: 24,
//         border: "1px solid #eaecf0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
//     },
//     fieldLabel: {
//         display: "flex", alignItems: "center", gap: 8,
//         fontSize: 13, fontWeight: 600, color: "#344054",
//         textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12,
//     },
//     summaryCard: {
//         background: "#f8faff", border: "1px solid #d6e4ff",
//         borderRadius: 10, padding: 16,
//     },
//     summaryRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
//     summaryLabel: { fontSize: 13, fontWeight: 500, color: "#344054" },
//     resultsCard: { border: "1px solid #eaecf0", borderRadius: 10, overflow: "hidden" },
//     resultsTitle: {
//         background: "#fafafa", padding: "10px 14px",
//         fontSize: 12, fontWeight: 600, color: "#344054",
//         textTransform: "uppercase", letterSpacing: "0.5px",
//         borderBottom: "1px solid #eaecf0",
//     },
//     resultRow: {
//         display: "flex", alignItems: "flex-start", gap: 8,
//         padding: "8px 14px", fontSize: 12, borderBottom: "1px solid #f5f5f5",
//     },
//     totalBadge: {
//         fontSize: 12, color: "#8c8c8c",
//         background: "#f5f5f5", padding: "2px 8px", borderRadius: 10,
//     },
//     groupsScroll: { maxHeight: "calc(100vh - 240px)", overflowY: "auto", paddingRight: 4 },
//     groupHeader: {
//         display: "flex", alignItems: "center", justifyContent: "space-between",
//         padding: "6px 8px", borderRadius: 6, background: "#fafafa",
//         marginBottom: 6, cursor: "pointer",
//     },
//     groupName: { fontSize: 13, fontWeight: 600, color: "#1a1a2e" },
//     permGrid: {
//         display: "grid",
//         gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
//         gap: 4, paddingLeft: 24, marginBottom: 4,
//     },
//     permItem: {
//         display: "flex", alignItems: "center", gap: 8,
//         padding: "6px 10px", borderRadius: 6, cursor: "pointer",
//         border: "1px solid transparent", transition: "background 0.15s",
//     },
//     permItemSelected: { background: "#e6f4ff", borderColor: "#91caff" },
//     actionLabel: { fontSize: 13, color: "#344054", fontWeight: 500, flex: 1 },
//     permId: { fontSize: 10, color: "#bfbfbf", fontFamily: "monospace", flexShrink: 0 },
// };

// export default MenuPermissionPage;
import React, { useState, useMemo, useCallback } from "react";
import {
  Select,
  Button,
  Checkbox,
  Tag,
  Alert,
  Spin,
  Badge,
  Divider,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  MenuOutlined,
  SendOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  useGetAllPermissionQuery,
  useGetAllAdminMenusQuery,
  useAssignMenuPermissionMutation,
} from "./services/menuPermissionApi";

const { Option } = Select;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PermissionGroup {
  groupName: string;
  permissions: { id: number; name: string }[];
}

interface SubmitResult {
  permissionId: number;
  permissionName: string;
  success: boolean;
  error?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MenuPermissionPage = () => {
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    Set<number>
  >(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitResults, setSubmitResults] = useState<SubmitResult[] | null>(
    null,
  );

  const {
    data: menuData,
    isLoading: menusLoading,
    isError: menusError,
  } = useGetAllAdminMenusQuery();
  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    isError: permissionsError,
  } = useGetAllPermissionQuery();
  const [assignPermission] = useAssignMenuPermissionMutation();

  // Group permissions by prefix: "Bookings.View" → group "Bookings", action "View"
  const permissionGroups: PermissionGroup[] = useMemo(() => {
    if (!permissionsData) return [];
    const map = new Map<string, PermissionGroup>();
    for (const perm of permissionsData) {
      const dot = perm.name.indexOf(".");
      const groupName = dot !== -1 ? perm.name.slice(0, dot) : perm.name;
      if (!map.has(groupName))
        map.set(groupName, { groupName, permissions: [] });
      map.get(groupName)!.permissions.push(perm);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.groupName.localeCompare(b.groupName),
    );
  }, [permissionsData]);

  const menus = menuData ?? [];

  // ─── Toggle handlers ───────────────────────────────────────────────────────

  const togglePermission = useCallback((id: number) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleGroup = useCallback(
    (groupName: string) => {
      const group = permissionGroups.find((g) => g.groupName === groupName);
      if (!group) return;
      const allSelected = group.permissions.every((p) =>
        selectedPermissionIds.has(p.id),
      );
      setSelectedPermissionIds((prev) => {
        const next = new Set(prev);
        allSelected
          ? group.permissions.forEach((p) => next.delete(p.id))
          : group.permissions.forEach((p) => next.add(p.id));
        return next;
      });
    },
    [permissionGroups, selectedPermissionIds],
  );

  const isGroupFull = (groupName: string) => {
    const g = permissionGroups.find((g) => g.groupName === groupName);
    return (
      !!g &&
      g.permissions.length > 0 &&
      g.permissions.every((p) => selectedPermissionIds.has(p.id))
    );
  };

  const isGroupPartial = (groupName: string) => {
    const g = permissionGroups.find((g) => g.groupName === groupName);
    if (!g) return false;
    const count = g.permissions.filter((p) =>
      selectedPermissionIds.has(p.id),
    ).length;
    return count > 0 && count < g.permissions.length;
  };

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!selectedMenuId || selectedPermissionIds.size === 0) return;
    setSubmitting(true);
    setSubmitResults(null);

    const permMap = new Map((permissionsData ?? []).map((p) => [p.id, p.name]));

    const settled = await Promise.allSettled(
      Array.from(selectedPermissionIds).map((permissionId) =>
        assignPermission({ menuId: selectedMenuId, permissionId }).unwrap(),
      ),
    );

    const results: SubmitResult[] = settled.map((res, i) => {
      const permId = Array.from(selectedPermissionIds)[i];
      return {
        permissionId: permId,
        permissionName: permMap.get(permId) ?? String(permId),
        success: res.status === "fulfilled",
        error:
          res.status === "rejected"
            ? String((res.reason as Error)?.message ?? "Failed")
            : undefined,
      };
    });

    setSubmitResults(results);

    const failures = results.filter((r) => !r.success).length;
    const successes = results.filter((r) => r.success).length;

    if (failures === 0) {
      message.success(
        `${successes} permission${successes !== 1 ? "s" : ""} assigned successfully.`,
      );
      setSelectedMenuId(null);
      setSelectedPermissionIds(new Set());
      setSubmitResults(null);
    } else if (successes === 0) {
      message.error("All assignments failed.");
    } else {
      message.warning(`${successes} assigned, ${failures} failed.`);
    }

    setSubmitting(false);
  };

  const resetForm = () => {
    setSelectedMenuId(null);
    setSelectedPermissionIds(new Set());
    setSubmitResults(null);
  };

  const isValid = !!selectedMenuId && selectedPermissionIds.size > 0;
  const selectedCount = selectedPermissionIds.size;
  const allPerms = permissionGroups.flatMap((g) => g.permissions);

  // ─── Loading / Error guards ────────────────────────────────────────────────

  if (menusLoading || permissionsLoading) {
    return (
      <div
        style={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  if (menusError || permissionsError) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 16px" }}>
        <Alert
          type="error"
          showIcon
          message="Failed to load data"
          description="Could not fetch menus or permissions. Please refresh the page."
          action={
            <Button
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          }
        />
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerIcon}>
          <LockOutlined />
        </div>
        <div>
          <h1 style={s.title}>Assign Permissions</h1>
          <p style={s.subtitle}>
            Select a menu and choose which permissions to grant.
          </p>
        </div>
      </div>

      <div style={s.layout}>
        {/* ── Left Panel ── */}
        <div style={s.leftPanel}>
          {/* Menu dropdown */}
          <div style={s.card}>
            <div style={s.fieldLabel}>
              <MenuOutlined style={{ color: "#1677ff" }} />
              Menu
            </div>
            <Select
              style={{ width: "100%" }}
              placeholder="Select a menu"
              value={selectedMenuId}
              onChange={setSelectedMenuId}
              showSearch
              optionFilterProp="children"
              size="large"
            >
              {menus.map((menu) => (
                <Option key={menu.id} value={menu.id}>
                  {menu.menuName}
                </Option>
              ))}
            </Select>
            {selectedMenuId && (
              <div style={{ marginTop: 10 }}>
                <Tag color="blue">
                  {menus.find((m) => m.id === selectedMenuId)?.routeUrl}
                </Tag>
              </div>
            )}
          </div>

          {/* Selection summary */}
          <div style={s.summaryCard}>
            <div style={s.summaryRow}>
              <span style={s.summaryLabel}>Selected permissions</span>
              <Badge
                count={selectedCount}
                showZero
                style={{
                  backgroundColor: selectedCount > 0 ? "#1677ff" : "#d9d9d9",
                }}
              />
            </div>
            {selectedCount > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 8,
                }}
              >
                {Array.from(selectedPermissionIds)
                  .slice(0, 8)
                  .map((id) => {
                    const perm = allPerms.find((p) => p.id === id);
                    return (
                      <Tag
                        key={id}
                        closable
                        onClose={() => togglePermission(id)}
                        style={{
                          fontSize: 11,
                          maxWidth: 160,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {perm?.name ?? id}
                      </Tag>
                    );
                  })}
                {selectedCount > 8 && (
                  <Tag style={{ fontSize: 11 }}>+{selectedCount - 8} more</Tag>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="primary"
            size="large"
            block
            icon={<SendOutlined />}
            disabled={!isValid || submitting}
            loading={submitting}
            onClick={handleSubmit}
            style={{ borderRadius: 8, height: 44, fontWeight: 600 }}
          >
            {submitting
              ? "Assigning..."
              : `Assign ${selectedCount > 0 ? selectedCount : ""} Permission${selectedCount !== 1 ? "s" : ""}`}
          </Button>

          {isValid && (
            <Button
              type="text"
              block
              onClick={resetForm}
              style={{ color: "#8c8c8c", fontSize: 13, marginTop: 4 }}
            >
              Clear selection
            </Button>
          )}

          {/* Per-item results */}
          {submitResults && submitResults.length > 0 && (
            <div style={s.resultsCard}>
              <div style={s.resultsTitle}>Assignment Results</div>
              {submitResults.map((r) => (
                <div
                  key={r.permissionId}
                  style={{
                    ...s.resultRow,
                    background: r.success ? "#f6ffed" : "#fff2f0",
                  }}
                >
                  {r.success ? (
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", flexShrink: 0 }}
                    />
                  ) : (
                    <CloseCircleOutlined
                      style={{ color: "#ff4d4f", flexShrink: 0 }}
                    />
                  )}
                  <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>
                    {r.permissionName}
                  </span>
                  {!r.success && (
                    <span style={{ fontSize: 11, color: "#ff4d4f" }}>
                      {r.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Panel — Permission Groups ── */}
        <div style={s.card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div style={s.fieldLabel}>
              <LockOutlined style={{ color: "#1677ff" }} />
              Permissions
            </div>
            <span style={s.totalBadge}>{allPerms.length} total</span>
          </div>

          <div style={s.groupsScroll}>
            {permissionGroups.map((group, idx) => (
              <div key={group.groupName}>
                {idx > 0 && <Divider style={{ margin: "10px 0" }} />}

                {/* Group header checkbox */}
                <div
                  style={s.groupHeader}
                  onClick={() => toggleGroup(group.groupName)}
                >
                  <Checkbox
                    checked={isGroupFull(group.groupName)}
                    indeterminate={isGroupPartial(group.groupName)}
                    onChange={() => toggleGroup(group.groupName)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span style={s.groupName}>{group.groupName}</span>
                  </Checkbox>
                  <Tag
                    style={{
                      fontSize: 11,
                      background: "#f0f0f0",
                      border: "none",
                      borderRadius: 10,
                    }}
                  >
                    {group.permissions.length}
                  </Tag>
                </div>

                {/* Individual permissions */}
                <div style={s.permGrid}>
                  {group.permissions.map((perm) => {
                    const dot = perm.name.indexOf(".");
                    const action =
                      dot !== -1 ? perm.name.slice(dot + 1) : perm.name;
                    const checked = selectedPermissionIds.has(perm.id);
                    return (
                      <div
                        key={perm.id}
                        style={{
                          ...s.permItem,
                          ...(checked ? s.permItemSelected : {}),
                        }}
                        onClick={() => togglePermission(perm.id)}
                      >
                        <Checkbox
                          checked={checked}
                          onChange={() => togglePermission(perm.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span style={s.actionLabel}>{action}</span>
                        <span style={s.permId}>#{perm.id}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Inline styles (no CSS module dependency) ─────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "32px 40px",
    background: "#f5f6fa",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: { display: "flex", alignItems: "center", gap: 16, marginBottom: 32 },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "#1677ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 22,
    flexShrink: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1a1a2e",
    margin: "0 0 4px",
    lineHeight: 1.2,
  },
  subtitle: { fontSize: 14, color: "#8c8c8c", margin: 0 },
  layout: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: 24,
    alignItems: "start",
  },
  leftPanel: { display: "flex", flexDirection: "column", gap: 16 },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    border: "1px solid #eaecf0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  fieldLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: "#344054",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    marginBottom: 12,
  },
  summaryCard: {
    background: "#f8faff",
    border: "1px solid #d6e4ff",
    borderRadius: 10,
    padding: 16,
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: { fontSize: 13, fontWeight: 500, color: "#344054" },
  resultsCard: {
    border: "1px solid #eaecf0",
    borderRadius: 10,
    overflow: "hidden",
  },
  resultsTitle: {
    background: "#fafafa",
    padding: "10px 14px",
    fontSize: 12,
    fontWeight: 600,
    color: "#344054",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #eaecf0",
  },
  resultRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "8px 14px",
    fontSize: 12,
    borderBottom: "1px solid #f5f5f5",
  },
  totalBadge: {
    fontSize: 12,
    color: "#8c8c8c",
    background: "#f5f5f5",
    padding: "2px 8px",
    borderRadius: 10,
  },
  groupsScroll: {
    maxHeight: "calc(100vh - 240px)",
    overflowY: "auto",
    paddingRight: 4,
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 8px",
    borderRadius: 6,
    background: "#fafafa",
    marginBottom: 6,
    cursor: "pointer",
  },
  groupName: { fontSize: 13, fontWeight: 600, color: "#1a1a2e" },
  permGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 4,
    paddingLeft: 24,
    marginBottom: 4,
  },
  permItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "background 0.15s",
  },
  permItemSelected: { background: "#e6f4ff", borderColor: "#91caff" },
  actionLabel: { fontSize: 13, color: "#344054", fontWeight: 500, flex: 1 },
  permId: {
    fontSize: 10,
    color: "#bfbfbf",
    fontFamily: "monospace",
    flexShrink: 0,
  },
};

export default MenuPermissionPage;
