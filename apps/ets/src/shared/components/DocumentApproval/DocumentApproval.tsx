import React, { useRef, useState } from "react";
import { Button, Carousel, Image, Spin } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentApprovalProps {
  open: boolean;
  onCancel: () => void;

  /** Pre-resolved viewable URLs keyed by field name */
  filePreview: Record<string, string | null>;

  /** Which keys failed to load */
  failedImages: Record<string, boolean>;

  /** Whether URLs are still being fetched */
  loadingPreview: boolean;

  /** Called when the user confirms approval */
  onApprove: () => void;

  /** Human-readable label for each document key */
  fileLabels: Record<string, string>;

  /** Optional modal title — defaults to "Document Preview" */
  title?: string;

  /** Optional approve button label — defaults to "Approve" */
  approveLabel?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const DocumentApproval: React.FC<DocumentApprovalProps> = ({
  open,
  onCancel,
  filePreview,
  failedImages,
  loadingPreview,
  onApprove,
  fileLabels,
  title = "Document Preview",
  approveLabel = "Approve",
}) => {
  const carouselRef = useRef<any>(null);
  const [runtimeFailed, setRuntimeFailed] = useState<Record<string, boolean>>({});

  if (!open) return null;

  const entries = Object.entries(filePreview).filter(([, v]) => v !== null);
  const isFailed = (key: string) => failedImages[key] || runtimeFailed[key] || false;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          width: 900,
          maxWidth: "95vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1px solid #f0f0f0",
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 15, color: "#041B3C" }}>
            {title}
          </span>
          <button
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "#6b7280",
              lineHeight: 1,
              padding: "2px 6px",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Button
              icon={<LeftOutlined />}
              onClick={() => carouselRef.current?.prev()}
              disabled={loadingPreview || entries.length === 0}
            >
              Previous
            </Button>
            <Button
              icon={<RightOutlined />}
              onClick={() => carouselRef.current?.next()}
              disabled={loadingPreview || entries.length === 0}
            >
              Next
            </Button>
          </div>

          {loadingPreview ? (
            <div
              style={{
                height: "50vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Spin size="large" />
            </div>
          ) : entries.length === 0 ? (
            <div
              style={{
                height: "50vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: 14,
              }}
            >
              No documents available to preview.
            </div>
          ) : (
            <Carousel ref={carouselRef} dots infinite={false}>
              {entries.map(([key, value]) => (
                <div key={key}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 16,
                        fontWeight: 600,
                        fontSize: 16,
                        color: "#041B3C",
                      }}
                    >
                      {fileLabels[key] ?? key}
                    </div>

                    {isFailed(key) ? (
                      <div
                        style={{
                          height: "50vh",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px dashed #d9d9d9",
                          borderRadius: 8,
                          color: "#9ca3af",
                          fontSize: 15,
                        }}
                      >
                        No Image Uploaded
                      </div>
                    ) : (
                      <Image
                        src={value as string}
                        alt={fileLabels[key] ?? key}
                        preview
                        onError={() =>
                          setRuntimeFailed((prev) => ({ ...prev, [key]: true }))
                        }
                        style={{
                          maxHeight: "50vh",
                          objectFit: "contain",
                          borderRadius: 8,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </Carousel>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "12px 20px",
            borderTop: "1px solid #f0f0f0",
            flexShrink: 0,
          }}
        >
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            disabled={loadingPreview}
            style={{
              background: "#0077b6",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
            }}
            onClick={() => {
              onApprove();
              onCancel();
            }}
          >
            {approveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentApproval;

// import { useState, useRef } from "react";
// import { useFileUpload } from "../../customHooks/useFileUpload";
// import { useUILibrary } from "../../lib/ui-lib/ui-library-context";

// import { Button, Image, Carousel, Spin } from "antd";
// import { LeftOutlined, RightOutlined } from "@ant-design/icons";

// const DocumentApproval = ({
//   open,
//   onCancel,
//   onApprove,
// }: {
//   open: boolean;
//   onCancel: () => void;
//   onApprove: (id: string) => Promise<void> | void;
// }) => {
//   const { getFileUrl } = useFileUpload();
//   const { Modal } = useUILibrary();
//   const carouselRef = useRef<any>(null);
//   //   const [openModal, setOpenModal] = useState<boolean>(false);
//   const [loadingPreview, setLoadingPreview] = useState(false);
//   const loadImage = (src: string): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const img = new window.Image();

//       img.src = src;

//       img.onload = () => resolve(src);
//       img.onerror = () => reject(src);
//     });
//   };
//   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
//   const [filePreview, setFilesPreview] = useState<any>({});

//   const fileLabels: Record<string, string> = {
//     profileImageDoc: "Profile Image",
//     licenseExpDoc: "License Document",
//     policeVerificationExpDoc: "Police Verification",
//     lastTrainingDoc: "Training Certificate",
//     govtIdDoc: "Government ID",
//   };
//   const handlePreviewBeforeApproval = async (record: any) => {
//     setLoadingPreview(true);

//     const docs = [
//       "profileImageDoc",
//       "licenseExpDoc",
//       "policeVerificationExpDoc",
//       "lastTrainingDoc",
//       "govtIdDoc",
//     ];

//     const updatedFiles: Record<string, string | null> = {};
//     const failed: Record<string, boolean> = {};

//     for (const key of docs) {
//       const fileKey = record[key];

//       if (!fileKey) {
//         updatedFiles[key] = null;
//         continue;
//       }

//       try {
//         const url = await getFileUrl(fileKey);

//         // preload image using promise
//         await loadImage(url);

//         updatedFiles[key] = url;
//         failed[key] = false;
//       } catch (error) {
//         console.error(`Error loading ${key}`, error);

//         updatedFiles[key] = null;
//         failed[key] = true;
//       }
//     }

//     setFilesPreview(updatedFiles);
//     setFailedImages(failed);

//     setLoadingPreview(false);
//     setIsPreviewOpen(true);
//   };
//   const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

//   return (
//     <>
//       <Modal
//         open={open}
//         onCancel={onCancel}
//         footer={null}
//         width={900}
//         title="Document Preview"
//         style={{ top: 25 }}
//       >
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             marginBottom: 16,
//           }}
//         >
//           <Button
//             icon={<LeftOutlined />}
//             onClick={() => carouselRef.current?.prev()}
//           >
//             Previous
//           </Button>

//           <Button
//             icon={<RightOutlined />}
//             onClick={() => carouselRef.current?.next()}
//           >
//             Next
//           </Button>
//         </div>
//         {loadingPreview ? (
//           <div
//             style={{
//               height: "50vh",
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <Spin size="large" />
//           </div>
//         ) : (
//           <Carousel ref={carouselRef} dots infinite={false}>
//             {Object.entries(filePreview).map(([key, value]) => {
//               if (!value) return null;
//               let isFailed = failedImages[key];

//               return (
//                 <div key={key}>
//                   <div
//                     style={{
//                       display: "flex",
//                       flexDirection: "column",
//                       alignItems: "center",
//                       padding: 20,
//                     }}
//                   >
//                     <div
//                       style={{
//                         marginBottom: 16,
//                         fontWeight: 600,
//                         fontSize: 16,
//                       }}
//                     >
//                       {fileLabels[key] || key}
//                     </div>

//                     {isFailed ? (
//                       <div
//                         style={{
//                           height: "50vh",
//                           width: "100%",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           border: "1px dashed #d9d9d9",
//                           borderRadius: 8,
//                           color: "#999",
//                           fontSize: 16,
//                         }}
//                       >
//                         No Image Uploaded
//                       </div>
//                     ) : (
//                       <Image
//                         src={value as string}
//                         alt={key}
//                         preview
//                         onError={() =>
//                           setFailedImages((prev) => ({
//                             ...prev,
//                             [key]: true,
//                           }))
//                         }
//                         style={{
//                           maxHeight: "50vh",
//                           objectFit: "contain",
//                           borderRadius: 8,
//                         }}
//                       />
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </Carousel>
//         )}

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "flex-end",
//             marginTop: 20,
//             gap: 10,
//           }}
//         >
//           <Button onClick={() => setIsPreviewOpen(false)}>Cancel</Button>

//           <Button
//             type="primary"
//             onClick={() => {
//               onApprove(editingRecord?.driver_Id?.toString() || "");
//               setIsPreviewOpen(false);
//             }}
//           >
//             Approve
//           </Button>
//         </div>
//       </Modal>
//     </>
//   );
// };

// export default DocumentApproval;
