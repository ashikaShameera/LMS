import React from "react";
import { useParams } from "react-router-dom";
import StudentServise from "../../services/StudentServise";

/**
 * My Results
 * - Shows overall GPA for the student
 * - Shows a table with ALL enrolled courses and their grade/marks (or Pending)
 */
export default function MyResults() {
  const { studentId } = useParams();

  const [gpaValue, setGpaValue] = React.useState(null);
  const [grades, setGrades] = React.useState([]); // GradeDto[]
  const [enrolledCourses, setEnrolledCourses] = React.useState([]); // CourseDto[]
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      // Fetch all grades (big page) and all enrolled courses (big page)
      const [gradesPage, coursesPage, summary] = await Promise.all([
        StudentServise.getGradesByStudent(studentId, { page: 0, size: 1000 }),
        StudentServise.getEnrolledCourses(studentId, { page: 0, size: 1000 }),
        StudentServise.getGradeSummary(studentId),
      ]);

      setGrades(gradesPage?.content || []);
      setEnrolledCourses(coursesPage?.content || []);

      // Try to read GPA from summary. Fall back to computing average gradePoint.
      const gpaFromSummary =
        summary?.gpa ??
        summary?.overallGpa ??
        summary?.gradePointAverage ??
        summary?.value;

      if (typeof gpaFromSummary === "number") {
        setGpaValue(gpaFromSummary);
      } else {
        // compute simple unweighted GPA from graded courses (gradePoint)
        const graded = (gradesPage?.content || []).filter(
          (g) => typeof g.gradePoint === "number"
        );
        const computed =
          graded.length > 0
            ? graded.reduce((acc, g) => acc + g.gradePoint, 0) / graded.length
            : null;
        setGpaValue(computed);
      }
    } catch (e) {
      console.error(e);
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  React.useEffect(() => {
    load();
  }, [load]);

  // map grade by courseId for quick lookup
  const gradeByCourseId = React.useMemo(() => {
    const m = new Map();
    for (const g of grades) m.set(g.courseId, g);
    return m;
  }, [grades]);

  return (
    <>
      <h2 className="h6 mb-3">My Results</h2>

      {loading && <div className="text-muted">Loading results…</div>}
      {err && <div className="alert alert-danger">Failed to load results.</div>}

      {!loading && !err && (
        <>
          {/* GPA Card */}
          <div className="card shadow-sm mb-3">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold">Overall GPA</div>
                <div className="text-muted small">
                  Based on completed/graded courses
                </div>
              </div>
              <div className="display-6 m-0">
                {typeof gpaValue === "number" ? gpaValue.toFixed(2) : "—"}
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "40%" }}>Course</th>
                      <th>Course ID</th>
                      <th className="text-center">Grade</th>
                      <th className="text-center">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledCourses.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">
                          You are not enrolled in any courses.
                        </td>
                      </tr>
                    ) : (
                      enrolledCourses.map((c) => {
                        const g = gradeByCourseId.get(c.id);
                        const hasGrade =
                          !!g && (typeof g.score === "number" || g.letter);

                        return (
                          <tr
                            key={c.id}
                            className={!hasGrade ? "table-warning" : undefined}
                          >
                            <td>
                              <div className="fw-semibold">{c.title}</div>
                              <div className="text-muted small">{c.description || c.code}</div>
                            </td>
                            <td>
                              <span className="badge text-bg-secondary">
                                {c.code || c.id}
                              </span>
                            </td>
                            <td className="text-center">
                              {hasGrade ? (
                                <span className="badge text-bg-success">
                                  {g.letter || "—"}
                                </span>
                              ) : (
                                <span className="text-muted">Pending</span>
                              )}
                            </td>
                            <td className="text-center">
                              {hasGrade
                                ? (typeof g.score === "number" ? g.score : "—")
                                : "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
