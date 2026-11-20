// // export default IvrRecordingsModal;

// import { useEffect, useMemo, useState } from "react";
// import { Modal, List, Spin, Typography, Avatar } from "antd";
// import {
//   PlayCircleOutlined,
//   LoadingOutlined,
//   UserOutlined,
// } from "@ant-design/icons";
// import {
//   useLazyGetIvrRecordingAudioQuery,
//   type IvrRecordingGroup,
// } from "../services/routeTrackingApi";
// import type { TripPassenger } from "../types/tracking.types";

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   recordings: IvrRecordingGroup[];
//   loading: boolean;
//   passengers: TripPassenger[]; // NEW
// }

// const IvrRecordingsModal: React.FC<Props> = ({
//   open,
//   onClose,
//   recordings,
//   loading,
//   passengers,
// }) => {
//   const [fetchAudio, { isFetching: isAudioLoading }] =
//     useLazyGetIvrRecordingAudioQuery();
//   const [activeCallSid, setActiveCallSid] = useState<string | null>(null);
//   const [audioUrl, setAudioUrl] = useState<string | null>(null);

//   const passengerMap = useMemo(() => {
//     const map = new Map<number, TripPassenger>();
//     passengers.forEach((p) => map.set(p.empId, p));
//     return map;
//   }, [passengers]);

//   useEffect(() => {
//     return () => {
//       if (audioUrl) URL.revokeObjectURL(audioUrl);
//     };
//   }, [audioUrl]);

//   const handlePlay = async (callSid: string) => {
//     setActiveCallSid(callSid);
//     setAudioUrl(null);
//     try {
//       const url = await fetchAudio({ callSid }).unwrap();
//       setAudioUrl(url);
//     } catch {
//       setActiveCallSid(null);
//     }
//   };

//   const handleClose = () => {
//     onClose();
//     setActiveCallSid(null);
//     setAudioUrl(null);
//   };

//   return (
//     <Modal
//       title="IVR Recordings"
//       open={open}
//       onCancel={handleClose}
//       footer={null}
//       width={420}
//     >
//       <Spin spinning={loading}>
//         {!loading && recordings.length === 0 && (
//           <Typography.Text type="secondary" style={{ fontSize: 12 }}>
//             No recordings found
//           </Typography.Text>
//         )}
//         {recordings.map((group) => {
//           const pax = passengerMap.get(group.empId);
//           const displayName = pax
//             ? `${pax.firstname} ${pax.lastName}`
//             : `Emp ID: ${group.empId}`;

//           return (
//             <div key={group.empId} style={{ marginBottom: 12 }}>
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 6,
//                   marginBottom: 4,
//                 }}
//               >
//                 <Avatar size={20} icon={<UserOutlined />} />
//                 <Typography.Text strong style={{ fontSize: 12 }}>
//                   {displayName}
//                 </Typography.Text>
//                 {pax?.mobileno && (
//                   <Typography.Text type="secondary" style={{ fontSize: 11 }}>
//                     ({pax.mobileno})
//                   </Typography.Text>
//                 )}
//               </div>
//               <List
//                 size="small"
//                 dataSource={group.callSids}
//                 renderItem={(callSid, i) => (
//                   <List.Item
//                     style={{ cursor: "pointer", padding: "6px 0" }}
//                     onClick={() => handlePlay(callSid)}
//                     actions={[
//                       activeCallSid === callSid && isAudioLoading ? (
//                         <LoadingOutlined key="loading" />
//                       ) : (
//                         <PlayCircleOutlined
//                           key="play"
//                           style={{ fontSize: 16 }}
//                         />
//                       ),
//                     ]}
//                   >
//                     <Typography.Text style={{ fontSize: 12 }} ellipsis>
//                       Call {i + 1}
//                     </Typography.Text>
//                   </List.Item>
//                 )}
//               />
//             </div>
//           );
//         })}
//         {activeCallSid && audioUrl && (
//           <audio
//             style={{ width: "100%", marginTop: 12 }}
//             controls
//             autoPlay
//             src={audioUrl}
//           />
//         )}
//       </Spin>
//     </Modal>
//   );
// };

// export default IvrRecordingsModal;

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, List, Spin, Typography, Avatar } from "antd";
import {
  PlayCircleFilled,
  PauseCircleFilled,
  LoadingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  useLazyGetIvrRecordingAudioQuery,
  type IvrRecordingGroup,
} from "../services/routeTrackingApi";
import type { TripPassenger } from "../types/tracking.types";
import { colors } from "../style/styles";

