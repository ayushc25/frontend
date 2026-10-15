import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Chat from "./Chat";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
const TOKEN_KEY = "companion_auth_token";
const THEME_KEY = "companion_ui_theme";

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

function ButterflyLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="brand-butterfly">
      <defs>
        <linearGradient id="butterflyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4b72" />
          <stop offset="50%" stopColor="#ff7b54" />
          <stop offset="100%" stopColor="#ffb26b" />
        </linearGradient>
      </defs>
      <path
        d="M12 4c.8 0 1.5.7 1.5 1.5v13c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5v-13C10.5 4.7 11.2 4 12 4z"
        fill="url(#butterflyGrad)"
      />
      <path
        d="M12 6c2-4 9-3 9 4 0 5-6 8-9 8V6z"
        fill="url(#butterflyGrad)"
        fillOpacity="0.85"
      />
      <path
        d="M12 6c-2-4-9-3-9 4 0 5 6 8 9 8V6z"
        fill="url(#butterflyGrad)"
        fillOpacity="0.85"
      />
      <circle cx="9.5" cy="4" r="1" fill="url(#butterflyGrad)" />
      <circle cx="14.5" cy="4" r="1" fill="url(#butterflyGrad)" />
    </svg>
  );
}

function AuthTabs({ authView, setAuthView, pendingEmail, user }) {
  return (
    <div className="auth-copy">
      <div className="brand-badge">
        <ButterflyLogo size={28} />
        <span>Titli Companion</span>
      </div>

      <div className="eyebrow-chip">
        <SparklesIcon />
        <span>Intimate & Empathetic Companion</span>
      </div>

      <h1>Your Private Sanctuary for Conversation.</h1>
      <p>
        Meet Titli — a warm, charming companion who listens, responds with heart,
        and remembers your context across private sessions.
      </p>

      <div className="feature-grid">
        <article className="feature-card">
          <div className="feature-icon">🔒</div>
          <div className="feature-content">
            <h2>Private & Secure</h2>
            <p>Protected by cryptographic PBKDF2 password hashing & secure session tokens.</p>
          </div>
        </article>
        <article className="feature-card">
          <div className="feature-icon">💬</div>
          <div className="feature-content">
            <h2>Persistent Sessions</h2>
            <p>Your conversation history remains organized across desktop and mobile.</p>
          </div>
        </article>
        <article className="feature-card">
          <div className="feature-icon">✨</div>
          <div className="feature-content">
            <h2>Instant Resonance</h2>
            <p>Short, lively, flirty replies tailored to make every chat effortless.</p>
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
}) {
  const [signupForm, setSignupForm] = useState({ email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");

  const panelTitle = useMemo(() => {
    if (authView === "signup") return "Create your account";
    if (authView === "verify") return "Verify your email";
    return "Welcome back";
  }, [authView]);

  const panelSubtitle = useMemo(() => {
    if (authView === "signup") return "Enter your email and choose a password to start chatting immediately.";
    if (authView === "verify") {
      return pendingEmail
        ? `Enter the verification code sent to ${pendingEmail}.`
        : "Finish signup with the verification code from your inbox.";
    }
    return "Log in to resume your private chats with Titli.";
  }, [authView, pendingEmail]);

  return (
    <section className="auth-panel">
      <div className="panel-orbit panel-orbit-one" />
      <div className="panel-orbit panel-orbit-two" />
      <div className="panel-shell">
        <div className="panel-header">
          <div className="mobile-brand-row">
            <ButterflyLogo size={32} />
            <span className="brand-title">Titli Lounge</span>
          </div>
          <p className="eyebrow">Instant Access</p>
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

            <button className="primary-button submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="mini-spinner" /> Sending code...
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
                  placeholder="Enter your password"
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

            <button className="primary-button submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="mini-spinner" /> Logging in...
                </span>
              ) : (
                "Log In"
              )}
            </button>

            <div className="helper-line">
              First time with Titli?{" "}
              <button type="button" onClick={() => setAuthView("signup")}>
                Create an account
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
              Sending to: <strong>{pendingEmail || "your email"}</strong>
            </div>

            <label className="input-group">
              <span className="input-label">Verification Code</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verifyCode}
                onChange={(event) => setVerifyCode(event.target.value)}
                placeholder="Enter 6-digit code"
                required
                className="code-input"
              />
            </label>

            <button
              className="primary-button submit-btn"
              type="submit"
              disabled={loading || !pendingEmail}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="mini-spinner" /> Verifying...
                </span>
              ) : (
                "Verify & Enter Lounge"
              )}
            </button>

            <div className="helper-line">
              Need to change your email?{" "}
              <button type="button" onClick={() => setAuthView("signup")}>
                Back to sign up
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState("login");
  const [pendingEmail, setPendingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [booting, setBooting] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
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

  const handleSignup = async ({ email, password }) => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await api.post("/auth/signup", { email, password });
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
    setToken("");
    setUser(null);
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

  if (booting) {
    return (
      <main className="app-shell loading-shell" data-theme={theme}>
        <div className="loading-card">
          <ButterflyLogo size={44} />
          <div className="pulse-dot" />
          <p className="loading-text">Opening your private lounge...</p>
        </div>
      </main>
    );
  }

  if (user && token) {
    return (
      <Chat
        api={api}
        token={token}
        user={user}
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
          <ButterflyLogo size={28} />
          <span className="brand-text">Titli Lounge</span>
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
          setAuthView={setAuthView}
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
          setAuthView={setAuthView}
        />
      </div>
    </main>
  );
}
