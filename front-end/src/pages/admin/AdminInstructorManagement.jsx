import React from "react";
import AdminService from "../../services/adminService";

/**
 * Admin Instructor Management
 * - Table of instructors
 * - Add / Edit / Delete
 * - Assign Course: opens modal with searchable course list and "Assign" button
 */
export default function AdminInstructorManagement() {
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(10);

  const [data, setData] = React.useState({ content: [], totalPages: 1, number: 0, last: true });
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);

  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  // NEW: Assign course modal
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [assignTarget, setAssignTarget] = React.useState(null);

  const [form, setForm] = React.useState(blankForm());

  function blankForm() {
    return {
      staffNo: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    };
  }

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await AdminService.listInstructors({ page, size, q });
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

  const openAdd = () => {
    setForm(blankForm());
    setAddOpen(true);
  };
  const closeAdd = () => setAddOpen(false);

  const openEdit = (instructor) => {
    setEditing(instructor);
    setForm({
      staffNo: instructor.staffNo || "",
      firstName: instructor.firstName || "",
      lastName: instructor.lastName || "",
      email: instructor.email || "",
      phone: instructor.phone || "",
    });
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    try {
      await AdminService.createInstructorWithUser(normalizePayload(form));
      closeAdd();
      await load();
    } catch (err) {
      alert("Failed to create instructor.");
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await AdminService.updateInstructor(editing.id, normalizePayload(form));
      closeEdit();
      await load();
    } catch (err) {
      alert("Failed to update instructor.");
    }
  };

  const remove = async (instructor) => {
    if (!window.confirm(`Delete instructor "${instructor.firstName} ${instructor.lastName}"?`)) return;
    try {
      await AdminService.deleteInstructor(instructor.id);
      await load();
    } catch (err) {
      alert("Failed to delete instructor.");
    }
  };

  // NEW: open/close assign modal
  const openAssign = (instructor) => {
    setAssignTarget(instructor);
    setAssignOpen(true);
  };
  const closeAssign = () => {
    setAssignOpen(false);
    setAssignTarget(null);
  };

  const instructors = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPageIdx = data?.number ?? 0;
  const isLast = typeof data?.last === "boolean" ? data.last : currentPageIdx >= totalPages - 1;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="h6 m-0">Instructor Management</h2>
          <div className="text-muted small">Create, update, and delete instructors</div>
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
              placeholder="Search instructors..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>
          <button className="btn btn-primary" onClick={openAdd}>
            Add Instructor
          </button>
        </div>
      </div>

      {loading && <div className="text-muted">Loading instructors…</div>}
      {err && <div className="alert alert-danger">Failed to load instructors.</div>}

      {!loading && !err && (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "12%" }}>Staff No</th>
                    <th style={{ width: "22%" }}>Name</th>
                    <th style={{ width: "28%" }}>Email</th>
                    <th style={{ width: "18%" }}>Phone</th>
                    <th style={{ width: "20%" }} className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">No instructors found.</td>
                    </tr>
                  ) : (
                    instructors.map((i) => (
                      <tr key={i.id}>
                        <td><span className="badge text-bg-secondary">{i.staffNo}</span></td>
                        <td className="fw-semibold">{formatName(i)}</td>
                        <td className="text-truncate">{i.email || "—"}</td>
                        <td>{i.phone || "—"}</td>
                        <td className="text-center">
                          <div className="btn-group">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(i)}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => remove(i)}>
                              Delete
                            </button>
                            {/* NEW: Assign Course */}
                            <button className="btn btn-sm btn-outline-success" onClick={() => openAssign(i)}>
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

      {/* Add Modal */}
      {addOpen && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog" role="document">
            <form className="modal-content" onSubmit={submitAdd}>
              <div className="modal-header">
                <h5 className="modal-title">Add Instructor</h5>
                <button type="button" className="btn-close" onClick={closeAdd} />
              </div>
              <div className="modal-body">
                <InstructorForm form={form} onChange={onChange} />
                <div className="alert alert-info mt-3 mb-0 small">
                  An AppUser will be created with role <strong>INSTRUCTOR</strong> and default password <code>ChangeMe123!</code>
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

      {/* Edit Modal */}
      {editOpen && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog" role="document">
            <form className="modal-content" onSubmit={submitEdit}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Instructor</h5>
                <button type="button" className="btn-close" onClick={closeEdit} />
              </div>
              <div className="modal-body">
                <InstructorForm form={form} onChange={onChange} />
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
          onClose={closeAssign}
          instructor={assignTarget}
        />
      )}
    </>
  );
}

function InstructorForm({ form, onChange }) {
  return (
    <div className="row g-3">
      <div className="col-md-4">
        <label className="form-label">Staff No</label>
        <input
          className="form-control"
          name="staffNo"
          value={form.staffNo}
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
    </div>
  );
}

function formatName(i) {
  const a = i?.firstName || "";
  const b = i?.lastName || "";
  const joined = (a + " " + b).trim();
  return joined || "—";
}

function normalizePayload(f) {
  return {
    staffNo: f.staffNo?.trim(),
    firstName: f.firstName?.trim(),
    lastName: f.lastName?.trim(),
    email: f.email?.trim(),
    phone: f.phone?.trim() || "",
  };
}

/** ---------- Assign Course Modal ---------- */
function AssignCourseModal({ instructor, onClose }) {
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(8);

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);
  const [courses, setCourses] = React.useState({ content: [], number: 0, totalPages: 1, last: true });

  const [assignedIds, setAssignedIds] = React.useState(new Set()); // courses already assigned
  const [assigning, setAssigning] = React.useState({}); // { [courseId]: boolean }

  const load = React.useCallback(async () => {
    if (!instructor?.id) return;
    try {
      setLoading(true);
      setErr(null);
      const [coursePage, assignedPage] = await Promise.all([
        AdminService.listCourses({ page, size, q }),
        AdminService.listAssignedCourses(instructor.id, { page: 0, size: 500 }),
      ]);
      setCourses(coursePage || { content: [], number: 0, totalPages: 1, last: true });

      const ids = new Set((assignedPage?.content ?? []).map((c) => c.id));
      setAssignedIds(ids);
    } catch (e) {
      setErr(e);
      setCourses({ content: [], number: 0, totalPages: 1, last: true });
      setAssignedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [instructor?.id, page, size, q]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onAssign = async (course) => {
    if (!instructor?.id || !course?.id) return;
    try {
      setAssigning((s) => ({ ...s, [course.id]: true }));
      await AdminService.assignInstructorToCourse(instructor.id, course.id);
      setAssignedIds((prev) => new Set(prev).add(course.id));
    } catch (e) {
      alert("Failed to assign course.");
    } finally {
      setAssigning((s) => ({ ...s, [course.id]: false }));
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
              Assign Course — {formatName(instructor)} <span className="text-muted small">({instructor?.staffNo})</span>
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
                        const assigned = assignedIds.has(c.id);
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
                                disabled={assigned || assigning[c.id]}
                                onClick={() => onAssign(c)}
                              >
                                {assigned ? "Assigned" : assigning[c.id] ? "Assigning…" : "Assign"}
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
