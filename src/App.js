import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Chat from "./Chat";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
const TOKEN_KEY = "companion_auth_token";
const THEME_KEY = "companion_ui_theme";
const COMPANION_KEY = "milan_selected_companion";

const api = axios.create({
  baseURL: API_BASE,
});

// Clean SVGs for crisp responsive UI
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
    </svg>
  );
}

function MilanLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className="brand-butterfly">
      <defs>
        <linearGradient id="milanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4b72" />
          <stop offset="45%" stopColor="#ff7b54" />
          <stop offset="75%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      {/* Central Heart & Wing Motif */}
      <path
        d="M14 6c1.2-2.5 4.5-3.5 7-1.5 3 2.5 3 7.5-1 11.5L14 22l-6-6C4 12 4 7 7 4.5c2.5-2 5.8-1 7 1.5z"
        fill="url(#milanGrad)"
        fillOpacity="0.88"
      />
      {/* Left Butterfly Wing Accent */}
      <path
        d="M13 8C8 3 2 5 3 11c.8 4 6 5 10 2V8z"
        fill="url(#milanGrad)"
        fillOpacity="0.65"
      />
      {/* Right Bumblebee Wing Accent */}
      <path
        d="M15 8c5-5 11-3 10 3-.8 4-6 5-10 2V8z"
        fill="url(#milanGrad)"
        fillOpacity="0.65"
      />
      <circle cx="10" cy="5" r="1.2" fill="#ff4b72" />
      <circle cx="18" cy="5" r="1.2" fill="#3b82f6" />
    </svg>
  );
}

