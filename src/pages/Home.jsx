import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Code2,
  Palette,
  GraduationCap,
  Briefcase,
  Music,
  MoreHorizontal,
  ShieldCheck,
  Coins,
  Users2,
  ChevronDown,
  Zap,
  Repeat,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTilt } from "../hooks/useTilt.js";
import { useScrollReveal } from "../hooks/useScrollReveal.js";

const CATEGORIES = [
  { name: "Web Development", icon: Code2, color: "linear-gradient(135deg, var(--blue-300), var(--blue-600))" },
  { name: "Design", icon: Palette, color: "linear-gradient(135deg, var(--purple-300), var(--purple-600))" },
  { name: "Academics", icon: GraduationCap, color: "linear-gradient(135deg, var(--blue-500), var(--purple-500))" },
  { name: "Career", icon: Briefcase, color: "linear-gradient(135deg, var(--purple-500), var(--blue-600))" },
  { name: "Creative", icon: Music, color: "linear-gradient(135deg, var(--green-300), var(--green-500))" },
  { name: "Other", icon: MoreHorizontal, color: "linear-gradient(135deg, var(--purple-300), var(--blue-500))" },
];

const FAQS = [
  { q: "Does it actually cost anything?", a: "No. SkillSwap runs entirely on credits, not money. Every account starts with 5 free credits, and you earn more by helping others." },
  { q: "What happens if a request gets declined?", a: "Nothing — no credits are deducted until a provider actually accepts your request. Declines cost you nothing." },
  { q: "When do credits actually move?", a: "Credits are held in escrow the moment a request is accepted, and only released to the provider once the session is marked complete." },
  { q: "Can I offer more than one skill?", a: "Yes — list as many skills as you want from your profile or the Browse page, across any category." },
];

