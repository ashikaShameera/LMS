import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080", // e.g. http://localhost:8080
});

const unpack = (res) => res.data;

/** ---------- Helpers used by the dashboard stats ---------- */
async function getCountFromPage(path) {
  try {
    const data = await api.get(path, { params: { page: 0, size: 1 } }).then(unpack);
    const total = typeof data?.totalElements === "number" ? data.totalElements : 0;
    return total;
  } catch {
    return 0;
  }
}
async function getAllCourseIds() {
  const ids = [];
  let page = 0;
  while (true) {
    const data = await api
      .get("/api/courses", { params: { page, size: 100 } })
      .then(unpack)
      .catch(() => null);
    if (!data) break;
    (data.content || []).forEach((c) => ids.push(c.id));
    if (data.last || page >= (data.totalPages ?? 1) - 1) break;
    page += 1;
  }
  return ids;
}
async function getEnrollmentCountForCourse(courseId) {
  try {
    const data = await api
      .get(`/api/enrollments/courses/${courseId}`, { params: { page: 0, size: 1 } })
      .then(unpack);
    return typeof data?.totalElements === "number" ? data.totalElements : 0;
  } catch {
    return 0;
  }
}
async function getOverviewCounts() {
  try {
    const stats = await api.get("/api/admin/stats").then(unpack);
    const norm = (n) => (typeof n === "number" ? n : 0);
    return {
      instructors: norm(stats.instructors),
      students: norm(stats.students),
      courses: norm(stats.courses),
      enrollments: norm(stats.enrollments),
      source: "stats-endpoint",
    };
  } catch {}

  const [instructors, students, courses] = await Promise.all([
    getCountFromPage("/api/instructors"),
    getCountFromPage("/api/students"),
    getCountFromPage("/api/courses"),
  ]);

  let enrollments = 0;
  try {
    enrollments = await getCountFromPage("/api/enrollments");
    if (enrollments > 0) {
      return { instructors, students, courses, enrollments, source: "paged-lists+global-enrollments" };
    }
  } catch {}

  let totalEnrollments = 0;
  try {
    const courseIds = await getAllCourseIds();
    const chunks = [];
    const concurrency = 8;
    for (let i = 0; i < courseIds.length; i += concurrency) {
      chunks.push(courseIds.slice(i, i + concurrency));
    }
    for (const chunk of chunks) {
      const partial = await Promise.all(chunk.map((id) => getEnrollmentCountForCourse(id)));
      totalEnrollments += partial.reduce((a, b) => a + (b || 0), 0);
    }
  } catch {
    totalEnrollments = 0;
  }

  return { instructors, students, courses, enrollments: totalEnrollments, source: "computed-per-course" };
}

/** ---------- Course Management endpoints ---------- */
function listCourses({ page = 0, size = 10, q = "" } = {}) {
  return api.get("/api/courses", { params: { page, size, q } }).then(unpack);
}
function getCourseById(id) {
  return api.get(`/api/courses/${id}`).then(unpack);
}
function createCourse(payload) {
  // payload includes: code, title, description, lectureHall, lectureDay, lectureTime, capacity, enrollmentOpen
  return api.post("/api/courses", payload).then(unpack);
}
function updateCourse(id, payload) {
  // payload includes the same keys as createCourse
  return api.put(`/api/courses/${id}`, payload).then(unpack);
}
function deleteCourse(id) {
  return api.delete(`/api/courses/${id}`).then(unpack);
}

const AdminService = {
  // dashboard
  getOverviewCounts,
  // courses
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};

export default AdminService;
export { api };
