// src/services/adminService.js
import axios from "axios";

/** ===== Axios (standalone) ===== */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const TOKEN_KEY = "auth_token";

const api = axios.create({ baseURL: API_BASE });

// Attach Authorization from the same key used at login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const unpack = (res) => res.data;

/** ===== Helpers for dashboard stats ===== */
async function getCountFromPage(path) {
  try {
    const data = await api.get(path, { params: { page: 0, size: 1 } }).then(unpack);
    return typeof data?.totalElements === "number" ? data.totalElements : 0;
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
  // 1) Preferred: admin stats endpoint
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
  } catch {
    // fall through to compute
  }

  // 2) Compute using paged resources (requires ADMIN for instructors/students)
  const [instructors, students, courses] = await Promise.all([
    getCountFromPage("/api/instructors"),
    getCountFromPage("/api/students"),
    getCountFromPage("/api/courses"),
  ]);

  // Compute enrollments by summing per-course counts (no /api/enrollments root)
  let totalEnrollments = 0;
  try {
    const courseIds = await getAllCourseIds();
    const concurrency = 8;
    for (let i = 0; i < courseIds.length; i += concurrency) {
      const batch = courseIds.slice(i, i + concurrency);
      const counts = await Promise.all(batch.map((id) => getEnrollmentCountForCourse(id)));
      totalEnrollments += counts.reduce((a, b) => a + (b || 0), 0);
    }
  } catch {
    totalEnrollments = 0;
  }

  return {
    instructors,
    students,
    courses,
    enrollments: totalEnrollments,
    source: "computed-per-course",
  };
}

/** ===== Course Management ===== */
function listCourses({ page = 0, size = 10, q = "" } = {}) {
  return api.get("/api/courses", { params: { page, size, q } }).then(unpack);
}
function getCourseById(id) {
  return api.get(`/api/courses/${id}`).then(unpack);
}
function createCourse(payload) {
  return api.post("/api/courses", payload).then(unpack);
}
function updateCourse(id, payload) {
  return api.put(`/api/courses/${id}`, payload).then(unpack);
}
function deleteCourse(id) {
  return api.delete(`/api/courses/${id}`).then(unpack);
}

/** ===== Instructor Management ===== */
function listInstructors({ page = 0, size = 10, q = "" } = {}) {
  return api.get("/api/instructors", { params: { page, size, q } }).then(unpack);
}
function getInstructorById(id) {
  return api.get(`/api/instructors/${id}`).then(unpack);
}
function createInstructor(payload) {
  // payload: { staffNo, firstName, lastName, email, phone }
  return api.post("/api/instructors", payload).then(unpack);
}
function updateInstructor(id, payload) {
  // payload: { staffNo?, firstName?, lastName?, email?, phone? }
  return api.put(`/api/instructors/${id}`, payload).then(unpack);
}
function deleteInstructor(id) {
  return api.delete(`/api/instructors/${id}`).then(unpack);
}

/** Instructor <-> Course assignment */
function listAssignedCourses(instructorId, { page = 0, size = 100 } = {}) {
  return api
    .get(`/api/instructors/${instructorId}/courses`, { params: { page, size } })
    .then(unpack);
}
function assignInstructorToCourse(instructorId, courseId) {
  return api.post(`/api/instructors/${instructorId}/courses/${courseId}`).then(unpack);
}
function unassignInstructorFromCourse(instructorId, courseId) {
  return api.delete(`/api/instructors/${instructorId}/courses/${courseId}`).then(unpack);
}

/**
 * Create an AppUser for the instructor (role=INSTRUCTOR, default password = instructor123).
 * Tries /api/admin/users then /api/users; fails silently if neither exists.
 */
async function createAppUserForInstructor({ username, instructorId, password = "instructor123" }) {
  const body = { username, password, role: "INSTRUCTOR", instructorId };

  try {
    await api.post("/api/admin/users", body).then(unpack);
    return true;
  } catch {}
  try {
    await api.post("/api/users", body).then(unpack);
    return true;
  } catch {}
  return false;
}

/** Convenience: create instructor then auto-create linked AppUser. */
async function createInstructorWithUser(payload) {
  const created = await createInstructor(payload);
  const email = payload?.email || created?.email;
  if (created?.id && email) {
    await createAppUserForInstructor({ username: email, instructorId: created.id, password: "instructor123" });
  }
  return created;
}

