import React from "react";
import AdminService from "../../services/adminService";
/**
 * Dashboard cards:
 * - Total Instructors
 * - Total Students
 * - Total Courses
 * - Total Enrollments
 */
export default function AdminDashboard() {
  const [stats, setStats] = React.useState({
    instructors: null,
    students: null,
    courses: null,
    enrollments: null,
    source: null,
  });
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await AdminService.getOverviewCounts();
        if (!ignore) setStats(res);
      } catch (e) {
        if (!ignore) setErr(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => (ignore = true);
  }, []);

  const Card = ({ title, value, hintClass = "text-bg-primary" }) => (
    <div className="col-12 col-md-6 col-xl-3">
      <div className="card shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-semibold">{title}</div>
            <div className="text-muted small">Total</div>
          </div>
          <div className={`badge ${hintClass}`} style={{ fontSize: "1rem" }}>
            {loading ? "…" : value ?? "—"}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {err && <div className="alert alert-danger">Failed to load admin stats.</div>}

      <div className="row g-3">
        <Card title="Instructors" value={stats.instructors} hintClass="text-bg-dark" />
        <Card title="Students" value={stats.students} hintClass="text-bg-success" />
        <Card title="Courses" value={stats.courses} hintClass="text-bg-primary" />
        <Card title="Enrollments" value={stats.enrollments} hintClass="text-bg-secondary" />
      </div>

      {!loading && stats.source && (
        <div className="text-muted small mt-2">
          <em>Source:</em> {stats.source}
        </div>
      )}
    </>
  );
}
