import { useState, useEffect } from "react";

/**
 * Extract dominant vibrant color from an image URL via Canvas.
 * Returns a hex string, or null on failure (CORS block, no URL, etc).
 */
export function extractDominantColor(imageUrl) {
  return new Promise((resolve) => {
    if (!imageUrl) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const SIZE = 40;
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue;
          if (colorSaturation(r, g, b) < 0.1) continue;
          rSum += r; gSum += g; bSum += b; count++;
        }
        if (count === 0) return resolve(null);
        resolve(toHex(
          Math.round(rSum / count),
          Math.round(gSum / count),
          Math.round(bSum / count),
        ));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}

function colorSaturation(r, g, b) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  return max === 0 ? 0 : (max - min) / max;
}

function toHex(r, g, b) {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

/** Hook — resolves once per imageUrl change, falls back to `fallback` hex */
export function useImageAccent(imageUrl, fallback = "#f97316") {
  const [accent, setAccent] = useState(fallback);
  useEffect(() => {
    if (!imageUrl) { setAccent(fallback); return; }
    let cancelled = false;
    extractDominantColor(imageUrl).then(color => {
      if (!cancelled) setAccent(color ?? fallback);
    });
    return () => { cancelled = true; };
  }, [imageUrl, fallback]);
  return accent;
}
