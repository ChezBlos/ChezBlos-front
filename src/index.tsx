// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("app") as HTMLElement).render(
  // StrictMode désactivé temporairement pour éviter les requêtes doublées en dev
  // <StrictMode>
    <App />
  // </StrictMode>,
);
