import React from "react";
import { useParams } from "react-router-dom";
import StudentServise from "../../services/StudentServise";

/**
 * Course Catalog
 * - Shows all courses the student is NOT enrolled in
 * - Bootstrap cards
 * - "Enroll" button calls POST /api/enrollments
 */
export default function CourseCatalog() {
  const { studentId } = useParams();

  // paging for course list
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(6);

  // search
  const [q, setQ] = React.useState("");

  // data
  const [enrolledIds, setEnrolledIds] = React.useState(new Set());
  const [coursesPage, setCoursesPage] = React.useState(null);

  // ui states
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);
  const [busyId, setBusyId] = React.useState(null); // track enrolling course

  // Load enrolled + all courses (current page) in parallel
  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const [enrolled, allCourses] = await Promise.all([
        StudentServise.getEnrolledCourses(studentId, { page: 0, size: 1000 }), // grab enough to compute exclusion
        StudentServise.getCourses({ page, size, q }),
      ]);

      setEnrolledIds(new Set((enrolled?.content || []).map((c) => c.id)));
      setCoursesPage(allCourses);
    } catch (e) {
      console.error(e);
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [studentId, page, size, q]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleEnroll = async (courseId) => {
    if (!window.confirm("Enroll in this course?")) return;
    try {
      setBusyId(courseId);
      await StudentServise.enroll(studentId, courseId);
      // refresh list (this will also update enrolledIds so the course disappears)
      await load();
    } catch (e) {
      console.error(e);
      alert("Failed to enroll. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  // Filter out: already enrolled & closed courses
  const visibleCourses =
    (coursesPage?.content || []).filter(
      (c) => !enrolledIds.has(c.id) && (c.enrollmentOpen ?? true)
    ) || [];

  return (
    <>
      {/* Search + title */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h2 className="h6 m-0">Course Catalog</h2>
        <form
          className="d-flex"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(0);
            load();
          }}
        >
          <input
            className="form-control"
            placeholder="Search courses..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>
      </div>

      {/* Content */}
      {loading && <div className="text-muted">Loading courses…</div>}
      {err && <div className="text-danger">Failed to load courses.</div>}

      {!loading && !err && (
        <>
          {visibleCourses.length === 0 ? (
            <div className="alert alert-info">
              No available courses found on this page.
            </div>
          ) : (
            <div className="row g-3">
              {visibleCourses.map((c) => (
                <div key={c.id} className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      {/* header */}
                      <div className="d-flex justify-content-between align-items-start flex-wrap">
                        <div>
                          <h5 className="card-title mb-0">{c.title}</h5>
                          <div className="text-muted small">{c.code}</div>
                        </div>
                        <div className="d-flex gap-2">
                          {typeof c.capacity === "number" && (
                            <span className="badge text-bg-primary">
                              {c.capacity} Capacity
                            </span>
                          )}
                          <span
                            className={`badge ${
                              c.enrollmentOpen ? "text-bg-success" : "text-bg-secondary"
                            }`}
                          >
                            {c.enrollmentOpen ? "Open" : "Closed"}
                          </span>
                        </div>
                      </div>

                      {/* meta */}
                      <div className="row row-cols-1 row-cols-md-3 g-2 mt-2">
                        <div className="col">
                          <div className="small">
                            <div className="fw-semibold">{formatTime(c.lectureTime)}</div>
                            <div className="text-muted">Schedule</div>
                          </div>
                        </div>
                        <div className="col">
                          <div className="small">
                            <div className="fw-semibold">{c.lectureHall || "-"}</div>
                            <div className="text-muted">Location</div>
                          </div>
                        </div>
                        <div className="col">
                          <div className="small">
                            <div className="fw-semibold">
                              {c.capacity ?? "-"}
                            </div>
                            <div className="text-muted">Seats</div>
                          </div>
                        </div>
                      </div>

                      {/* description */}
                      {c.description && <p className="mt-3 mb-2">{c.description}</p>}

                      {/* actions */}
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary"
                          disabled={busyId === c.id || !c.enrollmentOpen}
                          onClick={() => handleEnroll(c.id)}
                        >
                          {busyId === c.id ? "Enrolling..." : "Enroll"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination for the source course list */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted small">
              Page {coursesPage?.number + 1} of {coursesPage?.totalPages || 1}
            </div>
            <div className="btn-group">
              <button
                className="btn btn-outline-secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Prev
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={coursesPage?.last}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function formatTime(localTimeStr) {
  if (!localTimeStr) return "-";
  // typical LocalTime string "HH:mm[:ss]"
  return localTimeStr.slice(0, 5);
}
