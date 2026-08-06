const API_BASE = "http://localhost:5001/api";

// A single helper that every page uses to talk to the backend.
// Automatically attaches the JWT token (if present) and throws a
// readable error if the server responds with a non-2xx status.
async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content has no body to parse
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),

  listSkills: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/skills${query ? `?${query}` : ""}`);
  },
  createSkill: (payload, token) => request("/skills", { method: "POST", body: payload, token }),
  deleteSkill: (id, token) => request(`/skills/${id}`, { method: "DELETE", token }),

  listMyRequests: (token) => request("/requests/mine", { token }),
  createRequest: (payload, token) => request("/requests", { method: "POST", body: payload, token }),
  acceptRequest: (id, token) => request(`/requests/${id}/accept`, { method: "PATCH", token }),
  declineRequest: (id, token) => request(`/requests/${id}/decline`, { method: "PATCH", token }),
  completeRequest: (id, token) => request(`/requests/${id}/complete`, { method: "PATCH", token }),

  submitRating: (payload, token) => request("/ratings", { method: "POST", body: payload, token }),

  getMe: (token) => request("/users/me", { token }),
  updateMe: (payload, token) => request("/users/me", { method: "PATCH", body: payload, token }),
  getMySkills: (token) => request("/users/me/skills", { token }),
};
