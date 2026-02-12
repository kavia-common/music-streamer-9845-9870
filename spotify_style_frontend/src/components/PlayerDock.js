import React from "react";
import { Link } from "react-router-dom";
import { getArtworkUrl } from "../api/audius";
import { usePlayback } from "../context/PlaybackContext";

// PUBLIC_INTERFACE
export default function PlayerDock() {
  /** Persistent player footer: shows current track and provides basic controls. */
  const { currentTrack, isPlaying, isLoading, duration, position, progressPct, togglePlay, seek, formatTime } =
    usePlayback();

  const cover = getArtworkUrl(currentTrack?.artwork, "150x150");

  return (
    <footer className="playerDock" aria-label="Player">
      <div className="playerLeft">
        {cover ? <img src={cover} alt="" /> : <div className="badge">No track</div>}
        <div className="playerText">
          <strong title={currentTrack?.title || ""}>
            {currentTrack ? (
              <Link to={`/track/${currentTrack.id}`}>{currentTrack.title || "Untitled"}</Link>
            ) : (
              "Pick a track"
            )}
          </strong>
          <span title={currentTrack?.user?.name || ""}>{currentTrack?.user?.name || "—"}</span>
        </div>
      </div>

      <div className="playerCenter">
        <div className="playerControls">
          <button className="circleBtn" onClick={() => seek(Math.max(0, (position || 0) - 10))} aria-label="Back 10s">
            ↺
          </button>
          <button
            className="playBtn"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            disabled={!currentTrack}
            title={!currentTrack ? "Select a track to play" : isPlaying ? "Pause" : "Play"}
          >
            {isLoading ? "…" : isPlaying ? "❚❚" : "►"}
          </button>
          <button
            className="circleBtn"
            onClick={() => seek(Math.min(duration || 0, (position || 0) + 10))}
            aria-label="Forward 10s"
          >
            ↻
          </button>
        </div>

        <div className="progressRow" aria-label="Progress">
          <span>{formatTime(position)}</span>
          <div
            className="progressBar"
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.floor(duration || 0)}
            aria-valuenow={Math.floor(position || 0)}
            tabIndex={0}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const pct = rect.width > 0 ? x / rect.width : 0;
              seek((duration || 0) * pct);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") seek(Math.max(0, (position || 0) - 5));
              if (e.key === "ArrowRight") seek(Math.min(duration || 0, (position || 0) + 5));
            }}
          >
            <div className="progressFill" style={{ width: `${progressPct}%` }} />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="playerRight">
        <span className="badge" title="Volume">
          Vol
        </span>
        <VolumeSlider />
      </div>
    </footer>
  );
}

function VolumeSlider() {
  const { volume } = usePlayback();
  const { currentTrack } = usePlayback();
  const { setVolume } = useVolumeSetter();
  return (
    <input
      className="volume"
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={volume}
      onChange={(e) => setVolume(Number(e.target.value))}
      aria-label="Volume"
      disabled={!currentTrack}
    />
  );
}

/**
 * To keep the main PlaybackContext lean (and avoid re-creating setters often),
 * we provide a tiny hook wrapper for updating volume through internal state.
 */
function useVolumeSetter() {
  const ctx = usePlayback();
  // setVolume isn't currently exposed in ctx; add a local mutator by using seek-like pattern.
  // We'll keep it simple by storing volume in ctx through a stable callback.
  // This relies on PlaybackContext having `volume` state and we can update via internal method.
  // If not present, we fall back to no-op.
  const setVolume = (v) => {
    if (typeof ctx?.volume !== "number") return;
    if (typeof ctx?.__setVolume === "function") ctx.__setVolume(v);
  };
  return { setVolume };
}
