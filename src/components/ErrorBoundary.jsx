import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#161313",
          color: "#ede5dd",
          fontFamily: "-apple-system, 'Segoe UI', system-ui, sans-serif",
          padding: 32,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40 }}>🎵</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Đã xảy ra lỗi</div>
        <div style={{ fontSize: 13, color: "#9a8a80", maxWidth: 360, lineHeight: 1.6 }}>
          Có gì đó không ổn. Thử tải lại trang — nếu vẫn lỗi, hãy liên hệ hỗ trợ.
        </div>
        {this.state.error?.message && (
          <code
            style={{
              fontSize: 11,
              color: "#fb7185",
              background: "rgba(251,113,133,0.08)",
              border: "1px solid rgba(251,113,133,0.2)",
              borderRadius: 6,
              padding: "6px 12px",
              maxWidth: 400,
              overflowX: "auto",
            }}
          >
            {this.state.error.message}
          </code>
        )}
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8,
            background: "#ffb690",
            border: "none",
            borderRadius: 9999,
            padding: "10px 28px",
            fontSize: 13,
            fontWeight: 700,
            color: "#161313",
            cursor: "pointer",
          }}
        >
          Tải lại trang
        </button>
      </div>
    );
  }
}
