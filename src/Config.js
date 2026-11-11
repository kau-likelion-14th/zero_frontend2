const config = {
  API_URL: "",
  TODO: {
    LIST: "/api/todos",
    CALENDAR: "/api/todos/calendar",
    COMPLETE: (id, date) => `/api/todos/${encodeURIComponent(id)}/dates/${date}/complete`,
    CATEGORIES: "/api/categories",
  },
  FOLLOW: {
    PROFILE: (id) => `/api/follow/${encodeURIComponent(id)}`,
    TODOS: (id) => `/api/follow/${encodeURIComponent(id)}/todos`,
    CALENDAR: (id) => `/api/follow/${encodeURIComponent(id)}/calendar`,
    FOLLOWINGS: "/api/follow/followings",
    SEARCH: "/api/follow/search",
    CREATE: "/api/follow",
    DELETE: "/api/follow",
    AVAILABLE: "/api/follow",
  },
  AUTH: {
    KAKAO: "/api/auth/kakao",
    REISSUE: "/api/auth/reissue",
    LOGOUT: "/api/auth/logout",
    WITHDRAW: "/api/auth/withdraw",
  },
};
export default config;
