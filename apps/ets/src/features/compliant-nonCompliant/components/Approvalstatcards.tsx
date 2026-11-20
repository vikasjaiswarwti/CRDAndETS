import React from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../constants/tokens";

import { APPROVAL_STAT_CARDS } from "../constants/Vehicleapprovalconstants";

const ICON_MAP: Record<string, React.ReactNode> = {
  clock: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  check: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  close: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

interface Props {
  stats: any;
}

export const ApprovalStatCards: React.FC<Props> = ({ stats }) => {
  const { Row, Col, Card, Typography } = useUILibrary();
  const { Text, Title } = Typography;
  const { color, spacing, radius, shadow, font } = useTokens();

  return (
    <Row gutter={[spacing.lg, spacing.lg]} style={{ marginBottom: spacing.xl }}>
      {APPROVAL_STAT_CARDS.map((card) => (
        <Col key={card.key} xs={12} sm={12} md={6}>
          <Card
            size="small"
            // styles={{ body: { padding: `${spacing.lg}px ${spacing.xl}px` } }}
            style={{
              borderRadius: radius.lg,
              border: `1px solid ${color.border}`,
              boxShadow: shadow.card,
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: spacing.lg }}
            >
              <span
                style={{
                  background: card.iconBg,
                  color: card.iconColor,
                  borderRadius: "50%",
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {ICON_MAP[card.iconType]}
              </span>
              <div>
                <Text
                  style={{
                    fontSize: font.sizeSm,
                    color: color.textSecondary,
                    display: "block",
                  }}
                >
                  {card.label}
                </Text>
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    fontSize: 28,
                    fontWeight: font.weightBold,
                    color: color.textPrimary,
                  }}
                >
                  {stats[card.key as any] ?? 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