function BentoCard({ children, className = "", tilt = true, style }) {
  const tiltRef = useTilt(6);
  const [revealRef, visible] = useScrollReveal();
  return (
    <div
      ref={(node) => {
        revealRef.current = node;
        if (tilt) tiltRef(node);
      }}
      className={`card reveal ${visible ? "visible" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);
  const heroVisualTilt = useTilt(5);

  function goToCategory(name) {
    navigate(`/browse?category=${encodeURIComponent(name)}`);
  }

  return (
    <div>
      <section className="hero">
        <div className="hero-split">
          <div className="hero-inner">
            <span className="hero-badge">
              <Sparkles size={14} /> Built for ABESIT students
            </span>
            <h1 className="hero-title">
              Trade skills,
              <br />
              <span className="gradient-text">not money.</span>
            </h1>
            <p className="hero-subtitle">
              List what you're good at, spend a credit to get help with what you're not.
              Debugging, resumes, design, exam prep — all barter, no tutoring fees.
            </p>
            <div className="hero-actions">
              <Link to="/browse" className="btn btn-primary">
                Browse skills <ArrowRight size={15} />
              </Link>
              {!user && (
                <Link to="/signup" className="btn btn-ghost">
                  Join with 5 free credits
                </Link>
              )}
            </div>
          </div>

          <div className="hero-visual-frame" ref={heroVisualTilt}>
            <img src="/images/hero-panel.jpg" alt="Preview of skill match cards showing compatibility scores" />
          </div>
        </div>

        <div className="stats-strip">
          <div className="stat-cell">
            <span className="stat-number">0₹</span>
            <span className="stat-label">Cost to get help</span>
          </div>
          <div className="stat-cell">
            <span className="stat-number">5</span>
            <span className="stat-label">Free starting credits</span>
          </div>
          <div className="stat-cell">
            <span className="stat-number">1:1</span>
            <span className="stat-label">Credit-for-credit barter</span>
          </div>
        </div>
      </section>

      <div className="trust-bar">
        <div className="trust-bar-label">Trusted across campus</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 10, flexWrap: "wrap", color: "var(--text-muted)", fontSize: 13.5, fontWeight: 600 }}>
          <span>CSE</span><span>ECE</span><span>ME</span><span>IT</span><span>MBA</span>
        </div>
      </div>

      <section className="bento-section">
        <div className="section-heading">
          <p className="page-eyebrow" style={{ justifyContent: "center", display: "flex" }}>Why SkillSwap</p>
          <h2>Everything you need, nothing you have to pay for</h2>
        </div>

        <div className="bento-grid">
          <BentoCard className="bento-item dark span-4">
            <div className="bento-icon"><ShieldCheck size={20} /></div>
            <h3>Escrow-protected credits</h3>
            <p>Credits only move when a session is actually completed — never lost to a declined request.</p>
            <div className="bento-visual-row">
              <div className="bento-visual-pill" />
              <div className="bento-visual-pill" style={{ opacity: 0.5 }} />
              <div className="bento-visual-pill" style={{ opacity: 0.3 }} />
            </div>
          </BentoCard>

          <BentoCard className="bento-image-item span-2" tilt={false} style={{ position: "relative", minHeight: 220 }}>
            <img src="/images/feature-visual-1.jpg" alt="Illustration of the SkillSwap matching concept" />
            <div className="bento-image-caption">
              <h3 style={{ color: "white" }}>Real matching</h3>
              <p style={{ color: "rgba(255,255,255,0.7)" }}>Find someone offering exactly what you need.</p>
            </div>
          </BentoCard>

          <BentoCard className="bento-item purple-tint span-2">
            <div className="bento-icon"><Zap size={20} /></div>
            <h3>Instant requests</h3>
            <p>Send a request in one click. No forms, no back-and-forth emails.</p>
          </BentoCard>
          <BentoCard className="bento-image-item span-2" tilt={false} style={{ position: "relative", minHeight: 180 }}>
            <img src="/images/feature-visual-2.jpg" alt="Illustration of available skill swaps interface" />
            <div className="bento-image-caption">
              <h3 style={{ color: "white" }}>Built on trust</h3>
              <p style={{ color: "rgba(255,255,255,0.7)" }}>Ratings after every session keep it accountable.</p>
            </div>
          </BentoCard>
          <BentoCard className="bento-item blue-tint span-2">
            <div className="bento-icon"><Repeat size={20} /></div>
            <h3>Fair exchange</h3>
            <p>One credit, one session. Simple, transparent, never confusing.</p>
          </BentoCard>
        </div>
      </section>

      <section style={{ padding: "8px 24px 8px" }}>
        <div className="section-rule">
          <span className="page-eyebrow" style={{ whiteSpace: "nowrap" }}>Popular categories</span>
        </div>
        <div className="category-grid">
          {CATEGORIES.map(({ name, icon: Icon, color }) => (
            <button key={name} className="card category-tile" onClick={() => goToCategory(name)}>
              <div className="category-tile-icon" style={{ background: color }}>
                <Icon size={20} />
              </div>
              <span className="category-tile-label">{name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="steps-section">
        <div className="section-heading">
          <p className="page-eyebrow" style={{ justifyContent: "center", display: "flex" }}>How it works</p>
          <h2 style={{ fontSize: 26 }}>Three steps, zero rupees</h2>
        </div>

        <div className="steps-grid">
          <div className="card step-card" style={{ animationDelay: "0.05s" }}>
            <span className="step-number">01</span>
            <div className="step-icon i-purple"><Users2 size={20} /></div>
            <h3 className="step-title">Find a skill</h3>
            <p className="step-desc">Browse what other students are offering — coding help, design, resume reviews, and more.</p>
          </div>
          <div className="card step-card" style={{ animationDelay: "0.15s" }}>
            <span className="step-number">02</span>
            <div className="step-icon i-pink"><Coins size={20} /></div>
            <h3 className="step-title">Send a request</h3>
            <p className="step-desc">Request help using a credit. Nothing leaves your balance until the provider accepts.</p>
          </div>
          <div className="card step-card" style={{ animationDelay: "0.25s" }}>
            <span className="step-number">03</span>
            <div className="step-icon i-blue"><ShieldCheck size={20} /></div>
            <h3 className="step-title">Help someone back</h3>
            <p className="step-desc">Complete the session, earn credits by offering your own skill, and rate each other.</p>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="section-heading">
          <p className="page-eyebrow" style={{ justifyContent: "center", display: "flex" }}>FAQ</p>
          <h2 style={{ fontSize: 26 }}>Common questions</h2>
        </div>
        {FAQS.map((item, idx) => (
          <div key={item.q} className="faq-item">
            <button className="faq-question" onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}>
              {item.q}
              <ChevronDown size={18} style={{ transform: openFaq === idx ? "rotate(180deg)" : "none" }} />
            </button>
            {openFaq === idx && <p className="faq-answer">{item.a}</p>}
          </div>
        ))}
      </section>

      <section style={{ padding: "0 24px 88px" }}>
        <div className="cta-band">
          <div>
            <h2>Got a skill worth sharing?</h2>
            <p>List it in under a minute and start earning credits toward help of your own.</p>
          </div>
          <Link to={user ? "/browse" : "/signup"} className="btn btn-primary">
            {user ? "List a skill" : "Get started"} <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
