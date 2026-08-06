import React from "react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logo.png" alt="" style={{ width: 20, height: 20, borderRadius: 6 }} />
          SkillSwap
        </div>
        <span className="footer-note">
          A campus skill exchange platform · Built for ABES Institute of Technology
        </span>
      </div>
    </footer>
  );
}
