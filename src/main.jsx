import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Apply saved theme before render
const saved = localStorage.getItem("thala_theme");
if (saved === "dark") {
  document.documentElement.classList.add("dark");
} else if (saved === "light") {
  document.documentElement.classList.remove("dark");
} else {
  // system — respect OS preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark");
  }
}

// Fix mobile viewport height
const setAppHeight = () => {
  document.documentElement.style.setProperty(
    "--app-height",
    `${window.innerHeight}px`
  );
};
setAppHeight();
window.addEventListener("resize", setAppHeight);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
