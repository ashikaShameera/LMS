import React from "react";
import { Link, useParams } from "react-router-dom";
import InstructorService from "../../services/InstructorService";

/**
 * Shows all courses assigned to the instructor as cards,
 * with enrolled count and a "Manage Grades" button.
 */
export default function ResultManagement() {
  const { instructorId } = useParams();
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(6);

  const [coursesPage, setCoursesPage] = React.useState(null);
  const [counts, setCounts] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await InstructorService.getAssignedCourses(instructorId, { page, size });
      setCoursesPage(res || { content: [], number: 0, totalPages: 1, last: true });

      const ids = (res?.content ?? []).map((c) => c.id);
      const batch = await Promise.all(ids.map((id) => InstructorService.getEnrollmentCountByCourse(id)));
      const map = {};
      ids.forEach((id, idx) => (map[id] = batch[idx] ?? 0));
      setCounts(map);
    } catch (e) {
      console.error(e);
      setErr(e);
      setCoursesPage({ content: [], number: 0, totalPages: 1, last: true });
    } finally {
      setLoading(false);
    }
  }, [instructorId, page, size]);

  React.useEffect(() => {
    load();
  }, [load]);

  const courses = coursesPage?.content ?? [];
  const totalPages = coursesPage?.totalPages ?? 1;
  const currentPageIdx = coursesPage?.number ?? 0;
  const isLast = typeof coursesPage?.last === "boolean" ? coursesPage.last : currentPageIdx >= totalPages - 1;

  return (
    <>
      <h2 className="h6 mb-3">Result Management</h2>

      {loading && <div className="text-muted">Loading courses…</div>}
      {err && <div className="alert alert-danger">Failed to load courses.</div>}

      {!loading && !err && (
        <>
          {courses.length === 0 ? (
            <div className="alert alert-info">No assigned courses.</div>
          ) : (
            <div className="row g-3">
              {courses.map((c) => {
                const enrolled = counts[c.id] ?? 0;
                const capacity = c?.capacity ?? "-";
                return (
                  <div className="col-12" key={c.id}>
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start flex-wrap">
                          <div>
                            <h5 className="card-title mb-0">{c.title}</h5>
                            <div className="text-muted small">{c.code}</div>
                          </div>
                          <div className="d-flex gap-2">
                            <span className="badge text-bg-secondary">
                              {enrolled}/{capacity} Students
                            </span>
                            <span className={`badge ${c?.enrollmentOpen ? "text-bg-success" : "text-bg-secondary"}`}>
                              {c?.enrollmentOpen ? "Open" : "Closed"}
                            </span>
                          </div>
                        </div>

                        <div className="row row-cols-1 row-cols-md-3 g-2 mt-2">
                          <div className="col">
                            <div className="small">
                              <div className="fw-semibold">{formatTime(c?.lectureTime)}</div>
                              <div className="text-muted">Schedule</div>
                            </div>
                          </div>
                          <div className="col">
                            <div className="small">
                              <div className="fw-semibold">{c?.lectureHall || "-"}</div>
                              <div className="text-muted">Location</div>
                            </div>
                          </div>
                          <div className="col">
                            <div className="small">
                              <div className="fw-semibold">{c?.description ? truncate(c.description, 80) : "—"}</div>
                              <div className="text-muted">Summary</div>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex gap-2 mt-3">
                          <Link
                            className="btn btn-primary"
                            to={`/instructors/${instructorId}/results/${c.id}`}
                            state={{ course: c }} // optional: pass course to avoid a refetch
                          >
                            Manage Grades
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted small">Page {currentPageIdx + 1} of {totalPages}</div>
            <div className="btn-group">
              <button className="btn btn-outline-secondary" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                Prev
              </button>
              <button className="btn btn-outline-secondary" disabled={isLast} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function formatTime(t) { if (!t) return "-"; return String(t).slice(0, 5); }
function truncate(s, n) { return s ? (s.length > n ? s.slice(0, n - 1) + "…" : s) : ""; }
