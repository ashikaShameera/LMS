// src/services/InstructorService.js
import { api, getAuthToken, getAuthInfo } from "./StudentServise";

const unpack = (res) => res.data;

function decodeJwtPayload() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function getInstructorIdFromAuth() {
  // 1) prefer saved auth_info (set at login)
  const info = getAuthInfo();
  if (info?.instructorId != null) return info.instructorId;

  // 2) fallback: read iid from JWT payload
  const payload = decodeJwtPayload();
  return payload?.iid ?? null;
}

const InstructorService = {
  /** /api/instructors/{id} (uses id from auth, not from caller) */
  getInstructor: () => {
    const iid = getInstructorIdFromAuth();
    if (iid == null) throw new Error("Not authenticated as instructor");
    return api.get(`/api/instructors/${iid}`).then(unpack);
  },

  /** /api/instructors/{instructorId}/courses (id from auth) */
  getAssignedCourses: ({ page = 0, size = 12 } = {}) => {
    const iid = getInstructorIdFromAuth();
    if (iid == null) throw new Error("Not authenticated as instructor");
    return api
      .get(`/api/instructors/${iid}/courses`, { params: { page, size } })
      .then(unpack);
  },

  /** /api/enrollments/courses/{courseId} -> Page<EnrollmentDto> */
  getEnrollmentsByCourse: (courseId, { page = 0, size = 50 } = {}) =>
    api.get(`/api/enrollments/courses/${courseId}`, { params: { page, size } }).then(unpack),

  /** Count via Page.totalElements (cheap) */
  getEnrollmentCountByCourse: async (courseId) => {
    const page = await InstructorService.getEnrollmentsByCourse(courseId, { page: 0, size: 1 });
    return typeof page?.totalElements === "number" ? page.totalElements : 0;
  },

  /** Fetch a single student for the modal table */
  getStudentById: (studentId) => api.get(`/api/students/${studentId}`).then(unpack),

  /** Grades in a course: Page<GradeDto> */
  getGradesByCourse: (courseId, { page = 0, size = 1000 } = {}) =>
    api.get(`/api/grades/courses/${courseId}`, { params: { page, size } }).then(unpack),

  /**
   * Upsert a grade for a (student, course).
   * Backend GradeUpsertRequest: { instructorId, studentId, courseId, score }
   */
  upsertGrade: ({ studentId, courseId, score }) => {
    const iid = getInstructorIdFromAuth();
    if (iid == null) throw new Error("Not authenticated as instructor");
    return api.post(`/api/grades`, { instructorId: iid, studentId, courseId, score }).then(unpack);
  },
};

export default InstructorService;
export { api };