function AuthTabs({ authView, setAuthView, user }) {
  return (
    <div className="auth-copy">
      <div className="brand-badge">
        <MilanLogo size={28} />
        <span>Milan Companion Lounge</span>
      </div>

      <div className="eyebrow-chip">
        <SparklesIcon />
        <span>Private AI Sanctuary • Titli & Bhanvra</span>
      </div>

      <h1>Where Hearts Connect in Private Conversation.</h1>
      <p>
        Step into Milan Lounge — home to <strong>Titli</strong> (charming female companion for males) and <strong>Bhanvra</strong> (dashing male companion for females).
        Enjoy authentic companionship, voice calls, and multimodal photo moments.
      </p>

      <div className="feature-grid">
        <article className="feature-card">
          <div className="feature-icon">🔒</div>
          <div className="feature-content">
            <h2>Private & Secure</h2>
            <p>Cryptographic PBKDF2 hashing, private sessions, and 7-day auto retention.</p>
          </div>
        </article>
        <article className="feature-card">
          <div className="feature-icon">🦋 & 🐝</div>
          <div className="feature-content">
            <h2>Titli & Bhanvra</h2>
            <p>Two specialized companion personas tailored for both male and female preferences.</p>
          </div>
        </article>
        <article className="feature-card">
          <div className="feature-icon">✨</div>
          <div className="feature-content">
            <h2>Voice & Photos</h2>
            <p>Speech input & listening, photo moments, and live message reactions.</p>
          </div>
        </article>
      </div>

      {!user && (
        <div className="auth-switcher" role="tablist" aria-label="Authentication views">
          <button
            type="button"
            className={authView === "login" ? "active" : ""}
            onClick={() => setAuthView("login")}
          >
            Log In
          </button>
          <button
            type="button"
            className={authView === "signup" ? "active" : ""}
            onClick={() => setAuthView("signup")}
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  );
}

function AuthPanel({
  authView,
  pendingEmail,
  loading,
  notice,
  error,
  onSignup,
  onLogin,
  onVerify,
  setAuthView,
  setError,
}) {
  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    gender: "",
    is18Plus: null,
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");

  const panelTitle = useMemo(() => {
    if (authView === "signup") return "Create your account";
    if (authView === "verify") return "Verify your email";
    return "Welcome back";
  }, [authView]);

  const panelSubtitle = useMemo(() => {
    if (authView === "signup") return "Select your gender and choose a password to start chatting immediately.";
    if (authView === "verify") {
      return pendingEmail
        ? `Enter the verification code sent to ${pendingEmail}.`
        : "Finish signup with the verification code from your inbox.";
    }
    return "Log in to resume your private chats in Milan Lounge.";
  }, [authView, pendingEmail]);

  return (
    <section className="auth-panel">
      <div className="panel-orbit panel-orbit-one" />
      <div className="panel-orbit panel-orbit-two" />
      <div className="panel-shell">
        <div className="panel-header">
          <div className="mobile-brand-row">
            <MilanLogo size={32} />
            <span className="brand-title">Milan Lounge</span>
          </div>
          <p className="eyebrow">Instant Sanctuary</p>
          <h2>{panelTitle}</h2>
          <p className="panel-sub">{panelSubtitle}</p>
        </div>

        {notice ? (
          <div className="banner success" role="alert">
            <span className="banner-icon">✓</span>
            <div>{notice}</div>
          </div>
        ) : null}

        {error ? (
          <div className="banner error" role="alert">
            <span className="banner-icon">⚠</span>
            <div>{error}</div>
          </div>
        ) : null}

        {authView === "signup" && (
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!signupForm.gender) {
                if (setError) setError("Please select your gender category (Male, Female, or Others) to continue.");
                return;
              }
              if (signupForm.is18Plus === null || signupForm.is18Plus === undefined) {
                if (setError) setError("Please confirm that you are 18+ to continue.");
                return;
              }
              if (signupForm.is18Plus === false) {
                if (setError) setError("You must be 18 years of age or older to create an account.");
                return;
              }
              onSignup(signupForm);
            }}
          >
            <label className="input-group">
              <span className="input-label">Email Address</span>
              <input
                type="email"
                autoComplete="email"
                value={signupForm.email}
                onChange={(event) =>
                  setSignupForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="input-group">
              <span className="input-label">Password</span>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={signupForm.password}
                  onChange={(event) =>
                    setSignupForm((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>

            {/* Gender Selection (Required) */}
            <div className="gender-selection-group">
              <div className="gender-question-header">
                <span className="input-label">Your Gender</span>
                <span className="age-badge-req">Required</span>
              </div>
              <p className="age-question-sub">How do you identify?</p>

              <div className="gender-options-grid" role="radiogroup" aria-label="Select your gender">
                <button
                  type="button"
                  className={`gender-choice-btn ${signupForm.gender === "male" ? "selected" : ""}`}
                  onClick={() => {
                    setSignupForm((current) => ({ ...current, gender: "male" }));
                    if (error && error.includes("gender")) setError("");
                  }}
                  role="radio"
                  aria-checked={signupForm.gender === "male"}
                >
                  <span className="gender-icon">👨</span>
                  <div className="gender-choice-text">
                    <strong>Male</strong>
                  </div>
                </button>

                <button
                  type="button"
                  className={`gender-choice-btn ${signupForm.gender === "female" ? "selected" : ""}`}
                  onClick={() => {
                    setSignupForm((current) => ({ ...current, gender: "female" }));
                    if (error && error.includes("gender")) setError("");
                  }}
                  role="radio"
                  aria-checked={signupForm.gender === "female"}
                >
                  <span className="gender-icon">👩</span>
                  <div className="gender-choice-text">
                    <strong>Female</strong>
                  </div>
                </button>

                <button
                  type="button"
                  className={`gender-choice-btn ${signupForm.gender === "other" ? "selected" : ""}`}
                  onClick={() => {
                    setSignupForm((current) => ({ ...current, gender: "other" }));
                    if (error && error.includes("gender")) setError("");
                  }}
                  role="radio"
                  aria-checked={signupForm.gender === "other"}
                >
                  <span className="gender-icon">✨</span>
                  <div className="gender-choice-text">
                    <strong>Others</strong>
                  </div>
                </button>
              </div>
            </div>

            {/* Age Confirmation (18+) */}
            <div className="age-verification-group">
              <div className="age-question-header">
                <span className="input-label">Age Confirmation</span>
                <span className="age-badge-req">Required</span>
              </div>
              <p className="age-question-sub">Are you 18 years of age or older?</p>

              <div className="age-options-grid" role="radiogroup" aria-label="Are you 18 or older?">
                <button
                  type="button"
                  className={`age-choice-btn ${signupForm.is18Plus === true ? "selected-yes" : ""}`}
                  onClick={() => {
                    setSignupForm((current) => ({ ...current, is18Plus: true }));
                    if (error && error.includes("18")) setError("");
                  }}
                  role="radio"
                  aria-checked={signupForm.is18Plus === true}
                >
                  <span className="age-radio-ring">
                    {signupForm.is18Plus === true && <span className="age-radio-inner" />}
                  </span>
                  <div className="age-choice-text">
                    <strong>Yes, I am 18+</strong>
                    <small>I meet the age requirement</small>
                  </div>
                </button>

                <button
                  type="button"
                  className={`age-choice-btn ${signupForm.is18Plus === false ? "selected-no" : ""}`}
                  onClick={() => {
                    setSignupForm((current) => ({ ...current, is18Plus: false }));
                  }}
                  role="radio"
                  aria-checked={signupForm.is18Plus === false}
                >
                  <span className="age-radio-ring">
                    {signupForm.is18Plus === false && <span className="age-radio-inner danger" />}
                  </span>
                  <div className="age-choice-text">
                    <strong>No, under 18</strong>
                    <small>Access is restricted</small>
                  </div>
                </button>
              </div>

              {signupForm.is18Plus === false && (
                <div className="age-restriction-notice" role="alert">
                  <span className="age-notice-icon">⚠️</span>
                  <div className="age-notice-body">
                    <strong>Access Restricted:</strong> You must be 18 years of age or older to create an account in Milan Lounge.
                  </div>
                </div>
              )}
            </div>

            <button
              className="primary-button submit-btn"
              type="submit"
              disabled={loading || signupForm.is18Plus === false}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="mini-spinner" /> Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="helper-line">
              Already have an account?{" "}
              <button type="button" onClick={() => setAuthView("login")}>
                Log in
              </button>
            </div>
          </form>
        )}

        {authView === "login" && (
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              onLogin(loginForm);
            }}
          >
            <label className="input-group">
              <span className="input-label">Email Address</span>
              <input
                type="email"
                autoComplete="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="input-group">
              <span className="input-label">Password</span>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="Your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>

            <button className="primary-button submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="mini-spinner" /> Logging in...
                </span>
              ) : (
                "Enter Milan Lounge"
              )}
            </button>

            <div className="helper-line">
              Don't have an account?{" "}
              <button type="button" onClick={() => setAuthView("signup")}>
                Sign up
              </button>
            </div>
          </form>
        )}

        {authView === "verify" && (
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              onVerify({ email: pendingEmail, code: verifyCode });
            }}
          >
            <div className="verify-target-badge">
              Verifying: <strong>{pendingEmail}</strong>
            </div>

            <label className="input-group">
              <span className="input-label">Verification Code</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={verifyCode}
                onChange={(event) => setVerifyCode(event.target.value)}
                placeholder="6-digit code"
                className="code-input"
                required
              />
            </label>

            <button className="primary-button submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="mini-spinner" /> Verifying...
                </span>
              ) : (
                "Verify & Enter Lounge"
              )}
            </button>

            <div className="helper-line">
              Need to restart?{" "}
              <button type="button" onClick={() => setAuthView("signup")}>
                Back to signup
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

