// import { useEffect, useState } from "react";
// import { Button, Checkbox, Divider } from "antd";
// import {
//   CarOutlined,
//   //   MailOutlined,
//   PhoneOutlined,
//   //   EnvironmentOutlined,
// } from "@ant-design/icons";
// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
// import type { ApprovedUser } from "../types/Employee.types";

// interface TransportModalProps {
//   open: boolean;
//   onClose: () => void;
//   onConfirm: (
//     userId: string,
//     payload: { transport: boolean; ownTransport: boolean },
//   ) => Promise<any> | void;
//   loading?: boolean;
//   editingRecord?: ApprovedUser | null;
// }

// const DetailRow = ({
//   icon,
//   label,
//   value,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value?: string;
// }) => (
//   <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//     <span style={{ color: "#1B4332", fontSize: 14 }}>{icon}</span>
//     <span style={{ fontSize: 12, color: "#888", minWidth: 60 }}>{label}</span>
//     <span style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>
//       {value || "—"}
//     </span>
//   </div>
// );

// const TransportModal: React.FC<TransportModalProps> = ({
//   open,
//   onClose,
//   onConfirm,
//   loading,
//   editingRecord,
// }) => {
//   const { Modal } = useUILibrary();
//   const [transport, setTransport] = useState<boolean>(
//     editingRecord?.transport || false,
//   );

//   const [ownTransport, setOwnTransport] = useState<boolean>(
//     editingRecord?.ownTransport || false,
//   );
//   useEffect(() => {
//     setTransport(editingRecord?.transport || false);
//     setOwnTransport(editingRecord?.ownTransport || false);
//   }, [editingRecord]);

//   const fullName = editingRecord
//     ? `${editingRecord.firstName} ${editingRecord.lastName}`
//     : "this user";

//   const handleConfirm = async () => {
//     if (!editingRecord?.user_Id) return;
//     await onConfirm(editingRecord.user_Id, { transport, ownTransport });
//   };

//   return (
//     <Modal
//       key={editingRecord?.user_Id}
//       open={open}
//       onCancel={onClose}
//       footer={null}
//       centered
//       width={400}
//       destroyOnClose
//       title={
//         <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <CarOutlined style={{ color: "#1B4332" }} />
//           Transport Settings
//         </span>
//       }
//     >
//       <div style={{ marginTop: 12 }}>
//         {/* ✅ User basic details */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 12,
//             padding: 14,
//             background: "#f0fdf4",
//             borderRadius: 8,
//             border: "1px solid #bbf7d0",
//           }}
//         >
//           {/* Avatar circle */}
//           <div
//             style={{
//               width: 44,
//               height: 44,
//               borderRadius: "50%",
//               background: "#1B4332",
//               color: "#fff",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: 18,
//               fontWeight: 700,
//               flexShrink: 0,
//             }}
//           >
//             {editingRecord?.firstName?.[0]?.toUpperCase() ?? "U"}
//           </div>

//           {/* Details */}
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               gap: 6,
//               flex: 1,
//             }}
//           >
//             <div style={{ fontSize: 15, fontWeight: 700, color: "#1B4332" }}>
//               {fullName}
//             </div>

//             <DetailRow
//               icon={<PhoneOutlined />}
//               label="Mobile"
//               value={editingRecord?.mobileNo}
//             />
//           </div>
//         </div>

//         <Divider style={{ margin: "16px 0" }} />

//         {/* ✅ Checkbox fields */}
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             gap: 8,
//           }}
//         >
//           <Checkbox
//             key={"Transport"}
//             checked={transport}
//             onChange={(e) => setTransport(e.target.checked)}
//             style={{
//               display: "flex",
//               gap: 8,
//               padding: "10px 20px",
//               background: "#f9fafb",
//               borderRadius: 8,
//               border: "1px solid #e5e7eb",
//             }}
//           >
//             <div>
//               <div style={{ fontSize: 14, fontWeight: 500 }}>Transport</div>
//               <div style={{ fontSize: 11, color: "#888" }}>
//                 Company-provided cab service will be arranged for the employee.
//               </div>
//             </div>
//           </Checkbox>

