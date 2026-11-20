import { useEffect, useRef } from "react";

const CHAT_ORIGIN = "http://13.235.144.192:5050";

const Chatbot = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check
      if (event.origin !== CHAT_ORIGIN) return;

      const data = event.data || {};

      // Validate request
      if (data.type !== "ets-chat-auth-token-request" || !data.requestId) {
        return;
      }

      // Get token from localStorage
      const token = localStorage.getItem("commutr_access_token") || "";

      // Send token back to iframe
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: "ets-chat-auth-token-response",
          requestId: data.requestId,
          token,
        },
        CHAT_ORIGIN,
      );
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <iframe
        ref={iframeRef}
        id="ets-chat-frame"
        src={`${CHAT_ORIGIN}/?embed=1&parent_origin=${window.location.origin}`}
        title="Transport Assistant"
        style={{
          width: "100%",
          maxWidth: "420px",
          height: "min(720px, 100dvh)",
          border: "none",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}
      />
    </div>
  );
};

export default Chatbot;
