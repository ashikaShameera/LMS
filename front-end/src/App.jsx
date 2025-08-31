import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import StudentDashboardLayout from "./layout/StudentDashboardLayout.jsx";
import EnrolledCourses from "./pages/student/EnrolledCourses.jsx";
import CourseCatalog from "./pages/student/CourseCatalog.jsx";
import MyResults from "./pages/student/MyResults.jsx";

export default function App() {
  // Example route structure:
  // /students/123 -> redirect to /students/123/courses
  return (
    <Routes>
      <Route path="/students/:studentId" element={<StudentDashboardLayout />}>
        <Route index element={<Navigate to="courses" replace />} />
        <Route path="courses" element={<EnrolledCourses />} />
        <Route path="catalog" element={<CourseCatalog />} />
        <Route path="results" element={<MyResults />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/students/1/courses" replace />} />
    </Routes>
  );
}
