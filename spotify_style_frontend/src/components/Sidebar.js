import React from "react";
import { NavLink } from "react-router-dom";

function Icon({ name }) {
  const common = { className: "navIcon", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path
            d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <path
            d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M21 21l-4.4-4.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "library":
      return (
        <svg {...common}>
          <path
            d="M6 4h14v16H6V4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M4 6v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M9 8h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M9 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Left navigation rail (Home/Search/Library). */
  const linkClassName = ({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark" aria-hidden="true" />
        <div className="brandTitle">
          <strong>Ocean Player</strong>
          <span>Audius-powered</span>
        </div>
      </div>

      <nav className="navGroup" aria-label="Primary navigation">
        <NavLink to="/" className={linkClassName} end>
          <Icon name="home" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={linkClassName}>
          <Icon name="search" />
          <span>Search</span>
        </NavLink>
        <NavLink to="/library" className={linkClassName}>
          <Icon name="library" />
          <span>Your Library</span>
        </NavLink>
      </nav>

      <div className="sidebarFooter">
        <div className="pill" title="Powered by public Audius discovery nodes">
          <span className="pillDot" aria-hidden="true" />
          <span>Public Audius API</span>
        </div>
        <div style={{ opacity: 0.85 }}>Tip: click any track to play.</div>
      </div>
    </aside>
  );
}
