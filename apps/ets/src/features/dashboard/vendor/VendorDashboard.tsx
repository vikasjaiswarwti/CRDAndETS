// const StatCard = ({
//   label, value, sub,
// }: { label: string; value: string | number; sub?: string }) => (
//   <div style={{ background: '#F0FAF4', border: '1px solid #B7E4C7', borderRadius: 8, padding: '14px 16px' }}>
//     <p style={{ fontSize: 12, color: '#52796F', margin: '0 0 4px' }}>{label}</p>
//     <p style={{ fontSize: 22, fontWeight: 500, color: '#1B4332', margin: 0 }}>{value}</p>
//     {sub && <p style={{ fontSize: 12, color: '#52796F', margin: '4px 0 0' }}>{sub}</p>}
//   </div>
// );

// const VendorDashboard = () => {
//   const today = new Date().toLocaleDateString('en-IN', {
//     weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
//   });

//   const activity = [
//     { text: 'MH-12-AB-4521 completed trip', time: '10m ago', warn: false },
//     { text: 'Doc expiry alert — MH-14-XY-2200', time: '2h ago', warn: true },
//     { text: 'New escort assigned — Route 7', time: '4h ago', warn: false },
//   ];

//   return (
//     <div style={{ padding: '24px 28px', maxWidth: 960 }}>

//       {/* Header */}
//       <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
//         <div>
//           <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B4332', margin: '0 0 4px' }}>Fleet overview</h1>
//           <p style={{ fontSize: 13, color: '#52796F', margin: 0 }}>{today}</p>
//         </div>
//         <span style={{ background: '#E6F1FB', color: '#0C447C', fontSize: 12, fontWeight: 500, padding: '3px 12px', borderRadius: 99 }}>
//           vendor
//         </span>
//       </div>

//       {/* Stats */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
//         <StatCard label="Active vehicles" value={24} />
//         <StatCard label="Open trips" value={8} />
//         <StatCard label="Pending docs" value={3} />
//       </div>
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
//         <StatCard label="On-time rate" value="94%" />
//         <StatCard label="Avg trip time" value="42m" />
//       </div>

//       {/* Fleet utilisation */}
//       <div style={{ background: '#fff', border: '0.5px solid #B7E4C7', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
//         <p style={{ fontSize: 13, fontWeight: 600, color: '#1B4332', margin: '0 0 12px' }}>Fleet utilisation</p>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
//           <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>Vehicle utilisation</span>
//           <span style={{ fontSize: 13, fontWeight: 500, color: '#1B4332' }}>78%</span>
//         </div>
//         <div style={{ height: 6, background: '#F0FAF4', borderRadius: 3, marginBottom: 10 }}>
//           <div style={{ width: '78%', height: '100%', background: '#1B4332', borderRadius: 3 }} />
//         </div>
//         <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
//           {[
//             { label: '18 active', bg: '#E1F5EE', color: '#085041' },
//             { label: '3 maintenance', bg: '#FAEEDA', color: '#633806' },
//             { label: '3 idle', bg: '#E6F1FB', color: '#0C447C' },
//           ].map((c) => (
//             <span key={c.label} style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: 99, fontSize: 12 }}>
//               {c.label}
//             </span>
//           ))}
//         </div>
//       </div>

//       {/* Recent activity */}
//       <div style={{ background: '#fff', border: '0.5px solid #B7E4C7', borderRadius: 12, padding: '18px 20px' }}>
//         <p style={{ fontSize: 13, fontWeight: 600, color: '#1B4332', margin: '0 0 12px' }}>Recent activity</p>
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//           {activity.map((a) => (
//             <div key={a.text} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
//               <span style={{ color: 'var(--color-text-primary)' }}>{a.text}</span>
//               <span style={{ color: a.warn ? '#854F0B' : 'var(--color-text-secondary)', flexShrink: 0, marginLeft: 12 }}>{a.time}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VendorDashboard;



// src/features/dashboard/pages/VendorDashboard.tsx
import React, { useState } from "react";

import DashboardImage from "../../../assets/Dashboard card.png"

