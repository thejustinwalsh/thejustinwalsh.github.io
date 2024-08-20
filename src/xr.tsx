import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import XR from "./pages/xr";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <XR />
  </StrictMode>,
);
