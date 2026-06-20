import { useState, useEffect, useRef } from "react";

/**
 * Returns true after `delay` ms of `active` being true.
 * Returns false only after `minDuration` ms have passed since it became visible.
 * Prevents skeleton flash on fast loads and jarring disappearance on slow ones.
 */
export default function useDelayedVisible(active, { delay = 150, minDuration = 250 } = {}) {
  const [visible, setVisible] = useState(false);
  const startedAt = useRef(null);

  useEffect(() => {
    let showTimer = null;
    let hideTimer = null;

    if (active) {
      showTimer = setTimeout(() => {
        setVisible(true);
        startedAt.current = Date.now();
      }, delay);
    } else {
      if (startedAt.current !== null) {
        const elapsed = Date.now() - startedAt.current;
        const wait = Math.max(0, minDuration - elapsed);
        hideTimer = setTimeout(() => {
          setVisible(false);
          startedAt.current = null;
        }, wait);
      }
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [active, delay, minDuration]);

  return visible;
}
