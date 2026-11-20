/**
 * DocumentPreviewModal
 * Resolves a stored document URL via getFileUrl() and shows a full-size
 * preview (image or PDF iframe). No page navigation — purely a modal overlay.
 */
import React, { useState, useEffect } from "react";
import { useFileUpload } from "../../../shared/customHooks/useFileUpload";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../constants/tokens";

interface Props {
  open: boolean;
  documentUrl: string | null | undefined;
  title?: string;
  onClose: () => void;
}

function isPdfUrl(url: string): boolean {
  return (
    url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("pdf")
  );
}

export const DocumentPreviewModal: React.FC<Props> = ({
  open,
  documentUrl,
  title = "Document Preview",
  onClose,
}) => {
  const { Modal, Spin } = useUILibrary();
  const { color, spacing, radius, font } = useTokens();
  const { getFileUrl } = useFileUpload();

  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!open || !documentUrl) {
      setResolvedUrl(null);
      setError(null);
      setImgFailed(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setImgFailed(false);
    setResolvedUrl(null);

    getFileUrl(documentUrl)
      .then((url) => {
        if (cancelled) return;
        if (!url || url === "URL Not Found") {
          setError("Could not resolve document URL.");
        } else {
          setResolvedUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load document.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, documentUrl]);

  const handleClose = () => {
    setResolvedUrl(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={title}
      footer={null}
      centered
      width="min(900px, 92vw)"
      destroyOnClose
    >
      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 320,
          }}
        >
          <Spin size="large" tip="Loading document…" />
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 320,
            gap: spacing.md,
            color: color.textSecondary,
            fontSize: font.sizeSm,
          }}
        >
          <span style={{ fontSize: 32 }}>📄</span>
          <span>{error}</span>
          {documentUrl && (
            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: color.primary, fontSize: font.sizeSm }}
            >
              Open original link
            </a>
          )}
        </div>
      )}

      {!loading && resolvedUrl && (
        <>
          {/* PDF: render in iframe */}
          {isPdfUrl(resolvedUrl) || imgFailed ? (
            <iframe
              src={resolvedUrl}
              title={title}
              style={{
                width: "100%",
                height: "70vh",
                border: "none",
                borderRadius: radius.md,
              }}
            />
          ) : (
            /* Image */
            <img
              src={resolvedUrl}
              alt={title}
              onError={() => setImgFailed(true)}
              style={{
                display: "block",
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: radius.md,
                border: `1px solid ${color.border}`,
              }}
            />
          )}
          {/* Direct link fallback */}
          <div style={{ textAlign: "right", marginTop: spacing.sm }}>
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: font.sizeSm, color: color.primary }}
            >
              Open in new tab ↗
            </a>
          </div>
        </>
      )}
    </Modal>
  );
};
