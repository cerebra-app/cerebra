import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Apply saved theme before render
const saved = localStorage.getItem("cerebra_theme");
if (saved === "dark") document.documentElement.classList.add("dark");
else if (saved === "light") document.documentElement.classList.remove("dark");
else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
