import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService";

/** Bootstrap login with role-aware redirect */
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
    } catch (ex) {
      setErr("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm" style={{ width: 420 }}>
        <div className="card-body p-4">
          {/* <div className="d-flex align-items-center gap-2 mb-3">
            <div className="rounded bg-primary-subtle text-primary fw-bold d-grid place-center center" style={{ width: 30, height: 30 }}>
              SL
            </div>
            <h1 className="h5 m-1">University of Kelaniya</h1>
            <br />
            <h1 className="h5 m-0">Sign in</h1>

          </div> */}
          <div className="mb-3"> 
            <div className="mb-3 text-center"> 
            <h1 className="h5 m-1">University of Kelaniya LMS</h1> 
            <h1 className="h5 m-0">Sign in</h1> 
        </div>
          </div>

          {err && <div className="alert alert-danger py-2">{err}</div>}

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label d-flex justify-content-between">
                <span>Password</span>
                <button
                  type="button"
                  className="btn btn-link p-0 small"
                  onClick={() => setShow((s) => !s)}
                >
                  {show ? "Hide" : "Show"}
                </button>
              </label>
              <input
                className="form-control"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button className="btn btn-primary w-100" disabled={loading} type="submit">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="text-muted small mt-3">
            Tip: you’ll be redirected to your home page based on your role.
          </div>
        </div>
      </div>
    </div>
  );
}
