import React from "react";
import AdminService from "../../services/adminService";

/**
 * Admin Student Management
 * - Table with search & pagination
 * - Add Student (creates AppUser with default password: student123)
 * - Edit Student (contact/profile fields)
 * - Delete Student
 * - Assign to Course (searchable list of courses; enroll button; disables if already enrolled)
 */
export default function AdminStudentManagement() {
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(10);

  const [data, setData] = React.useState({ content: [], totalPages: 1, number: 0, last: true });
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);

  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false);

  const [editing, setEditing] = React.useState(null);
  const [assignTarget, setAssignTarget] = React.useState(null);

  const [form, setForm] = React.useState(blankStudentForm());
  const [profileForm, setProfileForm] = React.useState({ phone: "", address: "" });

  function blankStudentForm() {
    return {
      studentNo: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    };
  }

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await AdminService.listStudents({ page, size, q });
      setData(res || { content: [], totalPages: 1, number: 0, last: true });
    } catch (e) {
      setErr(e);
      setData({ content: [], totalPages: 1, number: 0, last: true });
    } finally {
      setLoading(false);
    }
  }, [page, size, q]);

  React.useEffect(() => {
    load();
  }, [load]);

  /* ---------- Add ---------- */
  const openAdd = () => {
    setForm(blankStudentForm());
    setAddOpen(true);
  };
  const closeAdd = () => setAddOpen(false);

  const onChangeNew = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const submitAdd = async (e) => {
    e.preventDefault();
    try {
      await AdminService.createStudentWithUser(normalizeStudentPayload(form));
      closeAdd();
      await load();
    } catch (err) {
      alert("Failed to create student.");
    }
  };

  /* ---------- Edit (profile fields) ---------- */
  const openEdit = (student) => {
    setEditing(student);
    setProfileForm({
      phone: student.phone || "",
      address: student.address || "",
    });
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };
  const onChangeProfile = (e) => {
    const { name, value } = e.target;
    setProfileForm((f) => ({ ...f, [name]: value }));
  };
  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await AdminService.updateStudentProfile(editing.id, normalizeProfilePayload(profileForm));
      closeEdit();
      await load();
    } catch (err) {
      alert("Failed to update student profile.");
    }
  };

  /* ---------- Delete ---------- */
  const remove = async (student) => {
    if (!window.confirm(`Delete student "${formatName(student)}" (${student.studentNo}) ?`)) return;
    try {
      await AdminService.deleteStudent(student.id);
      await load();
    } catch (err) {
      alert("Failed to delete student.");
    }
  };

  /* ---------- Assign to Course ---------- */
  const openAssign = (student) => {
    setAssignTarget(student);
    setAssignOpen(true);
  };
  const closeAssign = () => {
    setAssignOpen(false);
    setAssignTarget(null);
  };

  const students = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPageIdx = data?.number ?? 0;
  const isLast = typeof data?.last === "boolean" ? data.last : currentPageIdx >= totalPages - 1;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="h6 m-0">Student Management</h2>
          <div className="text-muted small">Add, edit, delete, and assign courses to students</div>
        </div>
        <div className="d-flex gap-2">
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
              placeholder="Search students..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>
          <button className="btn btn-primary" onClick={openAdd}>
            Add Student
          </button>
        </div>
      </div>

      {loading && <div className="text-muted">Loading students…</div>}
      {err && <div className="alert alert-danger">Failed to load students.</div>}

      {!loading && !err && (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "12%" }}>Student No</th>
                    <th style={{ width: "24%" }}>Name</th>
                    <th style={{ width: "26%" }}>Email</th>
                    <th style={{ width: "18%" }}>Phone</th>
                    <th style={{ width: "20%" }} className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">No students found.</td>
                    </tr>
                  ) : (
                    students.map((s) => (
                      <tr key={s.id}>
                        <td><span className="badge text-bg-secondary">{s.studentNo || s.student_no || s.id}</span></td>
                        <td className="fw-semibold">{formatName(s)}</td>
                        <td className="text-truncate">{s.email || "—"}</td>
                        <td>{s.phone || "—"}</td>
                        <td className="text-center">
                          <div className="btn-group">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(s)}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => remove(s)}>
                              Delete
                            </button>
                            <button className="btn btn-sm btn-outline-success" onClick={() => openAssign(s)}>
                              Assign Course
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* pagination */}
          <div className="card-footer d-flex justify-content-between align-items-center">
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
        </div>
      )}

      {/* Add Student Modal */}
      {addOpen && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog" role="document">
            <form className="modal-content" onSubmit={submitAdd}>
              <div className="modal-header">
                <h5 className="modal-title">Add Student</h5>
                <button type="button" className="btn-close" onClick={closeAdd} />
              </div>
              <div className="modal-body">
                <StudentForm form={form} onChange={onChangeNew} />
                <div className="alert alert-info mt-3 mb-0 small">
                  An AppUser will be created with role <strong>STUDENT</strong> and default password <code>student123</code>.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={closeAdd}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student (Profile) Modal */}
      {editOpen && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog" role="document">
            <form className="modal-content" onSubmit={submitEdit}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Student</h5>
                <button type="button" className="btn-close" onClick={closeEdit} />
              </div>
              <div className="modal-body">
                <ProfileForm form={profileForm} onChange={onChangeProfile} />
                <div className="text-muted small mt-2">
                  Note: Only contact details (phone, address) can be edited here.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={closeEdit}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Course Modal */}
      {assignOpen && (
        <AssignCourseModal
          student={assignTarget}
          onClose={closeAssign}
        />
      )}
    </>
  );
}

