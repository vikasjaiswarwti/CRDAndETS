import React, { useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { useTokens } from "../../../shared/constants/tokens";
import { useDebouncedCallback } from "../../../shared/components/Search/SearchInput";
import { useBookingTable } from "../hooks/useBookingTable";
import {
  useGetBookingsQuery,
  useLazyExportBookingsQuery,
  type Booking,
} from "../services/BookingApi";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

/**
 * Read-only Booking list — GET /Booking (paginated, searchable) rendered in a
 * table, plus an Excel export of all matching bookings via GET /Booking/export.
 */
export const BookingListSection: React.FC = () => {
  const { color, radius, shadow, spacing } = useTokens();
  const {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  } = useBookingTable();

  const { Col, Typography, Pagination, Input, Button } = useUILibrary();
  const { Title } = Typography;
  const { Search } = Input as any;

  const { data, isLoading, error, refetch } = useGetBookingsQuery(queryArgs);
  const dataSource = data?.items ?? [];

  // Search doesn't only fire onSearch on Enter/icon-click — debounce onChange
  // too so the API call fires as the user types (min 3 chars, cleared → reset).
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length >= 3) {
      handleSearch(trimmed);
    }
  }, 500);

  const [triggerExport, { isFetching: isExporting }] =
    useLazyExportBookingsQuery();
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExportError(null);
    try {
      const blob = await triggerExport({ search }).unwrap();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Bookings.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Export failed. Please try again.");
    }
  };

  return (
    <div
      style={{
        padding: `${spacing.lg}px ${spacing.xl}px`,
        minHeight: "100vh",
        background: "#fff",
      }}
    >
      <Col style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            Trip Sheet
          </Title>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {Search && (
              <Search
                placeholder="Search bookings"
                allowClear
                defaultValue={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  debouncedSearch(e.target.value)
                }
                onSearch={handleSearch}
                style={{ width: 260 }}
              />
            )}
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={isExporting}
            >
              Export to Excel
            </Button>
          </div>
        </div>
        {exportError && (
          <div style={{ color: "#DC2626", fontSize: 12, marginBottom: 10 }}>
            {exportError}
          </div>
        )}
      </Col>

      <div
        style={{
          background: color.surface,
          borderRadius: radius.xl,
          border: `1px solid ${color.border}`,
          boxShadow: shadow.card,
          overflow: "hidden",
        }}
      >
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!dataSource.length}
          onRetry={refetch}
          emptyMessage="No bookings found"
        >
          <AppTable<Booking>
            columns={columns as any}
            dataSource={dataSource}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 900 }}
            total={data?.totalCount}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </div>

      {!!data?.totalCount && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: `${spacing.md}px 0`,
          }}
        >
          <Pagination
            current={tableState.page}
            pageSize={tableState.pageSize}
            total={data.totalCount}
            showSizeChanger
            onChange={(page: number, pageSize: number) =>
              setTableState((prev) => ({ ...prev, page, pageSize }))
            }
          />
        </div>
      )}
    </div>
  );
};

export default BookingListSection;
