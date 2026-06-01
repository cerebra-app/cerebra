import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    // Also scroll any overflow containers
    document
      .querySelectorAll(".overflow-y-auto, .scrollbar-hide")
      .forEach((el) => {
        el.scrollTo({ top: 0, behavior: "instant" });
      });
  }, [pathname]);
}
