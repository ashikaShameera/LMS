import React from "react";
import { useLocation, useParams } from "react-router-dom";
import InstructorService from "../../services/InstructorService";

/**
 * Shows enrolled students for the course with their grades (if any),
 * provides search, and allows adding a grade for students without one.
 */
export default function ManageCourseGrades() {
  const { instructorId, courseId } = useParams();
  const location = useLocation();
  const courseFromState = location.state?.course; // optional from ResultManagement link

  const [headerCourse, setHeaderCourse] = React.useState(courseFromState || null);

  const [enrollments, setEnrollments] = React.useState([]);      // EnrollmentDto[]
  const [gradesMap, setGradesMap] = React.useState(new Map());   // studentId -> GradeDto
  const [studentsMap, setStudentsMap] = React.useState(new Map());// studentId -> StudentDto
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);

  // UI
  const [q, setQ] = React.useState("");
  const [modal, setModal] = React.useState({ open: false, studentId: null, studentName: "", score: "" });
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      // 1) enrollments + grades
      const [enrollPage, gradePage] = await Promise.all([
        InstructorService.getEnrollmentsByCourse(courseId, { page: 0, size: 1000 }),
        InstructorService.getGradesByCourse(courseId, { page: 0, size: 1000 }),
      ]);

      const enrollmentsList = enrollPage?.content ?? [];
      setEnrollments(enrollmentsList);

      const gmap = new Map();
      (gradePage?.content ?? []).forEach((g) => gmap.set(g.studentId, g));
      setGradesMap(gmap);

      // 2) student details (fetch any missing)
      const uniqueIds = Array.from(new Set(enrollmentsList.map((e) => e.studentId).filter(Boolean)));
      const results = await Promise.all(
        uniqueIds.map((id) => InstructorService.getStudentById(id).catch(() => null))
      );
      const smap = new Map();
      uniqueIds.forEach((id, i) => results[i] && smap.set(id, results[i]));
      setStudentsMap(smap);

      // 3) optional header course
      if (!courseFromState) {
        const assigned = await InstructorService.getAssignedCourses(instructorId, { page: 0, size: 1000 });
        const found = (assigned?.content ?? []).find((c) => String(c.id) === String(courseId));
        if (found) setHeaderCourse(found);
      }
    } catch (e) {
      console.error(e);
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [courseId, instructorId, courseFromState]);

  React.useEffect(() => {
    load();
  }, [load]);

  const rows = React.useMemo(() => {
    // Build rows merging enrollment + student + grade
    const list = enrollments.map((e) => {
      const s = studentsMap.get(e.studentId) || {};
      const g = gradesMap.get(e.studentId);
      const studentNo = s.studentNo ?? s.student_no ?? e.studentId;
      const name = ((s.firstName || "") + (s.lastName ? ` ${s.lastName}` : "")).trim() || s.fullName || "—";
      const email = s.email || "—";
      return {
        studentId: e.studentId, // keep original id for upserts
        studentNo,
        name,
        email,
        score: g?.score ?? null,
        letter: g?.letter ?? null,
      };
    });
    if (!q.trim()) return list;
    const t = q.trim().toLowerCase();
    return list.filter((r) => r.name.toLowerCase().includes(t) || r.email.toLowerCase().includes(t) || String(r.studentNo).toLowerCase().includes(t));
  }, [enrollments, studentsMap, gradesMap, q]);

  const openAddModal = (r) => {
    setModal({ open: true, studentId: r.studentId, studentName: r.name, score: "" });
  };
  const closeModal = () => setModal({ open: false, studentId: null, studentName: "", score: "" });

  const submitGrade = async (e) => {
    e.preventDefault();
    const scoreNum = Number(modal.score);
    if (!Number.isFinite(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      alert("Score must be a number from 0 to 100.");
      return;
    }
    try {
      setSaving(true);
      await InstructorService.upsertGrade({ studentId: modal.studentId, courseId, score: scoreNum });
      // refresh grades only (faster)
      const gradePage = await InstructorService.getGradesByCourse(courseId, { page: 0, size: 1000 });
      const gmap = new Map();
      (gradePage?.content ?? []).forEach((g) => gmap.set(g.studentId, g));
      setGradesMap(gmap);
      closeModal();
    } catch (e2) {
      console.error(e2);
      alert("Failed to save grade.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="h6 m-0">Manage Grades</h2>
          <div className="text-muted small">
            {headerCourse ? (
              <>
                {headerCourse.title} <span className="text-muted">({headerCourse.code})</span>
              </>
            ) : (
              "Course"
            )}
          </div>
        </div>
        <form className="d-flex" onSubmit={(e) => e.preventDefault()}>
          <input
            className="form-control"
            placeholder="Search by student no, name or email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>
      </div>

      {loading && <div className="text-muted">Loading roster…</div>}
      {err && <div className="alert alert-danger">Failed to load course roster.</div>}

      {!loading && !err && (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "18%" }}>Student No</th>
                    <th style={{ width: "28%" }}>Name</th>
                    <th>Email</th>
                    <th className="text-center" style={{ width: "12%" }}>Score</th>
                    <th className="text-center" style={{ width: "12%" }}>Letter</th>
                    <th className="text-center" style={{ width: "14%" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">No students match your search.</td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.studentId}>
                        <td>
                          <span className="badge text-bg-secondary">{r.studentNo ?? r.studentId}</span>
                        </td>
                        <td className="fw-semibold">{r.name}</td>
                        <td className="text-truncate">{r.email}</td>
                        <td className="text-center">{r.score ?? "—"}</td>
                        <td className="text-center">
                          {r.letter ? <span className="badge text-bg-success">{r.letter}</span> : "—"}
                        </td>
                        <td className="text-center">
                          {r.score == null ? (
                            <button className="btn btn-sm btn-primary" onClick={() => openAddModal(r)}>
                              Add Grade
                            </button>
                          ) : (
                            <span className="text-muted small">Graded</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Grade Modal */}
      {modal.open && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog" role="document">
            <form className="modal-content" onSubmit={submitGrade}>
              <div className="modal-header">
                <h5 className="modal-title">Add Grade</h5>
                <button type="button" className="btn-close" onClick={closeModal} />
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <div className="small text-muted">Student</div>
                  <div className="fw-semibold">{modal.studentName}</div>
                </div>
                <div className="mb-2">
                  <label className="form-label">Score (0–100)</label>
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    max={100}
                    value={modal.score}
                    onChange={(e) => setModal((m) => ({ ...m, score: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
