import React, { useEffect, useMemo, useState } from "react";
import { getTrendingTracks } from "../api/audius";
import TrackCard from "../components/TrackCard";

// PUBLIC_INTERFACE
export default function HomePage() {
  /** Home view: trending tracks grid. */
  const [tracks, setTracks] = useState([]);
  const [time, setTime] = useState("week");
  const [status, setStatus] = useState({ loading: true, error: null });

  const subtitle = useMemo(() => {
    const map = { week: "This week", month: "This month", year: "This year", allTime: "All time" };
    return map[time] || "Trending";
  }, [time]);

  useEffect(() => {
    const ctrl = new AbortController();
    setStatus({ loading: true, error: null });

    getTrendingTracks({ limit: 24, offset: 0, time, signal: ctrl.signal })
      .then((data) => setTracks(Array.isArray(data) ? data : []))
      .catch((e) => setStatus({ loading: false, error: e?.message || "Failed to load trending" }))
      .finally(() => setStatus((s) => ({ ...s, loading: false })));

    return () => ctrl.abort();
  }, [time]);

  return (
    <>
      <div className="mainHeader">
        <div className="headerTitle">
          <h1>Home</h1>
          <p>Trending on Audius · {subtitle}</p>
        </div>

        <div className="headerRight">
          <span className="badge">Audius IDs</span>
          <button className="iconButton" onClick={() => setTime("week")} aria-label="Trending week">
            Week
          </button>
          <button className="iconButton" onClick={() => setTime("month")} aria-label="Trending month">
            Month
          </button>
          <button className="iconButton" onClick={() => setTime("year")} aria-label="Trending year">
            Year
          </button>
        </div>
      </div>

      <div className="content">
        {status.error ? <div className="errorBox">{status.error}</div> : null}

        <h2 className="sectionTitle">Trending tracks</h2>

        {status.loading ? (
          <div className="badge">Loading…</div>
        ) : (
          <div className="grid" role="list" aria-label="Trending tracks">
            {tracks.map((t) => (
              <div role="listitem" key={t.id}>
                <TrackCard track={t} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
