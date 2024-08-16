import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Error from "./pages/404";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Error />
  </StrictMode>,
);
