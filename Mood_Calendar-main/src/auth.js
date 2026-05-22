const API = "http://localhost:5000";

export const getToken = () => localStorage.getItem("vv_token");
export const getUser  = () => {
  try { return JSON.parse(localStorage.getItem("vv_user")); }
  catch { return null; }
};
export const setAuth = (token, user) => {
  localStorage.setItem("vv_token", token);
  localStorage.setItem("vv_user", JSON.stringify(user));
};
export const clearAuth = () => {
  localStorage.removeItem("vv_token");
  localStorage.removeItem("vv_user");
};

// Authenticated fetch wrapper
export const authFetch = (path, options = {}) => {
  const token = getToken();
  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });
};
