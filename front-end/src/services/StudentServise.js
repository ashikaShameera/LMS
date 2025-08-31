import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080", // e.g. http://localhost:8080
});

const unpack = (res) => res.data;

const StudentServise = {
  /** Student profile */
  getStudent: (studentId) => api.get(`/api/students/${studentId}`).then(unpack),

  /** Enrolled courses for a student (Spring Page<CourseDto>) */
  getEnrolledCourses: (studentId, { page = 0, size = 12 } = {}) =>
    api
      .get(`/api/students/${studentId}/courses`, { params: { page, size } })
      .then(unpack),

  /** ALL courses (Spring Page<CourseDto>) — adjust endpoint if your API differs */
  getCourses: ({ page = 0, size = 12, q = "" } = {}) =>
    api.get(`/api/courses`, { params: { page, size, q } }).then(unpack),

  /** Enroll */
  enroll: (studentId, courseId) =>
    api.post(`/api/enrollments`, { studentId, courseId }).then(unpack),

  /** Unenroll */
  unenroll: (studentId, courseId) =>
    api.delete(`/api/enrollments`, { params: { studentId, courseId } }),

    /** ---------- NEW: Grades APIs ---------- */

  /** /api/grades/students/{studentId} => Page<GradeDto> */
  getGradesByStudent: (studentId, { page = 0, size = 100 } = {}) =>
    api
      .get(`/api/grades/students/${studentId}`, { params: { page, size } })
      .then(unpack),

  /** /api/grades/students/{studentId}/summary => GradeSummaryDto */
  getGradeSummary: (studentId) =>
    api.get(`/api/grades/students/${studentId}/summary`).then(unpack),
};

export default StudentServise;
export { api };
