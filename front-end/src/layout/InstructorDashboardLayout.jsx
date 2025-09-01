import React from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import InstructorService from "../services/InstructorService";

export default function InstructorDashboardLayout() {
  const { instructorId } = useParams();
  const [instructor, setInstructor] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await InstructorService.getInstructor(instructorId);
        console.log(data);
        if (!ignore) setInstructor(data);
      } catch (e) {
        if (!ignore) setError(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => (ignore = true);
  }, [instructorId]);

  const fullName =
    instructor ? `${instructor.firstName} ${instructor.lastName}` : "Instructor";

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
          <NavLink
            to={`/instructors/${instructorId}/courses`}
            className="nav-link text-white"
          >
            My Courses
          </NavLink>
          <NavLink
            to={`/instructors/${instructorId}/results`}
            className="nav-link text-white"
          >
            Result Management
          </NavLink>
        </nav>

        <div className="mt-auto p-3 small border-top border-secondary">
          <button className="btn btn-outline-light w-100">Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="student-content">
        <div className="container-fluid py-4">
          <h1 className="h3 mb-1">Instructor Dashboard</h1>
          {instructor && (
            <p className="text-muted mb-4">Welcome back, {fullName}</p>
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
