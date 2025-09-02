import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService";

/** Polished Bootstrap login with role-aware redirect */
export default function Login() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const auth = await AuthService.login(username.trim(), password);
      const home = redirectTo || AuthService.resolveHomePath(auth);
      navigate(home, { replace: true });
    } catch {
      setErr("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(13,110,253,0.12) 0%, rgba(102,16,242,0.12) 100%)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{ width: 460, borderRadius: "1.25rem" }}
      >
        <div className="card-body p-4 p-md-5">
          {/* Brand (no UOK badge) */}
          <div className="text-center mb-3">
            <h1 className="h5 mt-3 mb-1">University of Kelaniya LMS</h1>
            <div className="text-muted">Sign in to continue</div>
          </div>

          {err && (
            <div className="alert alert-danger py-2" role="alert">
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-3">
            {/* Username */}
            <div className="mb-3">
              <label className="form-label small text-muted">Username</label>
              <div className="input-group">
                <span className="input-group-text">👤</span>
                <input
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. john@university.edu"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label small text-muted d-flex justify-content-between">
                <span>Password</span>
                <button
                  type="button"
                  className="btn btn-link p-0 small"
                  onClick={() => setShow((s) => !s)}
                >
                  {show ? "Hide" : "Show"}
                </button>
              </label>
              <div className="input-group">
                <span className="input-group-text">🔒</span>
                <input
                  className="form-control"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <button
              className="btn btn-primary w-100 py-2"
              disabled={loading}
              type="submit"
              style={{ borderRadius: "0.75rem" }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <div className="text-muted small mt-3 text-center">
              You’ll be redirected to your home page based on your role.
            </div>
          </form>
        </div>

        <div className="card-footer bg-white border-0 text-center py-3">
          <span className="text-muted small">© {new Date().getFullYear()} University of Kelaniya</span>
        </div>
      </div>
    </div>
  );
}
