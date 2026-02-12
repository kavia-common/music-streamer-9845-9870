import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getTrackStreamUrl } from "../api/audius";

/**
 * Playback state is stored in a React context so pages can trigger play/pause/queue.
 * Audio element is owned by the provider for a persistent player across route changes.
 */

const PlaybackContext = createContext(null);

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

// PUBLIC_INTERFACE
export function PlaybackProvider({ children }) {
  /** Provider that holds Audio element + current track + playback controls. */
  const audioRef = useRef(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]); // simple FIFO queue of track objects
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(0.9);

  useEffect(() => {
    // Create audio once.
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setPosition(audio.currentTime || 0);
    const onLoadedMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      // Auto-advance
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
      setQueue((q) => {
        if (q.length === 0) return q;
        const [next, ...rest] = q;
        // Defer playNext to next tick
        setTimeout(() => {
          // eslint-disable-next-line no-use-before-define
          playTrack(next, { autoplay: true });
        }, 0);
        return rest;
      });
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onError = () => setIsLoading(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);

    audio.volume = volume;

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  const playTrack = useCallback(async (track, { autoplay = true } = {}) => {
    if (!track || !track.id) return;
    const audio = audioRef.current;
    if (!audio) return;

    try {
      setIsLoading(true);
      setCurrentTrack(track);

      const streamUrl = getTrackStreamUrl(track.id);
      audio.src = streamUrl;

      // Keep position state reset when swapping tracks.
      setPosition(0);
      setDuration(0);

      if (autoplay) {
        // Browser policies may block; ignore errors and let user hit play.
        await audio.play().catch(() => {});
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentTrack) return;

    if (audio.paused) {
      await audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [currentTrack]);

  const seek = useCallback((nextSeconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    const d = audio.duration || duration || 0;
    const clamped = Math.max(0, Math.min(Number(nextSeconds) || 0, d));
    audio.currentTime = clamped;
    setPosition(clamped);
  }, [duration]);

  const playNext = useCallback(() => {
    setQueue((q) => {
      if (q.length === 0) return q;
      const [next, ...rest] = q;
      setTimeout(() => {
        playTrack(next, { autoplay: true });
      }, 0);
      return rest;
    });
  }, [playTrack]);

  const addToQueue = useCallback((track) => {
    if (!track || !track.id) return;
    setQueue((q) => [...q, track]);
  }, []);

  const clearQueue = useCallback(() => setQueue([]), []);

  const value = useMemo(() => {
    const progressPct = duration > 0 ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;

    return {
      currentTrack,
      queue,
      isPlaying,
      isLoading,
      duration,
      position,
      progressPct,
      volume,

      playTrack,
      togglePlay,
      seek,
      playNext,
      addToQueue,
      clearQueue,

      // Internal setter used by player UI.
      __setVolume: (v) => setVolume(Math.max(0, Math.min(1, Number(v) || 0))),

      formatTime,
    };
  }, [
    currentTrack,
    queue,
    isPlaying,
    isLoading,
    duration,
    position,
    volume,
    playTrack,
    togglePlay,
    seek,
    playNext,
    addToQueue,
    clearQueue,
  ]);

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

// PUBLIC_INTERFACE
export function usePlayback() {
  /** Hook to access playback context. */
  const ctx = useContext(PlaybackContext);
  if (!ctx) {
    throw new Error("usePlayback must be used within PlaybackProvider");
  }
  return ctx;
}
