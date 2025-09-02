// Thin auth wrapper that reuses the axios instance & helpers from StudentServise
import StudentServise, {
  api,
  getAuthInfo as _getAuthInfo,
  getAuthToken as _getAuthToken,
  setAuthToken as _setAuthToken,
  clearAuth as _clearAuth,
} from "./StudentServise";

function safeDecode() {                         // <--- ADDED: robust decoder
  const token = _getAuthToken?.() ?? localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      role: payload?.role ?? null,
      userId: payload?.uid ?? null,
      studentId: payload?.sid ?? null,
      instructorId: payload?.iid ?? null,      // <--- ensure iid -> instructorId
    };
  } catch {
    return null;
  }
}

const AuthService = {
  /** Login -> stores token & claims (role, userId, studentId, instructorId) */
  login: (username, password) => StudentServise.login(username, password),

  /** Logout -> clears token & claims */
  logout: () => _clearAuth(),

  /** Helpers */
  getAuthInfo: () => {
    // prefer upstream, but fix missing instructorId if needed
    const info = _getAuthInfo?.();
    if (info?.instructorId != null || info?.studentId != null || info?.role) return info;
    return safeDecode();                         // <--- fallback to decode JWT
  },
  getAuthToken: () => _getAuthToken?.() ?? localStorage.getItem("token"),
  setAuthToken: (t) => _setAuthToken?.(t) ?? localStorage.setItem("token", t),

  /** Compute default landing path by role */
  resolveHomePath(info) {
    if (!info) return "/login";
    const role = String(info.role || "").toUpperCase();
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "INSTRUCTOR" && info.instructorId != null)
      return `/instructors/${info.instructorId}/courses`;
    if (role === "STUDENT" && info.studentId != null)
      return `/students/${info.studentId}/courses`;
    return "/login";
  },
};

export default AuthService;
export { api };
