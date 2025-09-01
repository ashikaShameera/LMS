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



const AdminInstructorManagement = () => (
  <div className="alert alert-secondary">Instructor Management (placeholder)</div>
);
const AdminStudentManagement = () => (
  <div className="alert alert-secondary">Student Management (placeholder)</div>
);

export default function App() {
  return (
    <Routes>
      {/* Student */}
      <Route path="/students/:studentId" element={<StudentDashboardLayout />}>
        <Route index element={<Navigate to="courses" replace />} />
        <Route path="courses" element={<EnrolledCourses />} />
        <Route path="catalog" element={<CourseCatalog />} />
        <Route path="results" element={<MyResults />} />
      </Route>

      {/* Instructor */}
      <Route path="/instructors/:instructorId" element={<InstructorDashboardLayout />}>
        <Route index element={<Navigate to="courses" replace />} />
        <Route path="courses" element={<MyCourses />} />
        <Route path="results" element={<ResultManagement />} />
        <Route path="results/:courseId" element={<ManageCourseGrades />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminDashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="courses" element={<AdminCourseManagement />} />
        <Route path="instructors" element={<AdminInstructorManagement />} />
        <Route path="students" element={<AdminStudentManagement />} />
      </Route>

      {/* Default */}
      <Route path="*" element={<Navigate to="/students/1/courses" replace />} />
    </Routes>
  );
}
