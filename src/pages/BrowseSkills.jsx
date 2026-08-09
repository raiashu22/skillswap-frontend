import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, X, Send, Code2, Palette, GraduationCap, Briefcase, Music, MoreHorizontal, Sparkles, Search, ArrowUpDown, ThumbsUp } from "lucide-react";
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

function SkillCard({ skill, idx, user, token, onRequest, requestingId }) {
  const tiltRef = useTilt(6);
  const CategoryIcon = CATEGORY_ICONS[skill.category] || MoreHorizontal;

  const [endorseCount, setEndorseCount] = useState(skill._count?.endorsements ?? 0);
  const [endorsing, setEndorsing] = useState(false);
  const [endorseMsg, setEndorseMsg] = useState("");
  const [endorsed, setEndorsed] = useState(false);

  async function handleEndorse() {
    setEndorsing(true);
    setEndorseMsg("");
    try {
      await api.createEndorsement(skill.id, token);
      setEndorseCount((c) => c + 1);
      setEndorsed(true);
    } catch (err) {
      setEndorseMsg(err.message);
    } finally {
      setEndorsing(false);
    }
  }

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
        {endorseCount > 0 && (
          <span className="endorse-badge" title={`${endorseCount} endorsement${endorseCount > 1 ? "s" : ""}`}>
            <ThumbsUp size={11} /> {endorseCount}
          </span>
        )}
      </div>
      <h3 className="skill-card-title">{skill.title}</h3>
      <p className="skill-card-desc">{skill.description || "No description provided."}</p>

      {endorseMsg && <p className="endorse-msg">{endorseMsg}</p>}

      <div className="skill-card-footer">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <RatingRing rating={skill.user.avgRating} size={34} />
          <span className="skill-card-user">{skill.user.name}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {user && user.id !== skill.userId && !endorsed && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--purple-600)", borderColor: "var(--border)" }}
              onClick={handleEndorse}
              disabled={endorsing}
              title="Endorse this skill (after completing a session)"
            >
              <ThumbsUp size={12} /> {endorsing ? "..." : "Endorse"}
            </button>
          )}
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

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", category: "Web Development", description: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [requestingId, setRequestingId] = useState(null);
  const [feedback, setFeedback] = useState("");

  // Debounce the search box so we don't fire a request on every keystroke -
  // wait 400ms after the user stops typing before actually searching.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function loadSkills() {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (activeCategory !== "All") params.category = activeCategory;
      if (debouncedSearch) params.search = debouncedSearch;
      if (sortBy === "rating") params.sort = "rating";
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
  }, [activeCategory, debouncedSearch, sortBy]);

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

      <div className="search-sort-row">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search skills by title or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button className="search-clear-btn" onClick={() => setSearchInput("")} type="button" aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="sort-select">
          <ArrowUpDown size={14} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

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
          {debouncedSearch || activeCategory !== "All" ? (
            <>
              <h3>No matching skills</h3>
              <p>Try a different search term or category.</p>
            </>
          ) : (
            <>
              <h3>No skills listed yet</h3>
              <p>Be the first to list one, or check back once more students join in.</p>
            </>
          )}
        </div>
      ) : (
        <div className="skills-grid">
          {skills.map((skill, idx) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              idx={idx}
              user={user}
              token={token}
              onRequest={handleRequest}
              requestingId={requestingId}
            />
            
          ))}
        </div>
      )}
    </div>
  );
}
