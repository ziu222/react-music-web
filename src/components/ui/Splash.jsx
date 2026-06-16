import { useState, useEffect } from "react";
import { C, G } from "../../constants/theme";

export default function Splash({ onDone }) {
  const [step, setStep] = useState(0);
  const [prog, setProg] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 200);
    const t2 = setTimeout(() => setStep(2), 700);
    const iv = setInterval(() => {
      setProg(p => {
        if (p >= 100) { clearInterval(iv); setTimeout(onDone, 350); return 100; }
        return Math.min(100, p + 3 + Math.random() * 5);
      });
    }, 60);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(iv); };
  }, [onDone]);

  const label =
    prog < 30 ? "Đang tải tài nguyên..." :
    prog < 65 ? "Đang chuẩn bị thư viện..." :
    prog < 95 ? "Sắp xong..." : "Chào mừng!";

  return (
    <div
      style={{
        background: "#141010",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        transition: "opacity 0.4s",
        opacity: prog >= 100 ? 0 : 1,
      }}
    >
      {/* Logo */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C[500]}, ${G[400]})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: step >= 1 ? "scale(1)" : "scale(0)",
            transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow: step >= 2 ? `0 0 30px ${C[500]}50` : "none",
            fontSize: 28,
            color: "#fff",
            animation: step >= 2 ? "pulse 1.5s infinite" : "none",
          }}
        >
          ♪
        </div>

        {step >= 2 && (
          <div
            style={{
              position: "absolute",
              inset: -10,
              borderRadius: "50%",
              border: `2px solid ${C[500]}25`,
              animation: "orbit 3s linear infinite",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -3,
                left: "50%",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C[500],
              }}
            />
          </div>
        )}
      </div>

      {/* Text */}
      <div
        style={{
          textAlign: "center",
          opacity: step >= 1 ? 1 : 0,
          transition: "opacity 0.4s 0.15s",
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 500, color: "#ede5dd", letterSpacing: -0.5 }}>
          Melodies
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
          Không gian âm nhạc của bạn
        </div>
      </div>

      {/* Progress */}
      <div style={{ width: 180, opacity: step >= 2 ? 1 : 0, transition: "opacity 0.3s" }}>
        <div
          style={{
            height: 3,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(prog, 100)}%`,
              background: `linear-gradient(90deg, ${C[500]}, ${G[400]})`,
              borderRadius: 2,
              transition: "width 0.1s",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.25)",
            textAlign: "center",
            marginTop: 6,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
