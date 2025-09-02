import React from "react";
import { NavLink, Outlet, useParams, useNavigate } from "react-router-dom";
import StudentServise from "../services/StudentServise";
import AuthService from "../services/AuthService";



export default function StudentDashboardLayout() {
  const { studentId } = useParams();

  const navigate = useNavigate();

  const onLogout = () => {
    AuthService.logout();
    navigate("/login", { replace: true });
  };

  const [student, setStudent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await StudentServise.getStudent(studentId);
        console.log(data)
        if (!ignore) setStudent(data);
      } catch (e) {
        if (!ignore) setError(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => (ignore = true);
  }, [studentId]);

  return (
    <div className="container-fluid p-0 student-shell">
      {/* Sidebar */}
{/* Sidebar */}
{/* Sidebar */}
<aside className="student-sidebar border-end bg-dark text-white">
  <div className="px-3 py-3 d-flex align-items-center gap-2 border-bottom border-secondary">
    <div className="brand-icon rounded bg-primary text-white fw-bold d-grid place-center">
      SL
    </div>
    <div className="fw-semibold">University of Kelaniya</div>
  </div>

  <div className="p-3">
    {loading ? (
      <div className="text-muted small">Loading student…</div>
    ) : error ? (
      <div className="text-danger small">Failed to load student.</div>
    ) : (
      <div className="d-flex align-items-start gap-2">
        <div className="avatar rounded-circle bg-secondary text-white fw-bold">
          {initials(student?.fullName || student?.name || "Student")}
        </div>
        <div className="min-w-0">
          <div className="fw-semibold small text-truncate text-white">
            {student?.fullName || student?.name || "Student"}
          </div>
          <div className="text-light small text-truncate">
            {student?.email || "student@university.edu"}
          </div>
          <span className="badge rounded-pill text-bg-success mt-1">
            STUDENT
          </span>
        </div>
      </div>
    )}
  </div>

  <nav className="nav flex-column px-2">
    <NavLink to={`/students/${studentId}/courses`} className="nav-link text-white">
      My Courses
    </NavLink>
    <NavLink to={`/students/${studentId}/catalog`} className="nav-link text-white">
      Course Catalog
    </NavLink>
    <NavLink to={`/students/${studentId}/results`} className="nav-link text-white">
      My Results
    </NavLink>
  </nav>

  <div className="mt-auto p-3 small border-top border-secondary">
    <button className="btn btn-outline-light w-100" onClick={onLogout}>Logout</button>
  </div>
</aside>



      {/* Main content */}
      <main className="student-content">
        <div className="container-fluid py-4">
          <h1 className="h3 mb-1">Student Dashboard</h1>
          {student && (
            <p className="text-muted mb-4">Welcome back, {student.fullName || student.name}</p>
          )}
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