export const VendorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"admin" | "user">("admin");

  return (


    <>
      <img src={DashboardImage} alt="dashboard image" />
      <div style={s.page}>
        {/* Green Banner */}


        {/* Decorative background circles */}
        {/* <div style={s.bannerBg}></div>
                <div style={s.bannerBg2}></div>

                <div style={s.bannerLeft}>
              
                    <div>
                        <div style={s.bannerSub}>Fleet Network Status</div>
                        <div style={s.bannerTitle}>Total Fleet: 1,248 Active Vehicles</div>
                    </div>
                </div>
                <button style={s.viewDirBtn}>View All Vehicles</button> */}




        {/* Page Title */}
        <div style={s.titleRow}>
          <h1 style={s.pageTitle}>Dashboard</h1>
        </div>

        {/* Filters Row */}
        <div style={s.filtersRow}>
          <FilterChip label="Office" value="All Locations ▾" />
          <FilterChip label="Period" value="Current Quarter ▾" />
          <FilterChip label="Date Range" value="Oct 12 – Nov 12 ▾" hasCalendar />
          <button style={s.exportBtn}>
            <UploadIcon /> Export
          </button>
        </div>

        {/* Tabs + Add Widget */}
        <div style={s.tabsRow}>
          <div style={s.tabs}>
            <button
              style={{ ...s.tab, ...(activeTab === "admin" ? s.tabActive : {}) }}
              onClick={() => setActiveTab("admin")}
            >
              Admin Panel
            </button>
            <button
              style={{ ...s.tab, ...(activeTab === "user" ? s.tabActive : {}) }}
              onClick={() => setActiveTab("user")}
            >
              User Dashboard
            </button>
          </div>
          <button style={s.addWidgetBtn}>+ Add widget</button>
        </div>

        {/* Fleet Grid - 4 Cards */}
        <div style={s.fleetGrid}>
          <FleetCard title="AVAILABLE" count={342} badge="Live" badgeClass="avail" delta="↑ 12 since yesterday" deltaUp />
          <FleetCard title="ON TRIP" count={718} badge="Active" badgeClass="busy" delta="↑ 43 vs last week" deltaUp />
          <FleetCard title="MAINTENANCE" count={81} badge="Alert" badgeClass="maint" delta="↑ 6 new today" deltaDown />
          <FleetCard title="NO SHOW" count={107} badge="Pending" badgeClass="pending" delta="↓ 8 vs last week" deltaDown />
        </div>

        {/* Stat Grid - 4 Cards */}
        <div style={s.statGrid}>
          <StatCard title="USERS" registered={2884} joiners={1234} attritions={873} barWidths={[82, 44, 30]} />
          <StatCard title="NO SHOW" registered={2884} joiners={2884} attritions={2884} barWidths={[75, 60, 40]} />
          <StatCard title="TRIP" registered={2884} joiners={2884} attritions={2884} barWidths={[90, 55, 35]} />
          <StatCard title="OTHER" registered={2884} joiners={2884} attritions={2884} barWidths={[70, 50, 25]} />
        </div>

        {/* Mid Grid: Customer Segments + Activity by Day */}
        <div style={s.midGrid}>
          <div style={s.card}>
            <div style={s.cardTitleRow}>
              <div>
                <div style={s.cardTitle}>Customer Segments</div>
                <div style={s.cardSub}>Breakdown by type · 4,878 total</div>
              </div>
              <span style={s.moreIcon}>⋯</span>
            </div>
            <div style={s.donutWrap}>
              <DonutChart />
              <div style={s.donutLegend}>
                <SegmentLegend label="Retailers" value={2884} total={4878} color="#005c3d" />
                <SegmentLegend label="Distributors" value={1432} total={4878} color="#6daf90" />
                <SegmentLegend label="Wholesalers" value={562} total={4878} color="#97c8b0" />
              </div>
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitleRow}>
              <div style={s.cardTitle}>Activity by Day</div>
              <span style={s.moreIcon}>⋯</span>
            </div>
            <div style={s.activityDots}>
              {[
                { day: "Mon", height: 28, active: false },
                { day: "Tue", height: 56, active: true },
                { day: "Wed", height: 38, active: false },
                { day: "Thu", height: 44, active: false },
                { day: "Fri", height: 32, active: false },
                { day: "Sat", height: 18, active: false },
                { day: "Sun", height: 14, active: false },
              ].map((item) => (
                <div key={item.day} style={s.dayCol}>
                  <div
                    style={{
                      ...s.dayBar,
                      height: item.height,
                      background: item.active ? "#005c3d" : "#e5f3ed",
                    }}
                  />
                  <div style={{ ...s.dayLabel, ...(item.active ? s.dayLabelActive : {}) }}>
                    {item.day}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Grid: Revenue + Repeat Rate + AI */}
        <div style={s.bottomGrid}>
          <div style={s.profitCard}>
            <div style={s.profitHeader}>
              <div>
                <div style={s.profitLabel}>Total Revenue</div>
                <div style={s.profitValue}>₹4,46,700</div>
                <div style={s.profitDelta}>+24.4% vs last month</div>
              </div>
              <div style={s.legendToggle}>
                <div style={s.legToggle}>
                  <div style={{ ...s.legDot, background: "#005c3d" }} />
                  <span>This Month</span>
                </div>
                <div style={s.legToggle}>
                  <div style={{ ...s.legDot, background: "#e0e0e0" }} />
                  <span>Last Month</span>
                </div>
              </div>
            </div>
            <div style={s.sparkline}>
              <SparklineChart />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={s.repeatCard}>
              <div style={s.cardTitle}>Repeat Rate</div>
              <div style={s.ringWrap}>
                <RepeatRateDonut percentage={68} />
                <div style={s.repeatInsight}>
                  <div style={s.repeatSub}>vs average (54%)</div>
                  <div>
                    Your customer loyalty is{" "}
                    <span style={s.insightHighlight}>14% higher</span> than the industry benchmark.
                  </div>
                </div>
              </div>
            </div>
            <div style={s.aiCard}>
              <div style={s.aiHeader}>
                <div style={s.aiOrb}>
                  <SparkleIcon />
                </div>
                <span style={s.aiTitle}>AI Assistant</span>
              </div>
              <div style={s.aiMsg}>
                "Sedan bookings are up 32% this week. Should I increase the fleet allocation by 20%?"
              </div>
              <div style={s.aiInputRow}>
                <input style={s.aiInput} placeholder="Ask me anything..." type="text" />
                <button style={s.aiSend}>
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Best Performing Vehicles Table */}
        <div style={s.tableCard}>
          <div style={s.tableHeader}>
            <span style={s.tableTitle}>Best Performing Vehicles</span>
            <span style={s.viewAll}>View all catalog →</span>
          </div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>ID</th>
                <th style={s.th}>Vehicle Name</th>
                <th style={s.th}>Trips</th>
                <th style={s.th}>Revenue</th>
                <th style={s.th}>Rating</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {VEHICLES.map((v, i) => (
                <tr key={i} style={s.tr}>
                  <td style={{ ...s.td, color: "#9CA3AF", fontSize: 12 }}>{v.id}</td>
                  <td style={s.td}>
                    <div style={s.prodCell}>
                      <div style={s.prodThumb}>
                        <CarIcon />
                      </div>
                      <span style={s.prodName}>{v.name}</span>
                    </div>
                  </td>
                  <td style={{ ...s.td, fontWeight: 500 }}>{v.trips.toLocaleString()}</td>
                  <td style={{ ...s.td, fontWeight: 600, color: "#005c3d" }}>₹{v.revenue.toLocaleString()}</td>
                  <td style={s.td}>
                    <span style={s.rating}>★ {v.rating}</span>
                  </td>
                  <td style={s.td}>
                    <div style={s.actionBtn}>
                      <ActionIcon />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>

  );
};

/* ========== Sub-Components ========== */

const FilterChip: React.FC<{ label: string; value: string; hasCalendar?: boolean }> = ({ label, value, hasCalendar }) => (
  <div style={s.filterChip}>
    <label style={s.filterLabel}>{label}</label>
    <span style={s.filterValue}>
      {value}
      {hasCalendar && <span style={{ marginLeft: 4 }}>📅</span>}
      <ChevronDownIcon />
    </span>
  </div>
);

const FleetCard: React.FC<{
  title: string;
  count: number;
  badge: string;
  badgeClass: string;
  delta: string;
  deltaUp?: boolean;
  deltaDown?: boolean;
}> = ({ title, count, badge, badgeClass, delta, deltaUp, deltaDown }) => {
  const badgeStyles = {
    ...s.fleetBadge,
    ...(badgeClass === "avail" ? s.fleetBadgeAvail : {}),
    ...(badgeClass === "busy" ? s.fleetBadgeBusy : {}),
    ...(badgeClass === "maint" ? s.fleetBadgeMaint : {}),
    ...(badgeClass === "pending" ? s.fleetBadgePending : {}),
  };
  return (
    <div style={s.fleetCard}>
      <div style={s.fleetTop}>
        <span style={s.fleetTitle}>{title}</span>
        <span style={badgeStyles}>{badge}</span>
      </div>
      <div style={s.fleetNum}>{count.toLocaleString()}</div>
      <div style={s.fleetLabel}>
        {title === "AVAILABLE" && "Vehicles ready to rent"}
        {title === "ON TRIP" && "Currently rented out"}
        {title === "MAINTENANCE" && "In service / repair"}
        {title === "NO SHOW" && "Booking no-shows"}
      </div>
      <div style={{ ...s.fleetDelta, ...(deltaUp ? s.fleetDeltaUp : {}), ...(deltaDown ? s.fleetDeltaDown : {}) }}>
        {delta}
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  registered: number;
  joiners: number;
  attritions: number;
  barWidths: number[];
}> = ({ title, registered, joiners, attritions, barWidths }) => (
  <div style={s.statCard}>
    <div style={s.statCardTitle}>{title}</div>
    <div>
      <div style={s.statRow}>
        <span style={s.statRowLabel}>Registered users</span>
        <span style={s.statRowVal}>{registered.toLocaleString()}</span>
      </div>
      <div style={s.statBar}>
        <div style={{ ...s.statBarFill, width: `${barWidths[0]}%`, background: "#005c3d" }} />
      </div>
      <div style={s.statRow}>
        <span style={s.statRowLabel}>New joiners</span>
        <span style={s.statRowVal}>{joiners.toLocaleString()}</span>
      </div>
      <div style={s.statBar}>
        <div style={{ ...s.statBarFill, width: `${barWidths[1]}%`, background: "#3e9b73" }} />
      </div>
      <div style={s.statRow}>
        <span style={s.statRowLabel}>Attritions</span>
        <span style={s.statRowVal}>{attritions.toLocaleString()}</span>
      </div>
      <div style={s.statBar}>
        <div style={{ ...s.statBarFill, width: `${barWidths[2]}%`, background: "#97c8b0" }} />
      </div>
    </div>
  </div>
);

const SegmentLegend: React.FC<{ label: string; value: number; total: number; color: string }> = ({ label, value, total, color }) => {
  const percent = (value / total) * 100;
  return (
    <div>
      <div style={s.legendRow}>
        <div style={{ ...s.legendDot, background: color }} />
        <span style={s.legendLabel}>{label}</span>
        <span style={s.legendVal}>{value.toLocaleString()}</span>
      </div>
      <div style={s.legendBarWrap}>
        <div style={{ ...s.legendBar, width: `${percent}%`, background: color }} />
      </div>
    </div>
  );
};

const DonutChart: React.FC = () => (
  <svg width="90" height="90" viewBox="0 0 90 90">
    <circle cx="45" cy="45" r="34" fill="none" stroke="#f0f0f0" strokeWidth="12" />
    <circle cx="45" cy="45" r="34" fill="none" stroke="#005c3d" strokeWidth="12" strokeDasharray="134 79" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 45 45)" />
    <circle cx="45" cy="45" r="34" fill="none" stroke="#6daf90" strokeWidth="12" strokeDasharray="57 156" strokeDashoffset="-134" strokeLinecap="round" transform="rotate(-90 45 45)" />
    <circle cx="45" cy="45" r="34" fill="none" stroke="#97c8b0" strokeWidth="12" strokeDasharray="22 191" strokeDashoffset="-191" strokeLinecap="round" transform="rotate(-90 45 45)" />
    <text x="45" y="49" textAnchor="middle" fontSize="13" fontWeight="700" fill="#111827">4,878</text>
  </svg>
);

const RepeatRateDonut: React.FC<{ percentage: number }> = ({ percentage }) => {
  const circumference = 2 * Math.PI * 26;
  const dasharray = (percentage / 100) * circumference;
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <svg width="70" height="70" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r="26" fill="none" stroke="#f0f0f0" strokeWidth="9" />
        <circle
          cx="35"
          cy="35"
          r="26"
          fill="none"
          stroke="#005c3d"
          strokeWidth="9"
          strokeDasharray={`${dasharray} ${circumference - dasharray}`}
          strokeDashoffset="0"
          strokeLinecap="round"
          transform="rotate(-90 35 35)"
        />
        <text x="35" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">
          {percentage}%
        </text>
      </svg>
    </div>
  );
};

const SparklineChart: React.FC = () => (
  <svg width="100%" height="80" viewBox="0 0 420 80" preserveAspectRatio="none">
    <path d="M0,70 C40,68 60,60 90,52 C120,44 140,30 180,28 C220,26 240,20 270,18 C300,16 340,12 380,10 L420,8 L420,80 L0,80 Z" fill="#e5f3ed" />
    <path d="M0,70 C40,68 60,60 90,52 C120,44 140,30 180,28 C220,26 240,20 270,18 C300,16 340,12 380,10 L420,8" fill="none" stroke="#005c3d" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M0,72 C40,71 80,68 120,65 C160,62 200,58 240,55 C280,52 320,50 380,48 L420,47" fill="none" stroke="#e0e0e0" strokeWidth="1.5" strokeDasharray="5,4" strokeLinecap="round" />
    <circle cx="270" cy="18" r="4" fill="#005c3d" />
    <rect x="220" y="0" width="90" height="32" rx="6" fill="#111827" />
    <text x="265" y="11" textAnchor="middle" fontSize="9" fontWeight="600" fill="#fff">Jan 24</text>
    <text x="265" y="22" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">₹12.4K</text>
  </svg>
);


const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#005c3d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const SendIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ActionIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

/* Vehicle Data */
const VEHICLES = [
  { id: "#VH-9821", name: "Toyota Innova Crysta", trips: 1842, revenue: 165320, rating: 4.8 },
  { id: "#VH-2245", name: "Maruti Suzuki Ertiga", trips: 1204, revenue: 84280, rating: 4.9 },
  { id: "#VH-7712", name: "Hyundai Creta", trips: 982, revenue: 122750, rating: 4.7 },
  { id: "#VH-1109", name: "Kia Seltos AWD", trips: 845, revenue: 54925, rating: 4.8 },
  { id: "#VH-4322", name: "Honda City ZX", trips: 654, revenue: 29430, rating: 4.6 },
];

/* ========== Styles ========== */
const s: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    fontFamily: "Inter, system-ui, sans-serif",
    paddingBottom: 24
  },

  banner: {
    background: "#005c3d",
    borderRadius: 14,
    padding: "18px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden"
  },
  bannerBg: {
    position: "absolute",
    right: 120,
    top: -10,
    width: 140,
    height: 80,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    pointerEvents: "none"
  },
  bannerBg2: {
    position: "absolute",
    right: 60,
    top: 10,
    width: 90,
    height: 60,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.04)",
    pointerEvents: "none"
  },
  bannerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    position: "relative",
    zIndex: 1
  },
  bannerIconWrap: {
    width: 40,
    height: 40,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  bannerSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 3
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#fff"
  },
  viewDirBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 500,
    padding: "8px 16px",
    borderRadius: 8,
    cursor: "pointer",
    position: "relative",
    zIndex: 1
  },


  titleRow: { marginBottom: -8 },
  pageTitle: { fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 },
  filtersRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  filterChip: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 8, padding: "6px 12px", display: "flex", flexDirection: "column", cursor: "pointer", minWidth: 130 },
  filterLabel: { fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 },
  filterValue: { fontSize: 13, fontWeight: 500, color: "#111827", display: "flex", alignItems: "center", gap: 6 },
  exportBtn: { marginLeft: "auto", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  tabsRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  tabs: { display: "flex", gap: 0, borderBottom: "1.5px solid #f0f0f0" },
  tab: { padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#9CA3AF", cursor: "pointer", borderBottom: "2px solid transparent", marginBottom: -1.5, background: "transparent" },
  tabActive: { color: "#005c3d", borderBottom: "2px solid #005c3d" },
  addWidgetBtn: { background: "#005c3d", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 },
  fleetGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 },
  fleetCard: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 12, padding: "14px 16px" },
  fleetTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  fleetTitle: { fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" },
  fleetBadge: { fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 99 },
  fleetBadgeAvail: { background: "#e5f3ed", color: "#005c3d" },
  fleetBadgeBusy: { background: "#FEF3C7", color: "#92400E" },
  fleetBadgeMaint: { background: "#FEE2E2", color: "#991B1B" },
  fleetBadgePending: { background: "#F3F4F6", color: "#6B7280" },
  fleetNum: { fontSize: 22, fontWeight: 700, color: "#111827" },
  fleetLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  fleetDelta: { fontSize: 11, fontWeight: 500, marginTop: 6 },
  fleetDeltaUp: { color: "#005c3d" },
  fleetDeltaDown: { color: "#DC2626" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 },
  statCard: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 12, padding: "16px 18px" },
  statCardTitle: { fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 },
  statRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  statRowLabel: { fontSize: 12, color: "#6B7280" },
  statRowVal: { fontSize: 13, fontWeight: 600, color: "#111827" },
  statBar: { height: 3, background: "#f0f0f0", borderRadius: 2, marginTop: 2, marginBottom: 8 },
  statBarFill: { height: 3, borderRadius: 2 },
  midGrid: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 20 },
  bottomGrid: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 20 },
  card: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 12, padding: 18 },
  cardTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#111827" },
  cardSub: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  moreIcon: { fontSize: 16, color: "#9CA3AF", cursor: "pointer" },
  donutWrap: { display: "flex", alignItems: "center", gap: 20, marginTop: 8 },
  donutLegend: { display: "flex", flexDirection: "column", gap: 10, flex: 1 },
  legendRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 },
  legendDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  legendLabel: { fontSize: 12, color: "#374151", flex: 1 },
  legendVal: { fontSize: 13, fontWeight: 600, color: "#111827" },
  legendBarWrap: { width: "100%", height: 4, background: "#f0f0f0", borderRadius: 2, marginTop: 2 },
  legendBar: { height: 4, borderRadius: 2 },
  activityDots: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 70, padding: "0 4px", marginTop: 12 },
  dayCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  dayBar: { width: 22, borderRadius: "4px 4px 0 0" },
  dayLabel: { fontSize: 10, color: "#9CA3AF" },
  dayLabelActive: { color: "#005c3d", fontWeight: 600 },
  profitCard: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 12, padding: 18 },
  profitHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  profitLabel: { fontSize: 12, color: "#6B7280" },
  profitValue: { fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 2 },
  profitDelta: { fontSize: 12, color: "#005c3d", fontWeight: 500 },
  legendToggle: { display: "flex", alignItems: "center", gap: 12 },
  legToggle: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6B7280" },
  legDot: { width: 8, height: 8, borderRadius: "50%" },
  sparkline: { marginTop: 12 },
  repeatCard: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 12, padding: 18 },
  ringWrap: { display: "flex", alignItems: "center", gap: 16, margin: "12px 0" },
  repeatInsight: { fontSize: 12, color: "#374151", lineHeight: 1.5 },
  repeatSub: { fontSize: 11, color: "#9CA3AF", marginBottom: 4 },
  insightHighlight: { color: "#005c3d", fontWeight: 600 },
  aiCard: { background: "#f8fffe", border: "1px solid #e5f3ed", borderRadius: 12, padding: 16 },
  aiHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 },
  aiOrb: { width: 28, height: 28, borderRadius: "50%", background: "#005c3d", display: "flex", alignItems: "center", justifyContent: "center" },
  aiTitle: { fontSize: 13, fontWeight: 600, color: "#111827" },
  aiMsg: { fontSize: 12, color: "#374151", lineHeight: 1.5, fontStyle: "italic", marginBottom: 10 },
  aiInputRow: { display: "flex", alignItems: "center", gap: 6 },
  aiInput: { flex: 1, border: "1px solid #e5f3ed", borderRadius: 6, padding: "6px 10px", fontSize: 12, color: "#374151", background: "#fff", outline: "none" },
  aiSend: { width: 28, height: 28, background: "#005c3d", borderRadius: 6, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  tableCard: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: 12, padding: 18 },
  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  tableTitle: { fontSize: 13, fontWeight: 600, color: "#111827" },
  viewAll: { fontSize: 12, color: "#005c3d", fontWeight: 500, cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: 11, fontWeight: 500, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", padding: "8px 10px", borderBottom: "1px solid #f0f0f0", textAlign: "left" },
  tr: { borderBottom: "1px solid #fafafa" },
  td: { padding: "10px 10px", fontSize: 13, color: "#374151", borderBottom: "1px solid #fafafa" },
  prodCell: { display: "flex", alignItems: "center", gap: 10 },
  prodThumb: { width: 32, height: 32, borderRadius: 8, background: "#f5f6f8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  prodName: { fontSize: 13, fontWeight: 500, color: "#111827" },
  rating: { color: "#F59E0B", fontWeight: 600, fontSize: 13 },
  actionBtn: { width: 28, height: 28, borderRadius: 6, border: "1px solid #f0f0f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
};

export default VendorDashboard;
