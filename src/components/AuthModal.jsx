import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { C, TEXT } from "../constants/theme";

const SOCIAL_PROVIDERS = [
  { id: "google", label: "Continue with Google", mark: "G", color: "#fff" },
  { id: "facebook", label: "Continue with Facebook", mark: "f", color: "#1877f2" },
  { id: "apple", label: "Continue with Apple", mark: "", color: "#fff" },
];

function Field({ label, type = "text", value, onChange, error, placeholder, autoComplete }) {
  return (
    <div style={{ marginBottom: error ? 6 : 2 }}>
      <label style={{
        display: "block",
        fontSize: 11,
        fontWeight: 700,
        color: TEXT.secondary,
        marginBottom: 6,
        letterSpacing: 0.4,
        textTransform: "uppercase",
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          height: 44,
          background: "rgba(255,255,255,0.07)",
          border: `1.5px solid ${error ? "#ef4444" : "rgba(255,255,255,0.12)"}`,
          borderRadius: 6,
          padding: "0 14px",
          color: TEXT.primary,
          fontSize: 13,
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.15s, background 0.15s",
        }}
        onFocus={e => {
          e.target.style.borderColor = error ? "#ef4444" : C[500];
          e.target.style.background = "rgba(255,255,255,0.09)";
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? "#ef4444" : "rgba(255,255,255,0.12)";
          e.target.style.background = "rgba(255,255,255,0.07)";
        }}
      />
      {error && (
        <div style={{
          fontSize: 11,
          color: "#ef4444",
          marginTop: 4,
          marginBottom: 4,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

function SocialButton({ provider, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(provider)}
      style={{
        width: "100%",
        height: 42,
        borderRadius: 9999,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.045)",
        color: TEXT.primary,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontSize: 13,
        fontWeight: 700,
        transition: "background 0.15s, border-color 0.15s, transform 0.15s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.045)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <span style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: provider.color,
        color: provider.id === "facebook" ? "#fff" : "#111",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: provider.id === "facebook" ? 17 : 12,
        fontWeight: 800,
        lineHeight: 1,
        fontFamily: provider.id === "apple" ? "serif" : "inherit",
      }}>
        {provider.mark}
      </span>
      {provider.label}
    </button>
  );
}

function AuthDivider({ label }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      margin: "18px 0 14px",
      color: TEXT.tertiary,
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    }}>
      <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
      {label}
      <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}

function SocialStack({ onSocial }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {SOCIAL_PROVIDERS.map(provider => (
        <SocialButton key={provider.id} provider={provider} onClick={onSocial} />
      ))}
    </div>
  );
}

function TermsModal({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2100,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        animation: "fadeIn 140ms ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "min(680px, 88vh)",
          overflow: "hidden",
          background: "#1b1818",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          boxShadow: "rgba(0,0,0,0.72) 0px 24px 64px",
          animation: "authModalIn 190ms cubic-bezier(0.2,0,0,1)",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: TEXT.primary }}>Terms of Service</div>
            <div style={{ fontSize: 12, color: TEXT.secondary, marginTop: 3 }}>Melodies account preview</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terms"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.08)",
              color: TEXT.primary,
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>
        <div style={{
          padding: 20,
          overflowY: "auto",
          maxHeight: "calc(min(680px, 88vh) - 140px)",
          color: TEXT.secondary,
          fontSize: 13,
          lineHeight: 1.65,
        }}>
          <p style={{ marginBottom: 12 }}>
            This frontend preview demonstrates how Melodies can present legal information before account creation.
            It does not create a real account or connect to a backend service.
          </p>
          <p style={{ marginBottom: 12 }}>
            By creating an account, users agree to use Melodies for personal listening, playlist management,
            library browsing, and music discovery features shown in the app.
          </p>
          <p style={{ marginBottom: 12 }}>
            Future production logic should include real authentication, privacy controls, data deletion,
            provider policies for Google/Facebook/Apple sign-in, and consent logging.
          </p>
          <p>
            The interface should remain clear: terms are readable, the agreement checkbox is explicit,
            and the user can return to registration without losing form context.
          </p>
        </div>
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          padding: "14px 20px 18px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              borderRadius: 9999,
              padding: "10px 18px",
              background: C[500],
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthModal({ mode, onClose, onAuth }) {
  const [tab, setTab] = useState(mode);
  const [flow, setFlow] = useState("auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") {
        if (termsOpen) setTermsOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, termsOpen]);

  const clearErr = key => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const switchTab = nextTab => {
    setTab(nextTab);
    setFlow("auth");
    setErrors({});
    setResetSent(false);
    setPassword("");
    setConfirmPw("");
  };

  const validateEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const validateAuth = () => {
    const nextErrors = {};
    if (tab === "register" && !name.trim()) nextErrors.name = "Name is required";
    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!validateEmail(email)) nextErrors.email = "Enter a valid email";
    if (!password) nextErrors.password = "Password is required";
    else if (password.length < 6) nextErrors.password = "Use at least 6 characters";
    if (tab === "register") {
      if (!confirmPw) nextErrors.confirmPw = "Confirm your password";
      else if (confirmPw !== password) nextErrors.confirmPw = "Passwords do not match";
      if (!acceptedTerms) nextErrors.terms = "Accept the terms to continue";
    }
    return nextErrors;
  };

  const handleSubmit = event => {
    event.preventDefault();
    const nextErrors = validateAuth();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (tab === "register") {
        setFlow("success");
        return;
      }
      onAuth({ email: email.trim(), name: name.trim() });
    }, 350);
  };

  const handleForgotSubmit = event => {
    event.preventDefault();
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!validateEmail(email)) nextErrors.email = "Enter a valid email";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setResetSent(true);
    }, 350);
  };

  const handleSocial = provider => {
    setErrors({});
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (tab === "register") {
        setFlow("success");
        setEmail(`${provider.id}@melodies.local`);
        return;
      }
      onAuth({ email: `${provider.id}@melodies.local`, provider: provider.id });
    }, 260);
  };

  const completeRegister = () => {
    onAuth({
      email: email.trim() || "listener@melodies.local",
      name: name.trim(),
    });
  };

  const title =
    flow === "forgot"
      ? "Reset your password"
      : flow === "success"
        ? "Account ready"
        : tab === "login"
          ? "Log in to Melodies"
          : "Create your Melodies account";

  const subtitle =
    flow === "forgot"
      ? "Enter your email and we will send reset instructions."
      : flow === "success"
        ? "Your profile is ready for playlists, library saves, and personalized discovery."
        : tab === "login"
          ? "Pick up your playlists and recently played tracks."
          : "Start saving tracks and building your music library.";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn 140ms ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: flow === "success" ? 450 : 430,
          maxHeight: "calc(100vh - 32px)",
          background: "#181818",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "28px 34px 24px",
          boxShadow: "rgba(0,0,0,0.72) 0px 24px 64px",
          animation: "authModalIn 190ms cubic-bezier(0.2,0,0,1)",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.22) transparent",
        }}
      >
        <div style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(circle at top left, ${C[500]}24, transparent 34%), radial-gradient(circle at bottom right, rgba(30,215,96,0.13), transparent 30%)`,
        }} />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            zIndex: 1,
            background: "rgba(255,255,255,0.07)",
            border: "none",
            color: TEXT.secondary,
            fontSize: 20,
            lineHeight: 1,
            cursor: "pointer",
            padding: "2px 8px",
            borderRadius: 9999,
            transition: "color 0.15s, background 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = TEXT.primary;
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = TEXT.secondary;
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          }}
        >
          ×
        </button>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: "#1f1713",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              marginBottom: 12,
              boxShadow: `0 0 0 2px ${C[600]}55`,
            }}>
              <img src={logo} alt="Melodies" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: TEXT.primary, lineHeight: 1.25 }}>
              {title}
            </div>
            <div style={{
              maxWidth: 330,
              margin: "7px auto 0",
              fontSize: 12,
              lineHeight: 1.5,
              color: TEXT.secondary,
            }}>
              {subtitle}
            </div>
          </div>

          {flow === "success" ? (
            <div style={{ textAlign: "center", animation: "slideUp 0.24s ease" }}>
              <div style={{
                width: 86,
                height: 86,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#1ed760,#f97316)",
                color: "#0f0c0c",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 38,
                fontWeight: 900,
                marginBottom: 18,
                boxShadow: "rgba(249,115,22,0.32) 0px 18px 42px",
              }}>
                ✓
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                marginBottom: 22,
              }}>
                {["Save songs", "Build playlists", "Discover mixes"].map(label => (
                  <div
                    key={label}
                    style={{
                      minHeight: 62,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.055)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 8,
                      color: TEXT.primary,
                      fontSize: 12,
                      fontWeight: 700,
                      lineHeight: 1.25,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={completeRegister}
                style={{
                  width: "100%",
                  height: 48,
                  border: "none",
                  borderRadius: 9999,
                  background: C[500],
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Go to Home
              </button>
            </div>
          ) : flow === "forgot" ? (
            <form onSubmit={handleForgotSubmit} noValidate style={{ animation: "slideUp 0.22s ease" }}>
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={value => { setEmail(value); clearErr("email"); setResetSent(false); }}
                error={errors.email}
                placeholder="name@example.com"
                autoComplete="email"
              />
              {resetSent && (
                <div style={{
                  margin: "0 0 14px",
                  borderRadius: 8,
                  background: "rgba(30,215,96,0.12)",
                  border: "1px solid rgba(30,215,96,0.24)",
                  color: "#86efac",
                  fontSize: 12,
                  lineHeight: 1.45,
                  padding: "10px 12px",
                }}>
                  Reset instructions are ready for this email in the frontend preview.
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: 48,
                  border: "none",
                  borderRadius: 9999,
                  background: C[500],
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
              <button
                type="button"
                onClick={() => { setFlow("auth"); setErrors({}); setResetSent(false); }}
                style={{
                  width: "100%",
                  marginTop: 12,
                  border: "none",
                  background: "transparent",
                  color: TEXT.primary,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Back to login
              </button>
            </form>
          ) : (
            <>
              <div style={{
                display: "flex",
                borderRadius: 9999,
                background: "rgba(255,255,255,0.05)",
                padding: 3,
                marginBottom: 18,
              }}>
                {[["login", "Log in"], ["register", "Register"]].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchTab(key)}
                    style={{
                      flex: 1,
                      height: 34,
                      border: "none",
                      borderRadius: 9999,
                      background: tab === key ? C[500] : "transparent",
                      color: tab === key ? "#fff" : TEXT.secondary,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div style={{
                  overflow: "hidden",
                  maxHeight: tab === "register" ? 86 : 0,
                  opacity: tab === "register" ? 1 : 0,
                  transition: "max-height 220ms cubic-bezier(0.2,0,0,1), opacity 180ms ease",
                }}>
                  <Field
                    label="Name"
                    value={name}
                    onChange={value => { setName(value); clearErr("name"); }}
                    error={errors.name}
                    placeholder="Nghia"
                    autoComplete="name"
                  />
                </div>
                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={value => { setEmail(value); clearErr("email"); }}
                  error={errors.email}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={value => { setPassword(value); clearErr("password"); clearErr("confirmPw"); }}
                  error={errors.password}
                  placeholder="••••••••"
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                />

                <div style={{
                  overflow: "hidden",
                  maxHeight: tab === "register" ? 110 : 0,
                  opacity: tab === "register" ? 1 : 0,
                  transition: "max-height 240ms cubic-bezier(0.2,0,0,1), opacity 200ms ease",
                }}>
                  <Field
                    label="Confirm password"
                    type="password"
                    value={confirmPw}
                    onChange={value => { setConfirmPw(value); clearErr("confirmPw"); }}
                    error={errors.confirmPw}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                {tab === "login" ? (
                  <div style={{ textAlign: "right", margin: "-2px 0 14px" }}>
                    <button
                      type="button"
                      onClick={() => { setFlow("forgot"); setErrors({}); }}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: TEXT.primary,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                ) : (
                  <div style={{ margin: "-2px 0 14px" }}>
                    <label style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 9,
                      color: TEXT.secondary,
                      fontSize: 12,
                      lineHeight: 1.45,
                      cursor: "pointer",
                    }}>
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={e => {
                          setAcceptedTerms(e.target.checked);
                          clearErr("terms");
                        }}
                        style={{ marginTop: 2, accentColor: C[500] }}
                      />
                      <span>
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={event => { event.preventDefault(); setTermsOpen(true); }}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: TEXT.primary,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 800,
                            textDecoration: "underline",
                            textUnderlineOffset: 2,
                          }}
                        >
                          Terms of Service
                        </button>
                      </span>
                    </label>
                    {errors.terms && (
                      <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>
                        {errors.terms}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: 48,
                    border: "none",
                    borderRadius: 9999,
                    background: C[500],
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: loading ? "default" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    transition: "background 0.15s, opacity 0.15s, transform 0.1s",
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C[600]; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C[500]; }}
                >
                  {loading ? "Processing..." : tab === "login" ? "Log in" : "Create account"}
                </button>
              </form>

              <AuthDivider label="or continue with" />
              <SocialStack onSocial={handleSocial} />

              <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: TEXT.secondary }}>
                {tab === "login" ? (
                  <>
                    New to Melodies?{" "}
                    <button
                      type="button"
                      onClick={() => switchTab("register")}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: TEXT.primary,
                        fontWeight: 800,
                        cursor: "pointer",
                        textDecoration: "underline",
                        textUnderlineOffset: 2,
                        textDecorationColor: "rgba(255,255,255,0.28)",
                      }}
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchTab("login")}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: TEXT.primary,
                        fontWeight: 800,
                        cursor: "pointer",
                        textDecoration: "underline",
                        textUnderlineOffset: 2,
                        textDecorationColor: "rgba(255,255,255,0.28)",
                      }}
                    >
                      Log in
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
    </div>
  );
}