//           <Checkbox
//             key={"ownTransport"}
//             style={{
//               display: "flex",
//               gap: 8,
//               padding: "10px 20px",
//               background: "#f9fafb",
//               borderRadius: 8,
//               border: "1px solid #e5e7eb",
//             }}
//             checked={ownTransport}
//             onChange={(e) => setOwnTransport(e.target.checked)}
//           >
//             <div>
//               <div style={{ fontSize: 14, fontWeight: 500 }}>Own Transport</div>
//               <div style={{ fontSize: 11, color: "#888" }}>
//                 Employee will commute using their own transportation.
//               </div>
//             </div>
//           </Checkbox>
//         </div>

//         {/* ✅ Footer */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "flex-end",
//             gap: 12,
//             marginTop: 24,
//           }}
//         >
//           <Button onClick={onClose}>Cancel</Button>
//           <Button
//             type="primary"
//             loading={loading}
//             onClick={handleConfirm}
//             disabled={!editingRecord?.user_Id}
//             style={{
//               borderRadius: 20,
//               background: "#1B4332",
//               borderColor: "#1B4332",
//             }}
//           >
//             Save
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default TransportModal;

import { useEffect, useState } from "react";
import { Button, Divider } from "antd";
import {
  CarOutlined,
  PhoneOutlined,
  CheckCircleFilled,
  StopOutlined,
} from "@ant-design/icons";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { ApprovedUser } from "../types/Employee.types";

interface TransportModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (
    userId: string,
    payload: { transport: boolean; ownTransport: boolean },
  ) => Promise<any> | void;
  loading?: boolean;
  editingRecord?: ApprovedUser | null;
}

const TransportModal: React.FC<TransportModalProps> = ({
  open,
  onClose,
  onConfirm,
  loading,
  editingRecord,
}) => {
  const { Modal } = useUILibrary();
  const [transport, setTransport] = useState<boolean>(
    editingRecord?.transport ?? false,
  );

  useEffect(() => {
    setTransport(editingRecord?.transport ?? false);
  }, [editingRecord]);

  const fullName = editingRecord
    ? `${editingRecord.firstName} ${editingRecord.lastName}`.trim()
    : "—";

  const handleConfirm = async () => {
    if (!editingRecord?.user_Id) return;
    await onConfirm(editingRecord.user_Id, {
      transport,
      ownTransport: editingRecord.ownTransport ?? false,
    });
  };

  const options = [
    {
      value: true,
      icon: <CheckCircleFilled style={{ fontSize: 22, color: "#059669" }} />,
      title: "Active",
      desc: "Employee can use Commutr cab services",
      activeBg: "#f0fdf4",
      activeBorder: "#6ee7b7",
      activeTitle: "#059669",
    },
    {
      value: false,
      icon: <StopOutlined style={{ fontSize: 22, color: "#dc2626" }} />,
      title: "Blocked",
      desc: "Employee will be blocked from all Commutr services",
      activeBg: "#fef2f2",
      activeBorder: "#fca5a5",
      activeTitle: "#dc2626",
    },
  ];

  return (
    <Modal
      key={editingRecord?.user_Id}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={380}
      destroyOnClose
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CarOutlined style={{ color: "#1B4332" }} />
          Commutr Service Access
        </span>
      }
    >
      <div style={{ marginTop: 12 }}>
        {/* Employee card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            background: "#f9fafb",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#1B4332",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {editingRecord?.firstName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
              {fullName}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <PhoneOutlined style={{ fontSize: 10 }} />
              {editingRecord?.mobileNo || "—"}
            </div>
          </div>
        </div>

        <Divider style={{ margin: "14px 0" }} />

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {options.map((opt) => {
            const isActive = transport === opt.value;
            return (
              <div
                key={String(opt.value)}
                onClick={() => setTransport(opt.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: `1.5px solid ${isActive ? opt.activeBorder : "#e5e7eb"}`,
                  background: isActive ? opt.activeBg : "#fff",
                  transition: "all 0.15s",
                }}
              >
                {opt.icon}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isActive ? opt.activeTitle : "#374151",
                    }}
                  >
                    {opt.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>
                    {opt.desc}
                  </div>
                </div>
                {/* Selection indicator */}
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: `2px solid ${isActive ? opt.activeBorder : "#d1d5db"}`,
                    background: isActive ? opt.activeTitle : "transparent",
                    flexShrink: 0,
                    transition: "all 0.15s",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 20,
          }}
        >
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={handleConfirm}
            disabled={!editingRecord?.user_Id}
            style={{
              borderRadius: 20,
              background: "#1B4332",
              borderColor: "#1B4332",
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TransportModal;
