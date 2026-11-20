import { Link } from "react-router-dom";
import { useUILibrary } from "@commutr/ui/ui-lib";
import { useGetBookingsQuery } from "../../bookings/services/bookingsApi";
import { ROUTES } from "../../../shared/constants/app.constants";

export default function DashboardPage() {
  const { Card } = useUILibrary();
  const { data = [], isLoading } = useGetBookingsQuery();

  const count = (s: string) => data.filter((b) => b.status === s).length;
  const stats = [
    { label: "Total bookings", value: data.length },
    { label: "Pending", value: count("Pending") },
    { label: "Confirmed", value: count("Confirmed") },
    { label: "In progress", value: count("In Progress") },
  ];

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ margin: "0 0 4px" }}>Welcome to Commutr CRD</h1>
      <p style={{ color: "var(--color-text-muted)", marginTop: 0 }}>
        Corporate Car Rental — overview (static data)
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
        {stats.map((s) => (
          <Card key={s.label} loading={isLoading}>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <Link to={ROUTES.CREATE_BOOKING}>Create a booking →</Link>
        <Link to={ROUTES.BOOKINGS}>View all bookings →</Link>
      </div>
    </div>
  );
}
