const config = {
  API_URL: process.env.NODE_ENV === "development" ? process.env.REACT_APP_API_URL || "" : "",
  TODO: {
    LIST: "/api/todos",
    DETAIL: (id) => `/api/todos/${encodeURIComponent(id)}`,
    OCCURRENCE: (id, date) => `/api/todos/${encodeURIComponent(id)}/dates/${date}`,
    CALENDAR: "/api/todos/calendar",
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
