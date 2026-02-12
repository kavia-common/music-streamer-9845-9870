import React from "react";
import { Link } from "react-router-dom";
import { getArtworkUrl } from "../api/audius";
import { usePlayback } from "../context/PlaybackContext";

// PUBLIC_INTERFACE
export default function TrackRow({ track }) {
  /** Compact row for lists (Search results). */
  const { currentTrack, isPlaying, playTrack, addToQueue } = usePlayback();
  const isCurrent = currentTrack && track && currentTrack.id === track.id;
  const cover = getArtworkUrl(track?.artwork, "150x150");

  return (
    <div className="row">
      {cover ? <img src={cover} alt="" /> : <div className="badge">—</div>}

      <div className="rowTitle">
        <Link to={`/track/${track?.id}`} style={{ display: "contents" }}>
          <strong title={track?.title || ""}>{track?.title || "Untitled"}</strong>
          <span title={track?.user?.name || ""}>{track?.user?.name || "Unknown artist"}</span>
        </Link>
      </div>

      <div className="rowActions">
        <button className="iconButton" onClick={() => addToQueue(track)} aria-label="Add to queue" title="Add to queue">
          Queue
        </button>
        <button
          className="primaryButton"
          onClick={() => playTrack(track, { autoplay: true })}
          aria-label={isCurrent && isPlaying ? "Playing" : "Play"}
          title={isCurrent && isPlaying ? "Now playing" : "Play"}
        >
          {isCurrent && isPlaying ? "Playing" : "Play"}
        </button>
      </div>
    </div>
  );
}
