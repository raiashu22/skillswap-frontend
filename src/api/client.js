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

  listMyRequests: (token, status) => request(`/requests/mine${status ? `?status=${status}` : ""}`, { token }),
  createRequest: (payload, token) => request("/requests", { method: "POST", body: payload, token }),
  acceptRequest: (id, token) => request(`/requests/${id}/accept`, { method: "PATCH", token }),
  declineRequest: (id, token) => request(`/requests/${id}/decline`, { method: "PATCH", token }),
  completeRequest: (id, token) => request(`/requests/${id}/complete`, { method: "PATCH", token }),
  scheduleRequest: (id, scheduledAt, token) => request(`/requests/${id}/schedule`, { method: "PATCH", body: { scheduledAt }, token }),
  getRequestMessages: (id, token) => request(`/requests/${id}/messages`, { token }),
  createEndorsement: (skillId, token) => request("/endorsements", { method: "POST", body: { skillId }, token }),
  getMyAnalytics: (token) => request("/analytics/me", { token }),
    getRecommendedSkills: (token) => request("/skills/recommended", { token }),

  listConversations: (token) => request("/chats/conversations", { token }),
  markThreadRead: (requestId, token) => request(`/chats/${requestId}/read`, { method: "PATCH", token }),
  getChatUnreadTotal: (token) => request("/chats/unread-total", { token }),
  listMyNotifications: (token) => request("/notifications/mine", { token }),
  getUnreadCount: (token) => request("/notifications/unread-count", { token }),
  markNotificationRead: (id, token) => request(`/notifications/${id}/read`, { method: "PATCH", token }),
  markAllNotificationsRead: (token) => request("/notifications/read-all", { method: "PATCH", token }),

 getMe: (token) => request("/users/me", { token }),
  updateMe: (payload, token) => request("/users/me", { method: "PATCH", body: payload, token }),
  getMySkills: (token) => request("/users/me/skills", { token }),

  // File upload needs multipart/form-data, not JSON - so this bypasses the
  // generic request() helper and lets the browser set the Content-Type
  // header itself (it needs to include a random boundary string).
  uploadAvatar: async (file, token) => {
    const formData = new FormData();
    // A resized image (canvas output) is a plain Blob with no filename, so
    // the backend's extension check needs one supplied explicitly here.
    formData.append("avatar", file, file.name || "avatar.jpg");

    const res = await fetch(`${API_BASE}/users/me/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.error || `Upload failed with status ${res.status}`);
    }
    return data;
  },
  removeAvatar: (token) => request("/users/me/avatar", { method: "DELETE", token }),
};
