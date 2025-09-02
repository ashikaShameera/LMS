// src/services/StudentServise.js
import axios from "axios";

/** ===== Axios instance ===== */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

const unpack = (res) => res.data;

/** ===== Auth handling (JWT) ===== */
const TOKEN_KEY = "auth_token";
const AUTH_INFO_KEY = "auth_info"; // { role, userId, studentId, instructorId }

/** Attach token to every request if present */
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Optional: simple 401 hook (no redirect here; handle in UI if desired) */
api.interceptors.response.use(
  (r) => r,
  (error) => {
    // if (error?.response?.status === 401) { /* e.g., logout() */ }
    return Promise.reject(error);
  }
);

/** Save token + auth info from /api/auth/login response */
function saveAuth(authResponse) {
  if (!authResponse) return;
  const { token, role, userId, studentId, instructorId } = authResponse;
  setAuthToken(token);
  const info = { role, userId, studentId, instructorId };
  localStorage.setItem(AUTH_INFO_KEY, JSON.stringify(info));
}

/** Clear token + auth info */
function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(AUTH_INFO_KEY);
}

/** Set token only */
function setAuthToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** Get token only */
function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

/** Get parsed auth info (role, userId, studentId, instructorId) */
function getAuthInfo() {
  try {
    const raw = localStorage.getItem(AUTH_INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** ===== Public service API ===== */
const StudentServise = {
  /** -------- Auth -------- */
  /**
   * Login and store token/claims.
   * @returns AuthResponse { token, role, userId, studentId, instructorId }
   */
  login: async (username, password) => {
    const res = await api.post(`/api/auth/login`, { username, password }).then(unpack);
    saveAuth(res);
    return res;
  },

  /** Logout (clear stored auth) */
  logout: () => {
    clearAuth();
  },

  /** Expose helpers in case UI needs them */
  getAuthToken,
  getAuthInfo,
  setAuthToken, // rarely needed (e.g., restore token manually)
  clearAuth,

  /** -------- Student APIs -------- */
  /** Student profile */
  getStudent: (studentId) => api.get(`/api/students/${studentId}`).then(unpack),

  /** Enrolled courses for a student (Spring Page<CourseDto>) */
  getEnrolledCourses: (studentId, { page = 0, size = 12 } = {}) =>
    api
      .get(`/api/students/${studentId}/courses`, { params: { page, size } })
      .then(unpack),

  /** ALL courses (Spring Page<CourseDto>) */
  getCourses: ({ page = 0, size = 12, q = "" } = {}) =>
    api.get(`/api/courses`, { params: { page, size, q } }).then(unpack),

  /** Enroll */
  enroll: (studentId, courseId) =>
    api.post(`/api/enrollments`, { studentId, courseId }).then(unpack),

  /** Unenroll */
  unenroll: (studentId, courseId) =>
    api.delete(`/api/enrollments`, { params: { studentId, courseId } }),

  /** -------- Grades -------- */
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
export { api, getAuthToken, getAuthInfo, setAuthToken, clearAuth };
