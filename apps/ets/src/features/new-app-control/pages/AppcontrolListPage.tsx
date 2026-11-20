import React, { useEffect, useMemo, useState } from "react";
import { Select, Spin } from "antd";
import {
  useGetAppControlByLocCodeQuery,
  useGetApplicationConfigurationQuery,
} from "../services/Appcontrolapi";
import {
  useGetDriverAppConfigByLocCodeQuery,
  useGetUserAppConfigurationByLocCodeQuery,
} from "../services/userAppConfigurationApi";
import { useLookups } from "../../lookups";
import { ContentContainer } from "../../../shared/components/ContentContainer/ContentContainer";
import { OfficeConfigurationCard } from "../components/Officeconfigurationcard";
import UserAppConfigurationCard from "../components/UserApp/UserAppConfigurationCard";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { DriverConfigurationCard } from "../components/DriverApp/DriverConfigurationCard";
// import { DriverEventConfigurationCard } from "../components/DriverApp/DriverEventConfigurationCard";
import { DriverAppEventSettingsSection } from "../components/DriverApp/DriverAppEventSettingsSection";

type ConfigTabKey = "tat" | "userApp" | "driverApp";

const TAB_OPTIONS: { key: ConfigTabKey; label: string }[] = [
  { key: "tat", label: "TAT Configuration" },
  { key: "userApp", label: "User App Configuration" },
  { key: "driverApp", label: "Driver Configuration" },
];

const AppControlListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConfigTabKey>("tat");
  const [activeLocCode, setActiveLocCode] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const { locationOptions, isLoading: loadingLookup } = useLookups({
    only: ["locationOptions"],
  });

  // Auto-select first office every time this page is mounted
  useEffect(() => {
    if (!loadingLookup && locationOptions.length > 0) {
      setActiveLocCode(Number(locationOptions[0].value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingLookup]);

  const { data: detailData, isFetching: loadingDetail } =
    useGetAppControlByLocCodeQuery(
      { LocCode: activeLocCode! },
      {
        skip: activeLocCode === null || activeTab !== "tat",
        refetchOnMountOrArgChange: true,
      },
    );

  const { data: applicationConfiguration, isFetching: loadingApplication } =
    useGetApplicationConfigurationQuery(
      { LocCode: activeLocCode! },
      {
        skip: activeLocCode === null || activeTab !== "tat",
        refetchOnMountOrArgChange: true,
      },
    );

  const { data: userAppDetailData, isFetching: loadingUserApp } =
    useGetUserAppConfigurationByLocCodeQuery(
      { LocCode: activeLocCode! },
      {
        skip: activeLocCode === null || activeTab !== "userApp",
        refetchOnMountOrArgChange: true,
      },
    );
  const { data: driverConfigData, isFetching: loadingDriverApp } =
    useGetDriverAppConfigByLocCodeQuery(
      { LocCode: activeLocCode! },
      {
        skip: activeLocCode === null || activeTab !== "driverApp",
        refetchOnMountOrArgChange: true,
      },
    );

  const antdOptions = useMemo(
    () =>
      locationOptions.map((o) => ({
        value: Number(o.value),
        label: String(o.label),
      })),
    [locationOptions],
  );

  const handleTabChange = (key: ConfigTabKey) => setActiveTab(key);

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <ContentContainer>
        <div
          style={{
            borderBottom: "1px solid #F3F4F6",
            marginBottom: 24,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "flex-start",
            justifyContent: "space-between",
            gap: isMobile ? 16 : 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.3,
              }}
            >
              App Control Configuration
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", marginTop: 3 }}>
              Select an office to configure application settings.
            </div>

            <div style={{ marginTop: 18, maxWidth: 380 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                Office
              </div>
              {loadingLookup ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    height: 38,
                  }}
                >
                  <Spin size="small" />
                  <span style={{ fontSize: 13, color: "#9CA3AF" }}>
                    Loading offices…
                  </span>
                </div>
              ) : (
                <Select
                  showSearch
                  allowClear
                  value={activeLocCode}
                  onChange={(v: number | undefined) =>
                    setActiveLocCode(v !== undefined ? v : null)
                  }
                  options={antdOptions}
                  placeholder="Search and select an office…"
                  style={{ width: "100%", height: 38 }}
                  filterOption={(input, option) =>
                    String(option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  notFoundContent={
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                      No offices found
                    </span>
                  }
                />
              )}
            </div>
          </div>

          {/* Segmented tab toggle */}
          <div
            style={{
              display: "flex",
              background: "#f3f4f6",
              borderRadius: 16,
              padding: 5,
              gap: 2,
              width: isMobile ? "100%" : "auto",
              marginTop: isMobile ? 0 : 18,
            }}
          >
            {TAB_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleTabChange(opt.key)}
                style={{
                  flex: isMobile ? 1 : undefined,
                  padding: "4px 14px",
                  borderRadius: 16,
                  border: "none",
                  background: activeTab === opt.key ? "#3E9B73" : "transparent",
                  color: activeTab === opt.key ? "#fff" : "#6b7280",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: activeTab === opt.key ? 600 : 400,
                  boxShadow:
                    activeTab === opt.key
                      ? "0 1px 3px rgba(0,0,0,0.1)"
                      : "none",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "tat" && (
          <OfficeConfigurationCard
            detailData={detailData ?? null}
            applicationConfiguration={applicationConfiguration ?? null}
            locCode={activeLocCode}
            officeOptions={locationOptions}
            isLoading={
              (loadingDetail || loadingApplication) && activeLocCode !== null
            }
          />
        )}

        {activeTab === "userApp" && (
          <UserAppConfigurationCard
            detailData={userAppDetailData ?? null}
            locCode={activeLocCode}
            isLoading={loadingUserApp && activeLocCode !== null}
          />
        )}
        {activeTab === "driverApp" && (
          <>
            <DriverConfigurationCard
              detailData={driverConfigData ?? null}
              locCode={activeLocCode}
              isLoading={loadingDriverApp}
            />
            <DriverAppEventSettingsSection />
          </>
        )}
      </ContentContainer>
    </div>
  );
};

export default AppControlListPage;
