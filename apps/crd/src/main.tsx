import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@commutr/ui/styles/commutr-variables.css";
import "@commutr/ui/styles/base.css";
import { AppProviders } from "./app/providers";
import { App } from "./app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
