import React from "react";
import AdminService from "../../services/adminService";

/**
 * Admin Course Management
 * - Table of courses
 * - Add Course (modal with lectureDay + enrollmentOpen)
 * - Edit Course (modal with lectureDay + enrollmentOpen)
 * - Delete Course (confirm)
 */
export default function AdminCourseManagement() {
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(10);

  const [data, setData] = React.useState({ content: [], totalPages: 1, number: 0, last: true });
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);

  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null); // current course to edit

  const [form, setForm] = React.useState(blankForm());

  function blankForm() {
    return {
      code: "",
      title: "",
      description: "",
      lectureHall: "",
      lectureDay: "",   // NEW
      lectureTime: "",  // HH:mm
      capacity: "",
      enrollmentOpen: true,
    };
  }

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await AdminService.listCourses({ page, size, q });
      setData(res || { content: [], totalPages: 1, number: 0, last: true });
    } catch (e) {
      console.error(e);
      setErr(e);
      setData({ content: [], totalPages: 1, number: 0, last: true });
    } finally {
      setLoading(false);
    }
  }, [page, size, q]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setForm(blankForm());
    setAddOpen(true);
  };
  const closeAdd = () => setAddOpen(false);

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      code: course.code || "",
      title: course.title || "",
      description: course.description || "",
      lectureHall: course.lectureHall || "",
      lectureDay: course.lectureDay || "",           // NEW
      lectureTime: toTimeInput(course.lectureTime),
      capacity: course.capacity ?? "",
      enrollmentOpen: !!course.enrollmentOpen,
    });
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    try {
      await AdminService.createCourse(normalizePayload(form)); // includes lectureDay
      closeAdd();
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to create course.");
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await AdminService.updateCourse(editing.id, normalizePayload(form)); // includes lectureDay
      closeEdit();
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to update course.");
    }
  };

  const remove = async (course) => {
    if (!window.confirm(`Delete course "${course.title}"? This cannot be undone.`)) return;
    try {
      await AdminService.deleteCourse(course.id);
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to delete course.");
    }
  };

  const courses = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPageIdx = data?.number ?? 0;
  const isLast = typeof data?.last === "boolean" ? data.last : currentPageIdx >= totalPages - 1;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="h6 m-0">Course Management</h2>
          <div className="text-muted small">Create, update, and delete courses</div>
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
              placeholder="Search courses..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>
          <button className="btn btn-primary" onClick={openAdd}>
            Add Course
          </button>
        </div>
      </div>

      {loading && <div className="text-muted">Loading courses…</div>}
      {err && <div className="alert alert-danger">Failed to load courses.</div>}

      {!loading && !err && (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "10%" }}>Code</th>
                    <th style={{ width: "20%" }}>Title</th>
                    <th>Description</th>
                    <th style={{ width: "8%" }} className="text-center">Day</th>
                    <th style={{ width: "8%" }} className="text-center">Time</th>
                    <th style={{ width: "12%" }}>Hall</th>
                    <th style={{ width: "10%" }} className="text-center">Capacity</th>
                    <th style={{ width: "9%" }} className="text-center">Open</th>
                    <th style={{ width: "15%" }} className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4 text-muted">No courses found.</td>
                    </tr>
                  ) : (
                    courses.map((c) => (
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
                          <div className="btn-group">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(c)}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => remove(c)}>
                              Delete
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

      {/* Add Modal */}
      {addOpen && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg" role="document">
            <form className="modal-content" onSubmit={submitAdd}>
              <div className="modal-header">
                <h5 className="modal-title">Add Course</h5>
                <button type="button" className="btn-close" onClick={closeAdd} />
              </div>
              <div className="modal-body">
                <CourseForm form={form} onChange={onChange} />
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

      {/* Edit Modal */}
      {editOpen && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg" role="document">
            <form className="modal-content" onSubmit={submitEdit}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Course</h5>
                <button type="button" className="btn-close" onClick={closeEdit} />
              </div>
              <div className="modal-body">
                <CourseForm form={form} onChange={onChange} />
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
    </>
  );
}

/** Shared form fields (includes lectureDay + enrollmentOpen) */
function CourseForm({ form, onChange }) {
  const DAYS = [
    "", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
  ];

  return (
    <div className="row g-3">
      <div className="col-md-4">
        <label className="form-label">Code</label>
        <input
          className="form-control"
          name="code"
          value={form.code}
          onChange={onChange}
          required
        />
      </div>
      <div className="col-md-8">
        <label className="form-label">Title</label>
        <input
          className="form-control"
          name="title"
          value={form.title}
          onChange={onChange}
          required
        />
      </div>

      <div className="col-12">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          name="description"
          rows={3}
          value={form.description}
          onChange={onChange}
        />
      </div>

      <div className="col-md-4">
        <label className="form-label">Lecture Hall</label>
        <input
          className="form-control"
          name="lectureHall"
          value={form.lectureHall}
          onChange={onChange}
        />
      </div>

      <div className="col-md-4">
        <label className="form-label">Lecture Day</label>
        <select
          className="form-select"
          name="lectureDay"
          value={form.lectureDay}
          onChange={onChange}
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d === "" ? "— Select —" : d.charAt(0) + d.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="col-md-4">
        <label className="form-label">Lecture Time</label>
        <input
          type="time"
          className="form-control"
          name="lectureTime"
          value={form.lectureTime}
          onChange={onChange}
        />
      </div>

      <div className="col-md-4">
        <label className="form-label">Capacity</label>
        <input
          type="number"
          min={0}
          className="form-control"
          name="capacity"
          value={form.capacity}
          onChange={onChange}
        />
      </div>

      <div className="col-12">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="enrollmentOpen"
            name="enrollmentOpen"
            checked={form.enrollmentOpen}
            onChange={onChange}
          />
          <label className="form-check-label" htmlFor="enrollmentOpen">
            Enrollment Open
          </label>
        </div>
      </div>
    </div>
  );
}

/** format utils */
function formatTime(t) {
  if (!t) return "—";
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}
function toTimeInput(t) {
  if (!t) return "";
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}
function normalizePayload(f) {
  return {
    code: f.code?.trim(),
    title: f.title?.trim(),
    description: f.description?.trim() || "",
    lectureHall: f.lectureHall?.trim() || "",
    lectureDay: f.lectureDay || "",   // NEW
    lectureTime: f.lectureTime || null, // LocalTime HH:mm or null
    capacity: f.capacity === "" ? null : Number(f.capacity),
    enrollmentOpen: !!f.enrollmentOpen,
  };
}