/* ---------- Forms ---------- */

function StudentForm({ form, onChange }) {
  return (
    <div className="row g-3">
      <div className="col-md-4">
        <label className="form-label">Student No</label>
        <input
          className="form-control"
          name="studentNo"
          value={form.studentNo}
          onChange={onChange}
          required
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">First Name</label>
        <input
          className="form-control"
          name="firstName"
          value={form.firstName}
          onChange={onChange}
          required
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">Last Name</label>
        <input
          className="form-control"
          name="lastName"
          value={form.lastName}
          onChange={onChange}
          required
        />
      </div>

      <div className="col-md-8">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          name="email"
          value={form.email}
        onChange={onChange}
          required
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">Phone</label>
        <input
          className="form-control"
          name="phone"
          value={form.phone}
          onChange={onChange}
        />
      </div>

      <div className="col-12">
        <label className="form-label">Address</label>
        <input
          className="form-control"
          name="address"
          value={form.address}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function ProfileForm({ form, onChange }) {
  return (
    <div className="row g-3">
      <div className="col-md-6">
        <label className="form-label">Phone</label>
        <input
          className="form-control"
          name="phone"
          value={form.phone}
          onChange={onChange}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">Address</label>
        <input
          className="form-control"
          name="address"
          value={form.address}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function formatName(s) {
  const a = s?.firstName || "";
  const b = s?.lastName || "";
  const joined = (a + " " + b).trim();
  return joined || "—";
}

function normalizeStudentPayload(f) {
  return {
    studentNo: f.studentNo?.trim(),
    firstName: f.firstName?.trim(),
    lastName: f.lastName?.trim(),
    email: f.email?.trim(),
    phone: f.phone?.trim() || "",
    address: f.address?.trim() || "",
  };
}
function normalizeProfilePayload(f) {
  return {
    phone: f.phone?.trim() || "",
    address: f.address?.trim() || "",
  };
}

/* ---------- Assign Course Modal (enroll) ---------- */

function AssignCourseModal({ student, onClose }) {
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(8);

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);
  const [courses, setCourses] = React.useState({ content: [], number: 0, totalPages: 1, last: true });

  const [enrolledIds, setEnrolledIds] = React.useState(new Set()); // courses already enrolled
  const [enrolling, setEnrolling] = React.useState({}); // { [courseId]: boolean }

  const load = React.useCallback(async () => {
    if (!student?.id) return;
    try {
      setLoading(true);
      setErr(null);

      const [coursePage, enrolledPage] = await Promise.all([
        AdminService.listCourses({ page, size, q }),
        AdminService.listStudentCourses(student.id, { page: 0, size: 500 }),
      ]);

      setCourses(coursePage || { content: [], number: 0, totalPages: 1, last: true });

      const ids = new Set((enrolledPage?.content ?? []).map((c) => c.id));
      setEnrolledIds(ids);
    } catch (e) {
      setErr(e);
      setCourses({ content: [], number: 0, totalPages: 1, last: true });
      setEnrolledIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [student?.id, page, size, q]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onEnroll = async (course) => {
    if (!student?.id || !course?.id) return;
    try {
      setEnrolling((s) => ({ ...s, [course.id]: true }));
      await AdminService.enrollStudentToCourse(student.id, course.id);
      setEnrolledIds((prev) => new Set(prev).add(course.id));
    } catch (e) {
      alert("Failed to enroll student.");
    } finally {
      setEnrolling((s) => ({ ...s, [course.id]: false }));
    }
  };

  const pageNumber = courses?.number ?? 0;
  const totalPages = courses?.totalPages ?? 1;
  const isLast = typeof courses?.last === "boolean" ? courses.last : pageNumber >= totalPages - 1;
  const list = courses?.content ?? [];

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,.5)" }}>
      <div className="modal-dialog modal-xl" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Assign Course — {formatName(student)}{" "}
              <span className="text-muted small">({student?.studentNo || student?.student_no})</span>
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
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
                  placeholder="Search courses by code, title…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  style={{ width: 360 }}
                />
              </form>
              <div className="text-muted small">
                {loading ? "Loading…" : `${list.length} of page ${pageNumber + 1}/${totalPages}`}
              </div>
            </div>

            {err && <div className="alert alert-danger">Failed to load courses.</div>}

            {!err && (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "10%" }}>Code</th>
                      <th style={{ width: "22%" }}>Title</th>
                      <th>Description</th>
                      <th style={{ width: "10%" }} className="text-center">Day</th>
                      <th style={{ width: "10%" }} className="text-center">Time</th>
                      <th style={{ width: "12%" }}>Hall</th>
                      <th style={{ width: "10%" }} className="text-center">Capacity</th>
                      <th style={{ width: "8%" }} className="text-center">Open</th>
                      <th style={{ width: "12%" }} className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-4 text-muted">
                          {loading ? "Loading courses…" : "No courses found."}
                        </td>
                      </tr>
                    ) : (
                      list.map((c) => {
                        const already = enrolledIds.has(c.id);
                        return (
                          <tr key={c.id}>
                            <td><span className="badge text-bg-secondary">{c.code}</span></td>
                            <td className="fw-semibold">{c.title}</td>
                            <td className="text-truncate">{c.description || "—"}</td>
                            <td className="text-center">{c.lectureDay || "—"}</td>
                            <td className="text-center">{formatTime(c.lectureTime)}</td>
                            <td>{c.lectureHall || "—"}</td>
                            <td className="text-center">{c.capacity ?? "—"}</td>
                            <td className="text-center">
                              <span className={`badge ${c.enrollmentOpen ? "text-bg-success" : "text-bg-secondary"}`}>
                                {c.enrollmentOpen ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-success"
                                disabled={already || enrolling[c.id]}
                                onClick={() => onEnroll(c)}
                              >
                                {already ? "Enrolled" : enrolling[c.id] ? "Enrolling…" : "Enroll"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer d-flex justify-content-between">
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
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(t) {
  if (!t) return "—";
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}
