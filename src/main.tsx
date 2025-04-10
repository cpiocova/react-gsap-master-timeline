import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TimelineProvider } from "@lib/TimelineProvider";
import App from "./example/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TimelineProvider>
      <App />
    </TimelineProvider>
  </StrictMode>
);
