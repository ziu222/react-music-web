import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import styles from "./HorizontalShelf.module.css";

export default function HorizontalShelf({ children }) {
  const ref = useRef(null);
  const [hov, setHov] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, children]);

  const nudge = (dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth - 140, 240), behavior: "smooth" });
  };

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        ref={ref}
        className="hscroll"
        onScroll={update}
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          padding: "4px 0 8px",
          scrollbarWidth: "none",
          scrollSnapType: "x proximity",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>
      <button
        type="button"
        aria-label="Cuộn sang trái"
        onClick={() => nudge(-1)}
        className={`hs-arrow${hov && canLeft ? " is-visible" : ""}`}
        style={{ left: 6 }}
      >
        <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 12 }} />
      </button>
      <button
        type="button"
        aria-label="Cuộn sang phải"
        onClick={() => nudge(1)}
        className={`hs-arrow${hov && canRight ? " is-visible" : ""}`}
        style={{ right: 6 }}
      >
        <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} />
      </button>
    </div>
  );
}
