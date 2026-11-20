import { useMemo } from "react";
import { useUILibrary } from "@commutr/ui/ui-lib";
import { useAppDispatch, useAppSelector } from "../../../app/store";
import { useGetBookingsQuery } from "../services/bookingsApi";
import { resetFilters, selectBookingFilters, setFilters } from "../slice/bookingsUiSlice";
import type { BookingStatus } from "../types";

const STATUSES: (BookingStatus | "All")[] = [
  "All", "Pending", "Confirmed", "In Progress", "Completed", "Cancelled",
];

const STATUS_COLOR: Record<BookingStatus, string> = {
  Pending: "orange",
  Confirmed: "blue",
  "In Progress": "cyan",
  Completed: "green",
  Cancelled: "red",
};

export default function AllBookingsPage() {
  const { Table, Input, Select, Button, Tag, Card } = useUILibrary();
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectBookingFilters); // persisted (crd:bookings.filters)
  const { data = [], isLoading } = useGetBookingsQuery();

  const rows = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return data.filter(
      (b) =>
        (filters.status === "All" || b.status === filters.status) &&
        (!q ||
          [b.id, b.pickup, b.drop].some((v) => v.toLowerCase().includes(q))),
    );
  }, [data, filters]);

  return (
    <div style={{ padding: 16 }}>
      <Card title="All Bookings">
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <Input
            placeholder="Search by ID, pickup or drop"
            value={filters.search}
            onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
            style={{ width: 280 }}
          />
          <Select
            value={filters.status}
            onChange={(v) => dispatch(setFilters({ status: v }))}
            options={STATUSES.map((s) => ({ label: s, value: s }))}
            style={{ width: 180 }}
          />
          <Button onClick={() => dispatch(resetFilters())}>Reset</Button>
        </div>

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={rows}
          pagination={{ pageSize: 5 }}
          columns={[
            { title: "Booking ID", dataIndex: "id", key: "id" },
            { title: "Pickup", dataIndex: "pickup", key: "pickup" },
            { title: "Drop", dataIndex: "drop", key: "drop" },
            { title: "Date", dataIndex: "date", key: "date" },
            { title: "Vehicle", dataIndex: "vehicleClass", key: "vehicleClass" },
            { title: "Pax", dataIndex: "passengers", key: "passengers", align: "center" },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (s: BookingStatus) => <Tag color={STATUS_COLOR[s]}>{s}</Tag>,
            },
          ]}
        />
      </Card>
    </div>
  );
}
