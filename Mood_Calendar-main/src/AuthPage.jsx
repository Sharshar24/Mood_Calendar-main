import React, { useState } from "react";

const AuthPage = ({ onLogin }) => {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setSuccess("");
    setForm({ username: "", email: "", password: "", confirm: "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "register") {
      if (!form.username || !form.email || !form.password || !form.confirm)
        return setError("All fields are required.");
      if (form.password !== form.confirm)
        return setError("Passwords do not match.");
      if (form.password.length < 6)
        return setError("Password must be at least 6 characters.");
    } else {
      if (!form.email || !form.password)
        return setError("Username/Email and password are required.");
    }

    setLoading(true);
    try {
      const endpoint = mode === "register" ? "/api/register" : "/api/login";
      const body =
        mode === "register"
          ? { username: form.username, email: form.email, password: form.password }
          : { email: form.email, password: form.password };

      const res = await fetch(`https://mood-calendar-backend-main-1.onrender.com${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSuccess(data.message);
        setTimeout(() => onLogin(data.token, data.user), 800);
      }
    } catch {
      setError("Cannot connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background blobs */}
      <div className="auth-blob blob1" />
      <div className="auth-blob blob2" />
      <div className="auth-blob blob3" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">🧠</span>
          <h1 className="auth-title">VibeVault</h1>
          <p className="auth-subtitle">Secure Your Feelings, One Day at a Time.</p>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => switchMode("register")}
            type="button"
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={submit} noValidate>
          {mode === "register" && (
            <div className="auth-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={form.username}
                onChange={handle}
                autoComplete="username"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email or Username</label>
            <input
              id="email"
              name="email"
              type="text"
              placeholder="Enter your email or username"
              value={form.email}
              onChange={handle}
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder={mode === "register" ? "Min 6 characters" : "Enter your password"}
              value={form.password}
              onChange={handle}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
          </div>

          {mode === "register" && (
            <div className="auth-field">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={handle}
                autoComplete="new-password"
              />
            </div>
          )}

          {error   && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "register"
              ? "🚀 Create Account"
              : "🔓 Login"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? (
            <>New here?{" "}
              <span onClick={() => switchMode("register")}>Create an account</span>
            </>
          ) : (
            <>Already have an account?{" "}
              <span onClick={() => switchMode("login")}>Login</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
