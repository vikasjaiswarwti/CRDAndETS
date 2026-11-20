import {
  type ReactNode,
  type CSSProperties,
  useState,
  useEffect,
  useMemo,
} from "react";
import { MoreOutlined } from "@ant-design/icons";
import { useUILibrary } from "../../lib/ui-lib/ui-library-context";
import { ContentContainer } from "../ContentContainer/ContentContainer";

export interface PaginationConfig {
  total: number;
  current: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  pageSizeOptions?: string[];
}

export interface MobileMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  createButtonLabel?: string;
  onCreateClick?: () => void;
  filterButtonLabel?: string;
  onFilterClick?: () => void;
  headerActions?: ReactNode;
  /** Items shown in the ⋯ dropdown on mobile (include custom header actions here) */
  mobileMenuItems?: MobileMenuItem[];
  bulkButtonLabel?: string;
  onBulkClick?: () => void;
  children: ReactNode;
  style?: CSSProperties;
  pagination?: PaginationConfig;
  className?: string;
  style2?: CSSProperties;
  canBulk?: boolean;
  canCreate?: boolean;
}

export const PageContainer = ({
  title,
  subtitle,
  createButtonLabel,
  onCreateClick,
  filterButtonLabel,
  onFilterClick,
  headerActions,
  mobileMenuItems,
  children,
  pagination,
  bulkButtonLabel,
  onBulkClick = () => {},
  canBulk = true,
  canCreate = true,
}: PageContainerProps) => {
  const { Typography, Button, Space, Pagination, Dropdown } = useUILibrary();
  const { Title, Text } = Typography;

  // ── Mobile detection ────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Build mobile dropdown items from all action sources ─────────────────────
  const dropdownItems = useMemo(() => {
    const items: {
      key: string;
      label: string;
      onClick: () => void;
      danger?: boolean;
    }[] = [];
    (mobileMenuItems ?? []).forEach((item, i) =>
      items.push({
        key: `custom-${i}`,
        label: item.label,
        onClick: item.onClick,
        danger: item.danger,
      }),
    );
    if (createButtonLabel && canCreate && onCreateClick)
      items.push({
        key: "create",
        label: createButtonLabel,
        onClick: onCreateClick,
      });
    if (bulkButtonLabel && canBulk)
      items.push({ key: "bulk", label: bulkButtonLabel, onClick: onBulkClick });
    if (filterButtonLabel && onFilterClick)
      items.push({
        key: "filter",
        label: filterButtonLabel,
        onClick: onFilterClick,
      });
    return items;
  }, [
    mobileMenuItems,
    createButtonLabel,
    canCreate,
    onCreateClick,
    bulkButtonLabel,
    canBulk,
    onBulkClick,
    filterButtonLabel,
    onFilterClick,
  ]);

  // ── Pagination ──────────────────────────────────────────────────────────────
  const showPagination = !!pagination && pagination.total > 0;
  const startItem = showPagination
    ? (pagination!.current - 1) * pagination!.pageSize + 1
    : 0;
  const endItem = showPagination
    ? Math.min(pagination!.current * pagination!.pageSize, pagination!.total)
    : 0;

  return (
    <ContentContainer>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "row", // ← always row, never column
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: isMobile ? "14px 16px" : "20px 32px",
          }}
        >
          {/* Left: title + subtitle */}
          {title && (
            <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
              <Title
                level={5}
                style={{ margin: 0, color: "#1a202c", fontWeight: 700 }}
              >
                {title}
              </Title>
              {subtitle && (
                <Text style={{ fontSize: 12, color: "#718096" }}>
                  {subtitle}
                </Text>
              )}
            </div>
          )}

          {/* Right: desktop buttons OR mobile ⋯ icon-only */}
          {isMobile ? (
            dropdownItems.length > 0 && (
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: dropdownItems.map((item) => ({
                    key: item.key,
                    label: item.label,
                    danger: item.danger,
                    onClick: item.onClick,
                  })),
                }}
              >
                <Button
                  icon={<MoreOutlined />}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    flexShrink: 0,
                    color: "#374151",
                  }}
                />
              </Dropdown>
            )
          ) : (
            <Space
              size={6}
              style={{
                display: "flex",
                justifyContent: "flex-end",
                flexShrink: 0,
              }}
            >
              {filterButtonLabel && (
                <Button
                  onClick={onFilterClick}
                  style={{
                    color: "#52796F",
                    borderRadius: 8,
                    border: "1px solid #B7E4C7",
                    fontWeight: 500,
                    background: "#fff",
                  }}
                  className="no-transition-btn"
                >
                  {filterButtonLabel}
                </Button>
              )}
              {headerActions}
              {bulkButtonLabel && canBulk && (
                <Button
                  type="primary"
                  className="no-transition-btn"
                  onClick={onBulkClick}
                  style={{
                    background: "#1B4332",
                    border: "1px solid #1B4332",
                    borderRadius: 50,
                    fontWeight: 600,
                    paddingInline: 20,
                    boxShadow: "0 2px 8px rgba(27,67,50,0.25)",
                  }}
                >
                  + {bulkButtonLabel}
                </Button>
              )}
              {createButtonLabel && canCreate && onCreateClick && (
                <Button
                  type="primary"
                  className="no-transition-btn"
                  onClick={onCreateClick}
                  style={{
                    background: "#1B4332",
                    border: "1px solid #1B4332",
                    borderRadius: 50,
                    fontWeight: 600,
                    paddingInline: 20,
                    boxShadow: "0 2px 8px rgba(27,67,50,0.25)",
                    transition: "none",
                  }}
                >
                  + {createButtonLabel}
                </Button>
              )}
            </Space>
          )}
        </div>

        {/* ── Body ── */}
        {children}
      </div>

      {/* ── Pagination ── */}
      {showPagination && (
        <div className="menu-pagination-bar">
          <div className="showing-text">
            Showing {startItem}–{endItem} of {pagination!.total} items
          </div>
          <div className="pagination-right">
            <Pagination
              current={pagination!.current}
              pageSize={pagination!.pageSize}
              total={pagination!.total}
              showSizeChanger
              pageSizeOptions={
                pagination!.pageSizeOptions ?? ["5", "10", "20", "50", "100"]
              }
              onChange={pagination!.onChange}
              size="small"
            />
          </div>
        </div>
      )}
    </ContentContainer>
  );
};

export default PageContainer;
