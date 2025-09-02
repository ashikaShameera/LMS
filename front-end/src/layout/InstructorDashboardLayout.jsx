import React from "react";
import { NavLink, Outlet, useParams, useNavigate } from "react-router-dom";
import InstructorService from "../services/InstructorService";
import AuthService from "../services/AuthService";

export default function InstructorDashboardLayout() {
  const { instructorId: routeInstructorId } = useParams();
  const navigate = useNavigate();

  // Always trust the JWT for secure calls
  const authInfo = React.useMemo(() => AuthService.getAuthInfo(), []);
  const iid = authInfo?.instructorId ?? null;

  const [instructor, setInstructor] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // If URL id doesn't match token id, fix the URL (prevents 403s)
  React.useEffect(() => {
    if (iid && routeInstructorId && String(routeInstructorId) !== String(iid)) {
      navigate(`/instructors/${iid}/courses`, { replace: true });
    }
  }, [iid, routeInstructorId, navigate]);

  React.useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!iid) {
          throw new Error("Not authenticated as instructor");
        }

        // Use token id; service reads iid from JWT internally
        const data = await InstructorService.getInstructor();
        if (!ignore) setInstructor(data);
      } catch (e) {
        if (!ignore) setError(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [iid]);

  const fullName =
    instructor ? `${instructor.firstName} ${instructor.lastName}` : "Instructor";

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="container-fluid p-0 student-shell">
      {/* Sidebar */}
      <aside className="student-sidebar border-end bg-dark text-white">
        <div className="px-3 py-3 d-flex align-items-center gap-2 border-bottom border-secondary">
          <div className="brand-icon rounded bg-primary text-white fw-bold d-grid place-center">
            SL
          </div>
          <div className="fw-semibold">University Of Kelaniya</div>
        </div>

        <div className="p-3">
          {loading ? (
            <div className="text-muted small">Loading instructor…</div>
          ) : error ? (
            <div className="text-danger small">Failed to load instructor.</div>
          ) : (
            <div className="d-flex align-items-start gap-2">
              <div className="avatar rounded-circle bg-secondary text-white fw-bold">
                {initials(fullName)}
              </div>
              <div className="min-w-0">
                <div className="fw-semibold small text-truncate text-white">
                  {fullName}
                </div>
                <div className="text-light small text-truncate">
                  {instructor?.email}
                </div>
                <span className="badge rounded-pill text-bg-primary mt-1">
                  INSTRUCTOR
                </span>
              </div>
            </div>
          )}
        </div>

        <nav className="nav flex-column px-2">
          {/* Use iid from token for links */}
          <NavLink to={`/instructors/${iid ?? routeInstructorId}/courses`} className="nav-link text-white">
            My Courses
          </NavLink>
          <NavLink to={`/instructors/${iid ?? routeInstructorId}/results`} className="nav-link text-white">
            Result Management
          </NavLink>
        </nav>

        <div className="mt-auto p-3 small border-top border-secondary">
          <button className="btn btn-outline-light w-100" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="student-content">
        <div className="container-fluid py-4">
          <h1 className="h3 mb-1">Instructor Dashboard</h1>
          {instructor && <p className="text-muted mb-4">Welcome back, {fullName}</p>}
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function initials(name) {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