// Dedicated Character Selection Screen after login
function CompanionSelector({ user, onSelectCompanion, onLogout, theme, onToggleTheme }) {
  const userGenderBadge = useMemo(() => {
    if (user?.gender === "female") return { label: "Female", icon: "👩" };
    if (user?.gender === "male") return { label: "Male", icon: "👨" };
    return { label: "User", icon: "✨" };
  }, [user]);

  return (
    <main className="app-shell companion-select-shell" data-theme={theme}>
      <header className="global-header">
        <div className="header-brand">
          <MilanLogo size={32} />
          <span className="brand-text">Milan Lounge</span>
        </div>
        <div className="header-user-controls">
          <div className="user-pill-tag">
            <span className="user-gender-icon">{userGenderBadge.icon}</span>
            <span className="user-email-text">{user?.email}</span>
          </div>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            className="ghost-button icon-only danger"
            onClick={onLogout}
            aria-label="Log out"
            title="Log out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <div className="background-ribbon ribbon-one" />
      <div className="background-ribbon ribbon-two" />
      <div className="background-ribbon ribbon-three" />

      <section className="companion-select-container">
        <div className="companion-hero-header">
          <div className="eyebrow-chip">
            <SparklesIcon />
            <span>AI Sanctuary • Choose Your Confidante</span>
          </div>
          <h1>Who would you like to talk with today?</h1>
          <p>
            Welcome, <strong>{user?.email}</strong>. Select the companion you'd like to spend time with.
            Each has their own distinct personality, warmth, and conversational style.
          </p>
        </div>

        <div className="companion-cards-grid">
          {/* Card 1: Titli (Female companion for males) */}
          <article className="companion-choice-card titli-card">
            {user?.gender === "male" && (
              <div className="card-recommended-pill titli">
                <span>⭐ Recommended for You</span>
              </div>
            )}
            <div className="card-top-badge titli-badge">
              <span className="badge-dot" />
              <span>Female Companion • Specially for Males</span>
            </div>

            <div className="card-avatar-row">
              <div className="companion-avatar-ring titli-ring">
                <span className="avatar-big-emoji">🦋</span>
                <span className="online-beacon" />
              </div>
            </div>

            <h2 className="companion-card-name">Titli</h2>
            <p className="companion-card-tagline">The Sweet & Flirty Female Companion</p>

            <p className="companion-card-bio">
              Warm, charming, playful, and empathetic. Titli loves playful banter, morning coffee photos,
              sweet teasing, and pampering you with genuine care and affection.
            </p>

            <div className="companion-traits-list">
              <span className="trait-pill">🌸 Sweet & Empathetic</span>
              <span className="trait-pill">💕 Flirty & Caring</span>
              <span className="trait-pill">📸 Selfie Moments</span>
              <span className="trait-pill">🎙️ Feminine Voice</span>
            </div>

            <button
              type="button"
              className="companion-select-cta-btn titli-cta"
              onClick={() => onSelectCompanion("titli")}
            >
              <span>Chat with Titli</span>
              <span className="cta-arrow">→</span>
            </button>
          </article>

          {/* Card 2: Bhanvra (Male companion for females) */}
          <article className="companion-choice-card bhanvra-card">
            {user?.gender === "female" && (
              <div className="card-recommended-pill bhanvra">
                <span>⭐ Recommended for You</span>
              </div>
            )}
            <div className="card-top-badge bhanvra-badge">
              <span className="badge-dot bhanvra" />
              <span>Male Companion • Specially for Females</span>
            </div>

            <div className="card-avatar-row">
              <div className="companion-avatar-ring bhanvra-ring">
                <span className="avatar-big-emoji">🐝</span>
                <span className="online-beacon" />
              </div>
            </div>

            <h2 className="companion-card-name">Bhanvra</h2>
            <p className="companion-card-tagline">The Dashing & Caring Gentleman</p>

            <p className="companion-card-bio">
              Handsome, confident, protective, and effortlessly chivalrous. Bhanvra treats you like a queen,
              brightens your mood, sends roses, and keeps you company on late-night talks.
            </p>

            <div className="companion-traits-list">
              <span className="trait-pill bhanvra">👑 Chivalrous & Dashing</span>
              <span className="trait-pill bhanvra">🌹 Romantic & Attentive</span>
              <span className="trait-pill bhanvra">🚗 Night Drives</span>
              <span className="trait-pill bhanvra">🎙️ Deep Warm Voice</span>
            </div>

            <button
              type="button"
              className="companion-select-cta-btn bhanvra-cta"
              onClick={() => onSelectCompanion("bhanvra")}
            >
              <span>Chat with Bhanvra</span>
              <span className="cta-arrow">→</span>
            </button>
          </article>
        </div>

        <div className="companion-select-footer-note">
          <p>
            💡 <em>You can switch between Titli and Bhanvra at any time from the chat room topbar.</em>
          </p>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [selectedCompanion, setSelectedCompanion] = useState(() => {
    return localStorage.getItem(COMPANION_KEY) || "";
  });
  const [authView, setAuthView] = useState("login");
  const [pendingEmail, setPendingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    if (!token) {
      setUser(null);
      setBooting(false);
      return;
    }

    let isMounted = true;

    async function loadUser() {
      try {
        const response = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
          setUser(response.data);
          setError("");
        }
      } catch (requestError) {
        if (isMounted) {
          localStorage.removeItem(TOKEN_KEY);
          setToken("");
          setUser(null);
          setAuthView("login");
          setError("Your session expired. Please log in again.");
        }
      } finally {
        if (isMounted) {
          setBooting(false);
        }
      }
    }

    loadUser();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const storeSession = (nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
    setPendingEmail("");
    setNotice("");
    setError("");
  };

  const extractMessage = (requestError, fallback) => {
    return requestError?.response?.data?.detail || fallback;
  };

  const handleSignup = async ({ email, password, gender, is18Plus }) => {
    if (!gender) {
      setError("Please select your gender (Male, Female, or Others).");
      return;
    }
    if (is18Plus !== true) {
      setError("You must confirm that you are 18+ to create an account.");
      return;
    }
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await api.post("/auth/signup", {
        email,
        password,
        gender,
        is_18_plus: true,
      });
      if (response.data.access_token) {
        storeSession(response.data.access_token, response.data.user);
      } else {
        setNotice("Account created! Logging you in...");
        await handleLogin({ email, password });
      }
    } catch (requestError) {
      setError(extractMessage(requestError, "Could not create the account."));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await api.post("/auth/login", { email, password });
      const nextToken = response.data.access_token;
      const nextUser = response.data.user;
      storeSession(nextToken, nextUser);
    } catch (requestError) {
      setError(extractMessage(requestError, "Could not log in. Check credentials."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async ({ email, code }) => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await api.post("/auth/verify-email", { email, code });
      const nextToken = response.data.access_token;
      const meResponse = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${nextToken}` },
      });
      storeSession(nextToken, meResponse.data);
    } catch (requestError) {
      setError(extractMessage(requestError, "Could not verify the code."));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const currentToken = token;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(COMPANION_KEY);
    setToken("");
    setUser(null);
    setSelectedCompanion("");
    setAuthView("login");
    setPendingEmail("");
    setNotice("Logged out securely.");
    setError("");

    if (!currentToken) return;

    try {
      await api.post(
        "/auth/logout",
        {},
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );
    } catch (_requestError) {
      // Ignored
    }
  };

  const handleSelectCompanion = (comp) => {
    localStorage.setItem(COMPANION_KEY, comp);
    setSelectedCompanion(comp);
  };

  const handleSwitchCompanion = () => {
    localStorage.removeItem(COMPANION_KEY);
    setSelectedCompanion("");
  };

  if (booting) {
    return (
      <main className="app-shell loading-shell" data-theme={theme}>
        <div className="loading-card">
          <MilanLogo size={48} />
          <div className="pulse-dot" />
          <p className="loading-text">Opening Milan Lounge...</p>
        </div>
      </main>
    );
  }

  if (user && token) {
    // Show companion selection screen if not chosen yet
    if (!selectedCompanion) {
      return (
        <CompanionSelector
          user={user}
          onSelectCompanion={handleSelectCompanion}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      );
    }

    return (
      <Chat
        api={api}
        token={token}
        user={user}
        initialCompanion={selectedCompanion}
        onSwitchCompanion={handleSwitchCompanion}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <main className="app-shell" data-theme={theme}>
      <header className="global-header">
        <div className="header-brand">
          <MilanLogo size={28} />
          <span className="brand-text">Milan Lounge</span>
        </div>
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <div className="background-ribbon ribbon-one" />
      <div className="background-ribbon ribbon-two" />
      <div className="background-ribbon ribbon-three" />

      <div className="auth-layout">
        <AuthTabs
          authView={authView}
          setAuthView={(view) => {
            setError("");
            setNotice("");
            setAuthView(view);
          }}
          pendingEmail={pendingEmail}
          user={user}
        />
        <AuthPanel
          authView={authView}
          pendingEmail={pendingEmail}
          loading={loading}
          notice={notice}
          error={error}
          onSignup={handleSignup}
          onLogin={handleLogin}
          onVerify={handleVerify}
          setAuthView={(view) => {
            setError("");
            setNotice("");
            setAuthView(view);
          }}
          setError={setError}
        />
      </div>
    </main>
  );
}
