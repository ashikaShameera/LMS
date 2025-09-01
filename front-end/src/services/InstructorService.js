import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080", // e.g. http://localhost:8080
});

const unpack = (res) => res.data;

const InstructorService = {
  /** /api/instructors/{id} */
  getInstructor: (instructorId) =>
    api.get(`/api/instructors/${instructorId}`).then(unpack),

  /** /api/instructors/{instructorId}/courses */
  getAssignedCourses: (instructorId, { page = 0, size = 12 } = {}) =>
    api
      .get(`/api/instructors/${instructorId}/courses`, { params: { page, size } })
      .then(unpack),

  /** /api/enrollments/courses/{courseId} -> Page<EnrollmentDto> */
  getEnrollmentsByCourse: (courseId, { page = 0, size = 50 } = {}) =>
    api
      .get(`/api/enrollments/courses/${courseId}`, { params: { page, size } })
      .then(unpack),

  /** Count via Page.totalElements (cheap) */
  getEnrollmentCountByCourse: async (courseId) => {
    const page = await InstructorService.getEnrollmentsByCourse(courseId, {
      page: 0,
      size: 1,
    });
    return typeof page?.totalElements === "number" ? page.totalElements : 0;
  },

  /** NEW: fetch a single student for the modal table */
  getStudentById: (studentId) =>
    api.get(`/api/students/${studentId}`).then(unpack),

   /** Grades in a course: Page<GradeDto> */
  getGradesByCourse: (courseId, { page = 0, size = 1000 } = {}) =>
    api.get(`/api/grades/courses/${courseId}`, { params: { page, size } }).then(unpack),

  /**
   * Upsert a grade for a (student, course).
   * Backend GradeUpsertRequest is assumed as: { studentId, courseId, score }
   * Letter/gradePoint are derived server-side.
   */
  upsertGrade: ({ studentId, courseId, score }) =>
    api.post(`/api/grades`, { studentId, courseId, score }).then(unpack),
};

export default InstructorService;
export { api };
