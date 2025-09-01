import React from "react";
import { NavLink, Outlet } from "react-router-dom";

/**
 * Simple Admin layout reusing the same CSS grid as student/instructor.
 * Sidebar shows 4 pages: Dashboard, Course Management, Instructor Management, Student Management.
 */
export default function AdminDashboardLayout() {
  return (
    <div className="container-fluid p-0 student-shell">
      {/* Sidebar */}
      <aside className="student-sidebar border-end bg-dark text-white">
        <div className="px-3 py-3 d-flex align-items-center gap-2 border-bottom border-secondary">
          <div className="brand-icon rounded bg-primary text-white fw-bold d-grid place-center">
            UC
          </div>
          <div className="fw-semibold">UniCourse Admin</div>
        </div>

        <div className="p-3">
          <div className="d-flex align-items-start gap-2">
            <div className="avatar rounded-circle bg-secondary text-white fw-bold">AD</div>
            <div className="min-w-0">
              <div className="fw-semibold small text-truncate text-white">Administrator</div>
              <div className="text-light small text-truncate">admin@university.edu</div>
              <span className="badge rounded-pill text-bg-primary mt-1">ADMIN</span>
            </div>
          </div>
        </div>

        <nav className="nav flex-column px-2">
          <NavLink to="/admin/dashboard" className="nav-link text-white">Dashboard</NavLink>
          <NavLink to="/admin/courses" className="nav-link text-white">Course Management</NavLink>
          <NavLink to="/admin/instructors" className="nav-link text-white">Instructor Management</NavLink>
          <NavLink to="/admin/students" className="nav-link text-white">Student Management</NavLink>
        </nav>

        <div className="mt-auto p-3 small border-top border-secondary">
          <button className="btn btn-outline-light w-100">Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="student-content">
        <div className="container-fluid py-4">
          <h1 className="h3 mb-1">Admin Dashboard</h1>
          <p className="text-muted mb-4">Overview & management</p>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