interface Props {
  open: boolean;
  onClose: () => void;
  recordings: IvrRecordingGroup[];
  loading: boolean;
  passengers: TripPassenger[];
}

// small animated equalizer to show "this one is playing"
const PlayingBars = () => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "flex-end",
      gap: 2,
      height: 12,
    }}
  >
    <style>{`
      @keyframes ivrBar { 0%,100% { height: 3px; } 50% { height: 12px; } }
    `}</style>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: 2,
          height: 6,
          background: colors.success,
          borderRadius: 1,
          animation: `ivrBar 0.8s ease-in-out ${i * 0.15}s infinite`,
        }}
      />
    ))}
  </span>
);

const IvrRecordingsModal: React.FC<Props> = ({
  open,
  onClose,
  recordings,
  loading,
  passengers,
}) => {
  const [fetchAudio, { isFetching: isAudioLoading }] =
    useLazyGetIvrRecordingAudioQuery();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [activeCallSid, setActiveCallSid] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorCallSid, setErrorCallSid] = useState<string | null>(null);

  const passengerMap = useMemo(() => {
    const map = new Map<number, TripPassenger>();
    passengers.forEach((p) => map.set(p.empId, p));
    return map;
  }, [passengers]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleRowClick = async (callSid: string) => {
    // same recording already loaded → just toggle play/pause
    if (callSid === activeCallSid && audioUrl) {
      if (isPlaying) audioRef.current?.pause();
      else audioRef.current?.play();
      return;
    }

    // switching to a different recording → fetch fresh and autoplay
    setErrorCallSid(null);
    setActiveCallSid(callSid);
    setAudioUrl(null);
    setIsPlaying(false);
    try {
      const url = await fetchAudio({ callSid }).unwrap();
      setAudioUrl(url);
    } catch {
      setErrorCallSid(callSid);
      setActiveCallSid(null);
    }
  };

  const handleClose = () => {
    audioRef.current?.pause();
    onClose();
    setActiveCallSid(null);
    setAudioUrl(null);
    setIsPlaying(false);
  };

  return (
    <Modal
      title="IVR Recordings"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={440}
    >
      <Spin spinning={loading}>
        {!loading && recordings.length === 0 && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            No recordings found
          </Typography.Text>
        )}
        {recordings.map((group) => {
          const pax = passengerMap.get(group.empId);
          const displayName = pax
            ? `${pax.firstname} ${pax.lastName}`
            : `Emp ID: ${group.empId}`;

          return (
            <div key={group.empId} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <Avatar size={20} icon={<UserOutlined />} />
                <Typography.Text strong style={{ fontSize: 12 }}>
                  {displayName}
                </Typography.Text>
                {pax?.mobileno && (
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    ({pax.mobileno})
                  </Typography.Text>
                )}
              </div>
              <List
                size="small"
                dataSource={group.callSids}
                renderItem={(callSid, i) => {
                  const isActive = activeCallSid === callSid;
                  const isThisLoading = isActive && isAudioLoading && !audioUrl;
                  const isThisPlaying = isActive && isPlaying;
                  const isThisError = errorCallSid === callSid;

                  let icon = (
                    <PlayCircleFilled
                      style={{ fontSize: 18, color: colors.gray600 }}
                    />
                  );
                  if (isThisLoading)
                    icon = <LoadingOutlined style={{ fontSize: 16 }} />;
                  else if (isThisPlaying)
                    icon = (
                      <PauseCircleFilled
                        style={{ fontSize: 18, color: colors.success }}
                      />
                    );
                  else if (isActive && audioUrl)
                    icon = (
                      <PlayCircleFilled
                        style={{ fontSize: 18, color: colors.success }}
                      />
                    );

                  return (
                    <List.Item
                      onClick={() => handleRowClick(callSid)}
                      style={{
                        cursor: "pointer",
                        padding: "6px 8px",
                        borderRadius: 6,
                        background: isActive ? "#f0fdf4" : "transparent",
                      }}
                      actions={[icon]}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Typography.Text
                          style={{
                            fontSize: 12,
                            color: isThisError ? "#f5222d" : undefined,
                          }}
                        >
                          {isThisError
                            ? "Failed to load — tap to retry"
                            : isThisLoading
                              ? "Loading…"
                              : `Call ${i + 1}`}
                        </Typography.Text>
                        {isThisPlaying && <PlayingBars />}
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
          );
        })}
      </Spin>

      {/* single shared audio element, controlled per-row via handleRowClick */}
      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
        autoPlay
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        style={{ display: "none" }}
      />
    </Modal>
  );
};

export default IvrRecordingsModal;
