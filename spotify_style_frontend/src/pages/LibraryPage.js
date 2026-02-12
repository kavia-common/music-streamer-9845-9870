import React, { useEffect, useMemo, useState } from "react";
import { getTrackById } from "../api/audius";
import TrackCard from "../components/TrackCard";

const LS_KEY = "ocean_player_library_track_ids";

function loadIds() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

function saveIds(ids) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export default function LibraryPage() {
  /** Library view: shows locally saved track IDs and loads their details. */
  const [trackIds, setTrackIds] = useState(() => loadIds());
  const [tracks, setTracks] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: null });

  const subtitle = useMemo(() => `${trackIds.length} saved`, [trackIds.length]);

  useEffect(() => {
    let alive = true;
    if (trackIds.length === 0) {
      setTracks([]);
      return;
    }
    setStatus({ loading: true, error: null });

    Promise.all(trackIds.slice(0, 24).map((id) => getTrackById({ trackId: id })))
      .then((items) => {
        if (!alive) return;
        setTracks(items.filter(Boolean));
      })
      .catch((e) => setStatus({ loading: false, error: e?.message || "Failed to load library" }))
      .finally(() => setStatus((s) => ({ ...s, loading: false })));

    return () => {
      alive = false;
    };
  }, [trackIds]);

  const addRandomExamples = () => {
    // This is only a convenience since we don't have auth/likes. Uses stable Audius IDs should come from user actions.
    const examples = ["D7KyD", "P3mQ6", "V2d4P"]; // may or may not exist depending on discovery node
    const next = Array.from(new Set([...trackIds, ...examples]));
    setTrackIds(next);
    saveIds(next);
  };

  const clear = () => {
    setTrackIds([]);
    setTracks([]);
    saveIds([]);
  };

  return (
    <>
      <div className="mainHeader">
        <div className="headerTitle">
          <h1>Your Library</h1>
          <p>Local saved Audius IDs · {subtitle}</p>
        </div>
        <div className="headerRight">
          <button className="iconButton" onClick={addRandomExamples} aria-label="Add example IDs">
            Add examples
          </button>
          <button className="iconButton" onClick={clear} aria-label="Clear library">
            Clear
          </button>
        </div>
      </div>

      <div className="content">
        {status.error ? <div className="errorBox">{status.error}</div> : null}

        {trackIds.length === 0 ? (
          <div className="badge">
            Your library is empty. Use Search to find tracks and open their detail page to save.
          </div>
        ) : status.loading ? (
          <div className="badge">Loading library…</div>
        ) : (
          <div className="grid" aria-label="Library tracks">
            {tracks.map((t) => (
              <TrackCard key={t.id} track={t} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