const AdminService = {
  getOverviewCounts,
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,

  listInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  createInstructorWithUser,

  // NEW for assignment
  listAssignedCourses,
  assignInstructorToCourse,
  unassignInstructorFromCourse,
};

export default AdminService;
export { api };



// // src/services/adminService.js
// import axios from "axios";

// /** ===== Axios (standalone) ===== */
// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
// const TOKEN_KEY = "auth_token";

// const api = axios.create({ baseURL: API_BASE });

// // Attach Authorization from the same key used at login
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem(TOKEN_KEY);
//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// const unpack = (res) => res.data;

// /** ===== Helpers for dashboard stats ===== */
// async function getCountFromPage(path) {
//   try {
//     const data = await api.get(path, { params: { page: 0, size: 1 } }).then(unpack);
//     return typeof data?.totalElements === "number" ? data.totalElements : 0;
//   } catch {
//     return 0;
//   }
// }

// async function getAllCourseIds() {
//   const ids = [];
//   let page = 0;
//   while (true) {
//     const data = await api
//       .get("/api/courses", { params: { page, size: 100 } })
//       .then(unpack)
//       .catch(() => null);
//     if (!data) break;
//     (data.content || []).forEach((c) => ids.push(c.id));
//     if (data.last || page >= (data.totalPages ?? 1) - 1) break;
//     page += 1;
//   }
//   return ids;
// }

// async function getEnrollmentCountForCourse(courseId) {
//   try {
//     const data = await api
//       .get(`/api/enrollments/courses/${courseId}`, { params: { page: 0, size: 1 } })
//       .then(unpack);
//     return typeof data?.totalElements === "number" ? data.totalElements : 0;
//   } catch {
//     return 0;
//   }
// }

// async function getOverviewCounts() {
//   // 1) Preferred: admin stats endpoint
//   try {
//     const stats = await api.get("/api/admin/stats").then(unpack);
//     const norm = (n) => (typeof n === "number" ? n : 0);
//     return {
//       instructors: norm(stats.instructors),
//       students: norm(stats.students),
//       courses: norm(stats.courses),
//       enrollments: norm(stats.enrollments),
//       source: "stats-endpoint",
//     };
//   } catch {
//     // fall through to compute
//   }

//   // 2) Compute using paged resources (requires ADMIN for instructors/students)
//   const [instructors, students, courses] = await Promise.all([
//     getCountFromPage("/api/instructors"),
//     getCountFromPage("/api/students"),
//     getCountFromPage("/api/courses"),
//   ]);

//   // Compute enrollments by summing per-course counts (no /api/enrollments root)
//   let totalEnrollments = 0;
//   try {
//     const courseIds = await getAllCourseIds();
//     const concurrency = 8;
//     for (let i = 0; i < courseIds.length; i += concurrency) {
//       const batch = courseIds.slice(i, i + concurrency);
//       const counts = await Promise.all(batch.map((id) => getEnrollmentCountForCourse(id)));
//       totalEnrollments += counts.reduce((a, b) => a + (b || 0), 0);
//     }
//   } catch {
//     totalEnrollments = 0;
//   }

//   return {
//     instructors,
//     students,
//     courses,
//     enrollments: totalEnrollments,
//     source: "computed-per-course",
//   };
// }

// /** ===== Course Management ===== */
// function listCourses({ page = 0, size = 10, q = "" } = {}) {
//   return api.get("/api/courses", { params: { page, size, q } }).then(unpack);
// }
// function getCourseById(id) {
//   return api.get(`/api/courses/${id}`).then(unpack);
// }
// function createCourse(payload) {
//   return api.post("/api/courses", payload).then(unpack);
// }
// function updateCourse(id, payload) {
//   return api.put(`/api/courses/${id}`, payload).then(unpack);
// }
// function deleteCourse(id) {
//   return api.delete(`/api/courses/${id}`).then(unpack);
// }

// const AdminService = {
//   getOverviewCounts,
//   listCourses,
//   getCourseById,
//   createCourse,
//   updateCourse,
//   deleteCourse,
// };

// export default AdminService;
// export { api };
