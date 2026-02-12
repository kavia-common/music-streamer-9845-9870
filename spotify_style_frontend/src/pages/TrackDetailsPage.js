import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtworkUrl, getTrackById } from "../api/audius";
import { usePlayback } from "../context/PlaybackContext";

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
export default function TrackDetailsPage() {
  /** Track details page for a specific Audius track ID. */
  const { trackId } = useParams();
  const { currentTrack, isPlaying, playTrack, addToQueue } = usePlayback();

  const [track, setTrack] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: null });
  const [savedIds, setSavedIds] = useState(() => loadIds());

  const isCurrent = currentTrack && track && currentTrack.id === track.id;
  const cover = getArtworkUrl(track?.artwork, "1000x1000") || getArtworkUrl(track?.artwork, "480x480");
  const isSaved = useMemo(() => savedIds.includes(trackId), [savedIds, trackId]);

  useEffect(() => {
    let alive = true;
    setStatus({ loading: true, error: null });
    setTrack(null);

    getTrackById({ trackId })
      .then((t) => {
        if (!alive) return;
        setTrack(t);
      })
      .catch((e) => setStatus({ loading: false, error: e?.message || "Failed to load track" }))
      .finally(() => setStatus((s) => ({ ...s, loading: false })));

    return () => {
      alive = false;
    };
  }, [trackId]);

  const toggleSave = () => {
    const ids = loadIds();
    const next = ids.includes(trackId) ? ids.filter((id) => id !== trackId) : [...ids, trackId];
    saveIds(next);
    setSavedIds(next);
  };

  return (
    <>
      <div className="mainHeader">
        <div className="headerTitle">
          <h1>Track</h1>
          <p>Audius ID: {trackId}</p>
        </div>

        <div className="headerRight">
          <button className="iconButton" onClick={toggleSave} aria-label="Save track">
            {isSaved ? "Saved" : "Save"}
          </button>
          <button className="iconButton" onClick={() => track && addToQueue(track)} aria-label="Add to queue">
            Add to queue
          </button>
          <button className="primaryButton" onClick={() => track && playTrack(track)} aria-label="Play track">
            {isCurrent && isPlaying ? "Playing" : "Play"}
          </button>
        </div>
      </div>

      <div className="content">
        {status.error ? <div className="errorBox">{status.error}</div> : null}

        {status.loading ? (
          <div className="badge">Loading track…</div>
        ) : !track ? (
          <div className="badge">Track not found.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 14, alignItems: "start" }}>
            <div className="card" style={{ overflow: "hidden" }}>
              <div className="cardCover">{cover ? <img src={cover} alt="" /> : <div className="badge">No artwork</div>}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="card" style={{ padding: 14 }}>
                <h2 style={{ margin: 0, fontSize: 20, letterSpacing: "-0.02em" }}>{track.title || "Untitled"}</h2>
                <p style={{ margin: "6px 0 0 0", color: "var(--text-muted)" }}>
                  {track.user?.name || "Unknown artist"}
                </p>
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <span className="badge">Genre: {track.genre || "—"}</span>
                  <span className="badge">Mood: {track.mood || "—"}</span>
                  {typeof track.play_count === "number" ? <span className="badge">Plays: {track.play_count}</span> : null}
                </div>
              </div>

              <div className="card" style={{ padding: 14 }}>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>
                  This player streams audio via Audius discovery node redirects. If playback doesn’t start automatically,
                  press Play in the footer player.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
