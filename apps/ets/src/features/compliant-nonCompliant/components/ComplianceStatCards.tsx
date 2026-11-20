import React, { useRef, useState } from "react";
import {
  Truck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  CirclePause,
  FileCheck2,
  Receipt,
  Activity,
} from "lucide-react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../constants/tokens";
import type { VehicleComplianceStats } from "../types/Vehiclecompliance.types";
import { STAT_CARDS } from "../constants/VehicleComplianceConstants";

import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

const ICONS: Record<string, React.ReactNode> = {
  vehicle: <Truck size={15} strokeWidth={1.6} />,
  insurance: <ShieldAlert size={15} strokeWidth={1.6} />,
  clock: <Clock size={15} strokeWidth={1.6} />,
  check: <CheckCircle2 size={15} strokeWidth={1.6} />,
  pause: <CirclePause size={15} strokeWidth={1.6} />,
  permit: <FileCheck2 size={15} strokeWidth={1.6} />,
  tax: <Receipt size={15} strokeWidth={1.6} />,
  fitness: <Activity size={15} strokeWidth={1.6} />,
};

interface Props {
  stats: VehicleComplianceStats;
}

export const ComplianceStatCards: React.FC<Props> = ({ stats }) => {
  const { Row, Col, Card, Typography } = useUILibrary();
  const { Text, Title } = Typography;
  const { color, spacing, radius, shadow, font } = useTokens();
  const isMobile = useIsMobile();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  const cardsPerView = 3; // roughly how many are visible per "page" on the strip
  const totalDots = Math.max(1, Math.ceil(STAT_CARDS.length / cardsPerView));

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const page = Math.round(el.scrollLeft / el.clientWidth);
    setActiveDot(Math.min(Math.max(page, 0), totalDots - 1));
  };

  // ── Desktop / tablet: unchanged grid ─────────────────────────────────────
  if (!isMobile) {
    return (
      <Row
        gutter={[spacing.sm, spacing.sm]}
        style={{ marginBottom: spacing.lg }}
      >
        {STAT_CARDS.map((card) => (
          <Col key={card.key} xs={12} sm={8} md={6} lg={3}>
            <Card
              size="small"
              style={{
                borderRadius: radius.lg,
                border: `1px solid ${color.border}`,
                boxShadow: shadow.card,
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: spacing.xs,
                }}
              >
                <Text
                  style={{
                    fontSize: font.sizeXs,
                    color: color.textSecondary,
                    lineHeight: 1.3,
                  }}
                >
                  {card.label}
                </Text>
                <span
                  style={{
                    background: card.iconBg,
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {ICONS[card.iconType]}
                </span>
              </div>
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontSize: font.sizeLg,
                  fontWeight: font.weightBold,
                  color: color.textPrimary,
                }}
              >
                {(
                  stats[card.key as keyof VehicleComplianceStats] ?? 0
                ).toLocaleString()}
              </Title>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  // ── Mobile: horizontal scroll strip, icon stacked above label/number ─────
  return (
    <div style={{ marginBottom: spacing.md }}>
      <style>{`
        .compliance-stat-scroll::-webkit-scrollbar { display: none; }
      `}</style>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="compliance-stat-scroll"
        style={{
          display: "flex",
          gap: spacing.sm,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          paddingBottom: 2,
        }}
      >
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            style={{
              flex: "0 0 auto",
              width: "calc((100% - 16px) / 3.3)",
              minWidth: 108,
              scrollSnapAlign: "start",
              borderRadius: radius.lg,
              border: `1px solid ${color.border}`,
              boxShadow: shadow.card,
              padding: spacing.sm,
              background: "#fff",
            }}
          >
            <span
              style={{
                background: card.iconBg,
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: spacing.xs,
              }}
            >
              {ICONS[card.iconType]}
            </span>
            <Text
              style={{
                display: "block",
                fontSize: font.sizeXs,
                color: color.textSecondary,
                lineHeight: 1.3,
                marginBottom: 2,
              }}
            >
              {card.label}
            </Text>
            <Title
              level={4}
              style={{
                margin: 0,
                fontSize: font.sizeLg,
                fontWeight: font.weightBold,
                color: color.textPrimary,
              }}
            >
              {(
                stats[card.key as keyof VehicleComplianceStats] ?? 0
              ).toLocaleString()}
            </Title>
          </div>
        ))}
      </div>

      {totalDots > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
            marginTop: spacing.xs,
          }}
        >
          {Array.from({ length: totalDots }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: i === activeDot ? color.primary : "#e5e7eb",
                transition: "background 0.15s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
