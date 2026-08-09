import React, { useEffect, useRef, useState } from "react";
import { Star, Coins, Trash2, PencilLine, Check, Camera, History, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import RatingRing from "../components/RatingRing.jsx";
import Avatar from "../components/Avatar.jsx";

const MAX_AVATAR_MB = 5;

export default function Profile() {
  const { user, token, updateUser } = useAuth();

  const [mySkills, setMySkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(user.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  async function loadProfile() {
    setLoadingSkills(true);
    setLoadingActivity(true);
    setError("");
    try {
      const [fresh, skills, requests] = await Promise.all([
        api.getMe(token),
        api.getMySkills(token),
        api.listMyRequests(token, "COMPLETED"),
      ]);

      updateUser(fresh);
      setBioDraft(fresh.bio || "");
      setMySkills(skills);

      const sorted = [...requests].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      setActivity(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSkills(false);
      setLoadingActivity(false);
    }
  }

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function saveBio() {
    setSaving(true);
    setError("");
    try {
      const updated = await api.updateMe({ bio: bioDraft }, token);
      updateUser(updated);
      setEditingBio(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSkill(id) {
    setDeletingId(id);
    try {
      await api.deleteSkill(id, token);
      setMySkills((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  function handlePickAvatar() {
    fileInputRef.current?.click();
  }

  function resizeImage(file, maxDim = 400, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height >= width && height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not process image"))), "image/jpeg", quality);
      };
      img.onerror = () => reject(new Error("Could not read image file"));
      img.src = URL.createObjectURL(file);
    });
  }

  async function handleAvatarSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_AVATAR_MB}MB.`);
      return;
    }

    setError("");
    setUploadingAvatar(true);
    try {
      const resized = await resizeImage(file);
      const updated = await api.uploadAvatar(resized, token);
      updateUser(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <div className="page">
      <div className="profile-header">
        <div style={{ position: "relative" }}>
          <Avatar user={user} size="lg" />
          <button
            className="avatar-edit-btn"
            onClick={handlePickAvatar}
            disabled={uploadingAvatar}
            title="Change profile picture"
            type="button"
          >
            <Camera size={13} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleAvatarSelected}
            style={{ display: "none" }}
          />
        </div>

        <RatingRing rating={user.avgRating} size={58} glow />

        <div>
          <h1 className="page-title" style={{ fontSize: 26 }}>
            {user.name}
          </h1>
          <div className="profile-meta-row">
            <span className="profile-meta-item">
              <Coins size={14} /> {user.credits} credits
            </span>
            <span className="profile-meta-item">
              <Star size={14} /> {user.avgRating > 0 ? `${user.avgRating} average rating` : "No ratings yet"}
            </span>
          </div>
          {uploadingAvatar && (
            <p style={{ fontSize: 12.5, color: "var(--blue-soft)", marginTop: 6 }}>Uploading photo...</p>
          )}
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="profile-grid">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 16 }}>About you</h3>
            {!editingBio && (
              <button className="btn btn-ghost btn-sm" style={{ color: "var(--purple-600)", borderColor: "var(--border)" }} onClick={() => setEditingBio(true)}>
                <PencilLine size={14} /> Edit
              </button>
            )}
          </div>

          {editingBio ? (
            <>
              <div className="form-group">
                <textarea
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  placeholder="Tell other students a bit about yourself..."
                  rows={4}
                />
              </div>
              <button className="btn btn-primary btn-sm" onClick={saveBio} disabled={saving}>
                <Check size={14} /> {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <p style={{ color: "var(--text-secondary)", fontSize: 14.5 }}>
              {user.bio || "You haven't added a bio yet — click Edit to introduce yourself."}
            </p>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Your skill listings</h3>

          {loadingSkills ? (
            <div className="skeleton" style={{ height: 60, marginBottom: 10 }} />
          ) : mySkills.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              You haven't listed any skills yet. Head to Browse skills to post one.
            </p>
          ) : (
            mySkills.map((skill) => (
              <div key={skill.id} className="my-skill-row">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{skill.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{skill.category}</div>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteSkill(skill.id)}
                  disabled={deletingId === skill.id}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <History size={16} /> Activity history
        </h3>

        {loadingActivity ? (
          <div className="skeleton" style={{ height: 60 }} />
        ) : activity.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Completed sessions will show up here once you finish your first exchange.
          </p>
        ) : (
          <div className="activity-list">
            {activity.map((r) => {
              const isProvider = r.providerId === user.id;
              const otherPerson = isProvider ? r.requester.name : r.provider.name;
              return (
                <div key={r.id} className="activity-row">
                  <div className={`activity-icon ${isProvider ? "in" : "out"}`}>
                    {isProvider ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}
                  </div>
                  <div className="activity-info">
                    <span className="activity-title">
                      {isProvider ? `Taught ${otherPerson}` : `Learned from ${otherPerson}`} — {r.skill.title}
                    </span>
                    <span className="activity-meta">
                      {new Date(r.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}
                      {isProvider ? `+${r.credits}` : `-${r.credits}`} credit{r.credits > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}