import React from "react";
import { useParams } from "react-router-dom";
import InstructorService from "../../services/InstructorService";

/**
 * Shows instructor's assigned courses
 * Each card shows capacity + current enrolled count
 * "View Students" opens a popup table listing enrolled students
 */
export default function MyCourses() {
  const { instructorId } = useParams();
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(6);

  const [data, setData] = React.useState(null);           // Page<CourseDto> | null
  const [counts, setCounts] = React.useState({});         // { [courseId]: number }
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);

  // modal state
  const [showModal, setShowModal] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState(null);
  const [studentsPage, setStudentsPage] = React.useState(null);
  const [loadingStudents, setLoadingStudents] = React.useState(false);
  const [studentsErr, setStudentsErr] = React.useState(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const pageData = await InstructorService.getAssignedCourses(instructorId, { page, size });
      setData(pageData || { content: [], number: 0, totalPages: 1, last: true });

      // fetch enrollment counts for courses shown on this page (safe defaults)
      const ids = (pageData?.content ?? []).map((c) => c.id);
      const results = await Promise.all(ids.map((id) => InstructorService.getEnrollmentCountByCourse(id)));
      const map = {};
      ids.forEach((id, idx) => (map[id] = results[idx] ?? 0));
      setCounts(map);
    } catch (e) {
      console.error(e);
      setErr(e);
      // ensure data has a safe shape so UI doesn't explode
      setData({ content: [], number: 0, totalPages: 1, last: true });
    } finally {
      setLoading(false);
    }
  }, [instructorId, page, size]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openStudents = async (course) => {
    setSelectedCourse(course);
    setShowModal(true);
    setStudentsErr(null);
    setStudentsPage(null);
    try {
      setLoadingStudents(true);
      const res = await InstructorService.getEnrollmentsByCourse(course.id, { page: 0, size: 100 });
      setStudentsPage(res || { content: [] });
    } catch (e) {
      console.error(e);
      setStudentsErr(e);
      setStudentsPage({ content: [] });
    } finally {
      setLoadingStudents(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  const courses = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPageIdx = data?.number ?? 0;
  const isLast = typeof data?.last === "boolean" ? data.last : currentPageIdx >= totalPages - 1;

  return (
    <>
      <h2 className="h6 mb-3">My Courses</h2>

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
                return (
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
                            <span className="badge text-bg-primary">
                              {c?.capacity ?? "-"} Capacity
                            </span>
                            <span className="badge text-bg-secondary">
                              {enrolled}/{c?.capacity ?? "-"} Enrolled
                            </span>
                            <span className={`badge ${c?.enrollmentOpen ? "text-bg-success" : "text-bg-secondary"}`}>
                              {c?.enrollmentOpen ? "Open" : "Closed"}
                            </span>
                          </div>
                        </div>

                        {/* meta */}
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

                        {/* actions */}
                        <div className="d-flex gap-2 mt-3">
                          <button className="btn btn-outline-primary" onClick={() => openStudents(c)}>
                            View Students
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted small">
              Page {currentPageIdx + 1} of {totalPages}
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
                disabled={isLast}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Students Modal */}
      <StudentsModal
        show={showModal}
        onClose={closeModal}
        course={selectedCourse}
        loading={loadingStudents}
        error={studentsErr}
        page={studentsPage}
      />
    </>
  );
}

function formatTime(localTimeStr) {
  if (!localTimeStr) return "-";
  return String(localTimeStr).slice(0, 5);
}
function truncate(str, n) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

/** Modal that fetches student details by studentId for each enrollment */
function StudentsModal({ show, onClose, course, loading, error, page }) {
  const [studentMap, setStudentMap] = React.useState(new Map()); // studentId -> StudentDto
  const [loadingDetails, setLoadingDetails] = React.useState(false);

  React.useEffect(() => {
    if (!show || !page) return;
    const enrollments = page?.content ?? [];
    const missingIds = enrollments
      .map((e) => e.studentId)
      .filter((id) => id != null && !studentMap.has(id));

    if (missingIds.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        setLoadingDetails(true);
        const results = await Promise.all(
          missingIds.map((id) => InstructorService.getStudentById(id).catch(() => null))
        );
        if (cancelled) return;
        setStudentMap((prev) => {
          const next = new Map(prev);
          missingIds.forEach((id, idx) => {
            if (results[idx]) next.set(id, results[idx]);
          });
          return next;
        });
      } finally {
        if (!cancelled) setLoadingDetails(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [show, page]);

  if (!show) return null;

  const enrollments = page?.content ?? [];
  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,.5)" }}>
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Students — {course?.title} <span className="text-muted small">({course?.code})</span>
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {loading && <div className="text-muted">Loading enrollments…</div>}
            {error && <div className="alert alert-danger">Failed to load enrollments.</div>}

            {!loading && !error && (
              <>
                {enrollments.length === 0 ? (
                  <div className="alert alert-info mb-0">No students enrolled yet.</div>
                ) : (
                  <>
                    {loadingDetails && (
                      <div className="text-muted small mb-2">Fetching student details…</div>
                    )}
                    <div className="table-responsive">
                      <table className="table table-sm table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: "15%" }}>Student No</th>
                            <th style={{ width: "30%" }}>Name</th>
                            <th>Email</th>
                            <th style={{ width: "15%" }}>Phone</th>
                            <th style={{ width: "10%" }}>Active</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrollments.map((e) => {
                            const s = studentMap.get(e.studentId) || {};
                            const studentNo = s.studentNo ?? s.student_no ?? e.studentId;
                            const name =
                              ((s.firstName || "") + (s.lastName ? ` ${s.lastName}` : "")).trim() ||
                              s.fullName ||
                              "—";
                            return (
                              <tr key={e.id}>
                                <td>
                                  <span className="badge text-bg-secondary">{studentNo ?? "—"}</span>
                                </td>
                                <td>{name}</td>
                                <td className="text-truncate">{s.email || "—"}</td>
                                <td>{s.phone || "—"}</td>
                                <td>
                                  <span className={`badge ${e.active ? "text-bg-success" : "text-bg-secondary"}`}>
                                    {e.active ? "Yes" : "No"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
