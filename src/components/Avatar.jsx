import React from "react";

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Backend serves uploaded avatars from /uploads/... on the same host as the API.
const API_ORIGIN = "http://localhost:5001";

export default function Avatar({ user, size = "md", className = "" }) {
  const sizeClass = size === "lg" ? "avatar-lg" : "";
  const src = user?.avatarUrl ? `${API_ORIGIN}${user.avatarUrl}` : null;

  if (src) {
    return (
      <img
        src={src}
        alt={user.name ? `${user.name}'s profile picture` : "Profile picture"}
        className={`avatar ${sizeClass} ${className}`}
        style={{ objectFit: "cover" }}
      />
    );
  }

  return (
    <div className={`avatar ${sizeClass} ${className}`} title={user?.name}>
      {initials(user?.name)}
    </div>
  );
}