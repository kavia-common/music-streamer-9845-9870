import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import PlayerDock from "./PlayerDock";

function titleForPath(pathname) {
  if (pathname === "/") return { title: "Home", subtitle: "Trending tracks" };
  if (pathname.startsWith("/search")) return { title: "Search", subtitle: "Find tracks" };
  if (pathname.startsWith("/library")) return { title: "Your Library", subtitle: "Saved tracks" };
  if (pathname.startsWith("/track/")) return { title: "Track", subtitle: "Details" };
  return { title: "Ocean Player", subtitle: "Audius-powered" };
}

// PUBLIC_INTERFACE
export default function AppLayout() {
  /** App shell layout with sidebar and persistent footer player. */
  const location = useLocation();
  const meta = titleForPath(location.pathname);

  return (
    <div className="appShell">
      <div className="appGrid">
        <Sidebar />
        <main className="main" aria-label="Main content">
          {/* Pages implement their own headers for more tailored interactions */}
          <Outlet context={{ meta }} />
        </main>
      </div>

      <PlayerDock />
    </div>
  );
}
