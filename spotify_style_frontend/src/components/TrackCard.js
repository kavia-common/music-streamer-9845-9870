import React from "react";
import { Link } from "react-router-dom";
import { getArtworkUrl } from "../api/audius";
import { usePlayback } from "../context/PlaybackContext";

// PUBLIC_INTERFACE
export default function TrackCard({ track }) {
  /** Display a track in a cover grid card with play action. */
  const { currentTrack, isPlaying, playTrack } = usePlayback();
  const isCurrent = currentTrack && track && currentTrack.id === track.id;

  const cover = getArtworkUrl(track?.artwork, "480x480");

  return (
    <div className="card" role="group" aria-label={`${track?.title || "Track"} card`}>
      <Link to={`/track/${track?.id}`} aria-label={`Open track ${track?.title || ""}`}>
        <div className="cardCover">
          {cover ? <img src={cover} alt="" /> : <div className="badge">No artwork</div>}
        </div>
      </Link>

      <div className="cardBody">
        <div className="cardTitleRow">
          <h3 className="cardTitle" title={track?.title || ""}>
            {track?.title || "Untitled"}
          </h3>

          <button
            className="iconButton"
            onClick={() => playTrack(track, { autoplay: true })}
            aria-label={isCurrent && isPlaying ? "Playing" : "Play"}
            title={isCurrent && isPlaying ? "Now playing" : "Play"}
          >
            {isCurrent && isPlaying ? "▶︎" : "Play"}
          </button>
        </div>

        <p className="cardMeta" title={track?.user?.name || ""}>
          {track?.user?.name || "Unknown artist"}
        </p>
      </div>
    </div>
  );
}
