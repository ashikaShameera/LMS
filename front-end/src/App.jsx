import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import StudentDashboardLayout from "./layout/StudentDashboardLayout.jsx";
import EnrolledCourses from "./pages/student/EnrolledCourses.jsx";
import CourseCatalog from "./pages/student/CourseCatalog.jsx";
import MyResults from "./pages/student/MyResults.jsx";

import InstructorDashboardLayout from "./layout/InstructorDashboardLayout.jsx";
import MyCourses from "./pages/instructor/MyCourses.jsx";
import ResultManagement from "./pages/instructor/ResultManagement.jsx";
import ManageCourseGrades from "./pages/instructor/ManageCourseGrades.jsx";

import AdminDashboardLayout from "./layout/AdminDashboardLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminCourseManagement from "./pages/admin/AdminCourseManagement.jsx";

import Login from "./pages/auth/Login.jsx";
import RequireAuth from "./pages/auth/RequireAuth.jsx";

// // Temporary admin placeholders
// const AdminInstructorManagement = () => (
//   <div className="alert alert-secondary">Instructor Management (placeholder)</div>
// );

import AdminInstructorManagement from "./pages/admin/AdminInstructorManagement.jsx"; 

const AdminStudentManagement = () => (
  <div className="alert alert-secondary">Student Management (placeholder)</div>
);

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Student (protected, enforce own studentId) */}
      <Route element={<RequireAuth allowedRoles={["STUDENT"]} enforceSelf />}>
        <Route path="/students/:studentId" element={<StudentDashboardLayout />}>
          <Route index element={<Navigate to="courses" replace />} />
          <Route path="courses" element={<EnrolledCourses />} />
          <Route path="catalog" element={<CourseCatalog />} />
          <Route path="results" element={<MyResults />} />
        </Route>
      </Route>

      {/* Instructor (protected, enforce own instructorId) */}
      <Route element={<RequireAuth allowedRoles={["INSTRUCTOR"]} enforceSelf />}>
        <Route path="/instructors/:instructorId" element={<InstructorDashboardLayout />}>
          <Route index element={<Navigate to="courses" replace />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="results" element={<ResultManagement />} />
          <Route path="results/:courseId" element={<ManageCourseGrades />} />
        </Route>
      </Route>

      {/* Admin (protected) */}
      <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminDashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourseManagement />} />
          <Route path="instructors" element={<AdminInstructorManagement />} />
          <Route path="students" element={<AdminStudentManagement />} />
        </Route>
      </Route>

      {/* Default -> Login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
