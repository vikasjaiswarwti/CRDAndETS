import { useState } from "react";
import { useFileUpload } from "./useFileUpload";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseDocumentApprovalOptions {
    /**
     * The keys of the document fields to preview.
     * e.g. ["profileImageDoc", "licenseExpDoc", ...]
     */
    docKeys: string[];

    /**
     * Resolves a stored file key / path to a browser-viewable URL.
     * Should return "URL Not Found" (or throw) when the key is invalid.
     */
    // getFileUrl: (key: string | null | undefined) => Promise<string>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Generic hook that drives a <DocumentApproval /> modal.
 *
 * Works for any entity that stores document URLs on a record object —
 * drivers, vehicles, vendors, etc.
 *
 * Usage:
 *   const approval = useDocumentApproval({ docKeys: DRIVER_DOC_KEYS, getFileUrl });
 *
 *   // Open (pass the record whose docs you want to preview)
 *   <Button onClick={() => approval.open(record)}>Approve</Button>
 *
 *   // Render
 *   <DocumentApproval
 *     open={approval.isOpen}
 *     onCancel={approval.close}
 *     filePreview={approval.filePreview}
 *     failedImages={approval.failedImages}
 *     loadingPreview={approval.loadingPreview}
 *     fileLabels={FILE_LABELS}
 *     onApprove={...}
 *   />
 */
export function useDocumentApproval({
    docKeys,
}: UseDocumentApprovalOptions) {
    const { getFileUrl } = useFileUpload()
    const [isOpen, setIsOpen] = useState(false);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [filePreview, setFilePreview] = useState<Record<string, string | null>>({});
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

    /** Pre-loads a browser Image so we know before the modal opens whether it worked. */
    const preloadImage = (src: string): Promise<string> =>
        new Promise((resolve, reject) => {
            const img = new window.Image();
            img.src = src;
            img.onload = () => resolve(src);
            img.onerror = () => reject(src);
        });

    /**
     * Fetch + pre-load all document URLs for `record`, then open the modal.
     * `record` can be any object — only the keys listed in `docKeys` are read.
     */
    const open = async (record: Record<string, any>) => {
        setIsOpen(true);
        setLoadingPreview(true);

        const updatedFiles: Record<string, string | null> = {};
        const failed: Record<string, boolean> = {};

        for (const key of docKeys) {
            const fileKey = record[key];

            if (!fileKey) {
                updatedFiles[key] = null;
                continue;
            }

            try {
                const url = await getFileUrl(fileKey);
                await preloadImage(url);
                updatedFiles[key] = url;
                failed[key] = false;
            } catch {
                updatedFiles[key] = null;
                failed[key] = true;
            }
        }

        setFilePreview(updatedFiles);
        setFailedImages(failed);
        setLoadingPreview(false);
    };

    const close = () => {
        setIsOpen(false);
        // Reset so stale previews don't flash on next open
        setFilePreview({});
        setFailedImages({});
    };

    return {
        /** Whether the modal is currently open */
        isOpen,
        /** Call with any record to fetch its docs and open the modal */
        open,
        /** Close and reset the modal */
        close,
        loadingPreview,
        filePreview,
        failedImages,
    };
}