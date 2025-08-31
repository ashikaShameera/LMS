import React from "react";
import { useParams } from "react-router-dom";
import StudentServise from "../../services/StudentServise";

export default function EnrolledCourses() {
  const { studentId } = useParams();
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(6);
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await StudentServise.getEnrolledCourses(studentId, { page, size });
      setData(res);
      setErr(null);
    } catch (e) {
      console.error(e);
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [studentId, page, size]);

  React.useEffect(() => {
    load();
  }, [load]);

  const unenroll = async (courseId) => {
    if (!window.confirm("Remove this course from your enrollments?")) return;
    try {
      await StudentServise.unenroll(studentId, courseId);
      await load();
    } catch (e) {
      alert("Failed to unenroll.");
    }
  };

  return (
    <>
      <h2 className="h6 mb-3">My Enrolled Courses</h2>

      {loading && <div className="text-muted">Loading courses…</div>}
      {err && <div className="text-danger">Failed to load courses.</div>}

      {!loading && !err && (
        <>
          {data?.content?.length === 0 ? (
            <div className="alert alert-info">You are not enrolled in any courses.</div>
          ) : (
            <div className="row g-3">
              {data.content.map((c) => (
                <div key={c.id} className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      {/* Header */}
                      <div className="d-flex justify-content-between align-items-start flex-wrap">
                        <div>
                          <h5 className="card-title mb-0">{c.title}</h5>
                          <div className="text-muted small">{c.code}</div>
                        </div>
                        <div className="d-flex gap-2">
                          <span className="badge text-bg-primary">
                            {c.capacity ?? 0} Capacity
                          </span>
                          <span
                            className={`badge ${
                              c.enrollmentOpen ? "text-bg-success" : "text-bg-secondary"
                            }`}
                          >
                            {c.enrollmentOpen ? "Active" : "Closed"}
                          </span>
                        </div>
                      </div>

                        {/* Meta */}
                        <div className="row row-cols-1 row-cols-md-4 g-2 mt-2">
                          <div className="col">
                            <div className="small">
                              <div className="fw-semibold">{formatTime(c.lectureTime)}</div>
                              <div className="text-muted">Schedule</div>
                            </div>
                          </div>
                          <div className="col">
                            <div className="small">
                              <div className="fw-semibold">{c.lectureDay || "-"}</div>
                              <div className="text-muted">Day</div>
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
                              <div className="fw-semibold">{c.capacity ?? "-"}</div>
                              <div className="text-muted">Seats</div>
                            </div>
                          </div>
                        </div>


                      {/* Description */}
                      {c.description && (
                        <p className="mt-3 mb-2">{c.description}</p>
                      )}

                      {/* Actions */}
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => alert("View details not implemented")}
                        >
                          View Details
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => unenroll(c.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted small">
              Page {data?.number + 1} of {data?.totalPages || 1}
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
                disabled={data?.last}
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
  // Spring LocalTime often comes as HH:mm[:ss]
  return localTimeStr.slice(0, 5);
}
