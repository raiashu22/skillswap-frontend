import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, X, Send, Code2, Palette, GraduationCap, Briefcase, Music, MoreHorizontal, Sparkles } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTilt } from "../hooks/useTilt.js";
import RatingRing from "../components/RatingRing.jsx";

const CATEGORIES = [
  "All",
  "Web Development",
  "Design",
  "Academics",
  "Career",
  "Creative",
  "Other",
];

const CATEGORY_ICONS = {
  "Web Development": Code2,
  Design: Palette,
  Academics: GraduationCap,
  Career: Briefcase,
  Creative: Music,
  Other: MoreHorizontal,
};

function SkillCard({ skill, idx, user, onRequest, requestingId }) {
  const tiltRef = useTilt(6);
  const CategoryIcon = CATEGORY_ICONS[skill.category] || MoreHorizontal;

  return (
    <div
      ref={tiltRef}
      className="card skill-card stagger-item"
      style={{ animationDelay: `${idx * 0.05}s` }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="step-icon i-purple" style={{ width: 30, height: 30, marginBottom: 0 }}>
          <CategoryIcon size={15} />
        </div>
        <span className="skill-card-category">{skill.category}</span>
      </div>
      <h3 className="skill-card-title">{skill.title}</h3>
      <p className="skill-card-desc">{skill.description || "No description provided."}</p>
      <div className="skill-card-footer">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <RatingRing rating={skill.user.avgRating} size={34} />
          <span className="skill-card-user">{skill.user.name}</span>
        </div>
        {user && user.id !== skill.userId && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onRequest(skill)}
            disabled={requestingId === skill.id}
          >
            <Send size={12} /> {requestingId === skill.id ? "Sending..." : "Request"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function BrowseSkills() {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", category: "Web Development", description: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [requestingId, setRequestingId] = useState(null);
  const [feedback, setFeedback] = useState("");

  async function loadSkills() {
    setLoading(true);
    setError("");
    try {
      const params = activeCategory !== "All" ? { category: activeCategory } : {};
      const data = await api.listSkills(params);
      setSkills(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  async function handleCreateSkill(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.createSkill({ ...formData, isOffering: true }, token);
      setFormData({ title: "", category: "Web Development", description: "" });
      setShowForm(false);
      loadSkills();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequest(skill) {
    setFeedback("");
    setRequestingId(skill.id);
    try {
      await api.createRequest({ skillId: skill.id, credits: 1 }, token);
      setFeedback(`Request sent to ${skill.user.name} for "${skill.title}".`);
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setRequestingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p className="page-eyebrow">Browse</p>
          <h1 className="page-title">Skills students are offering</h1>
          <p className="page-subtitle">Spend 1 credit to request help. Credits only leave your balance once the provider accepts.</p>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? (
              <>
                <X size={14} /> Cancel
              </>
            ) : (
              <>
                <Plus size={14} /> List a skill
              </>
            )}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 28 }}>
          {formError && <div className="form-error">{formError}</div>}
          <form onSubmit={handleCreateSkill}>
            <div className="form-group">
              <label htmlFor="title">Skill title</label>
              <input
                id="title"
                placeholder="e.g. React basics, Resume review, Guitar lessons"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="What can you help with, and how?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <button className="btn btn-secondary" type="submit" disabled={submitting}>
              {submitting ? "Posting..." : "Post skill"}
            </button>
          </form>
        </div>
      )}

      <div className="filter-row">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`filter-chip ${activeCategory === c ? "active" : ""}`}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {feedback && <div className="form-error" style={{ background: "var(--success-bg)", color: "var(--success)" }}>{feedback}</div>}
      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="skills-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Sparkles size={24} />
          </div>
          <h3>No skills listed yet</h3>
          <p>Be the first to list one, or check back once more students join in.</p>
        </div>
      ) : (
        <div className="skills-grid">
          {skills.map((skill, idx) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              idx={idx}
              user={user}
              onRequest={handleRequest}
              requestingId={requestingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
