/**
 * Minimal Audius REST client.
 *
 * Notes:
 * - Uses the public Audius discovery node API. Default: https://discoveryprovider.audius.co
 * - All IDs are Audius IDs (track_id, etc.)
 * - Streaming uses /v1/tracks/{trackId}/stream which 302-redirects to the media URL.
 */

const DEFAULT_AUDIUS_BASE = "https://discoveryprovider.audius.co";

function getApiBase() {
  // Env var is part of container env list; user/orchestrator can set it.
  return (process.env.REACT_APP_API_BASE || DEFAULT_AUDIUS_BASE).replace(/\/$/, "");
}

async function fetchJson(url, { signal } = {}) {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Audius request failed: ${res.status} ${res.statusText}`);
    err.details = text;
    throw err;
  }
  return res.json();
}

/**
 * Audius endpoints often respond as { data: ... }.
 * This helper normalizes to return `data`.
 */
function unwrapData(payload) {
  if (payload && typeof payload === "object" && "data" in payload) return payload.data;
  return payload;
}

/**
 * Create a predictable image URL from Audius artwork object.
 * artwork can have keys like 150x150, 480x480, 1000x1000.
 */
export function getArtworkUrl(artwork, size = "480x480") {
  if (!artwork || typeof artwork !== "object") return null;
  return artwork[size] || artwork["150x150"] || artwork["480x480"] || artwork["1000x1000"] || null;
}

// PUBLIC_INTERFACE
export async function getTrendingTracks({ limit = 24, offset = 0, time = "week", signal } = {}) {
  /** Fetch trending tracks. Returns an array of Audius track objects. */
  const apiBase = getApiBase();
  const url = `${apiBase}/v1/tracks/trending?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(
    offset
  )}&time=${encodeURIComponent(time)}`;
  const json = await fetchJson(url, { signal });
  return unwrapData(json) || [];
}

// PUBLIC_INTERFACE
export async function searchTracks({ query, limit = 20, offset = 0, signal } = {}) {
  /** Search tracks by query string. Returns an array of Audius track objects. */
  if (!query || !query.trim()) return [];
  const apiBase = getApiBase();
  const url = `${apiBase}/v1/tracks/search?query=${encodeURIComponent(query)}&limit=${encodeURIComponent(
    limit
  )}&offset=${encodeURIComponent(offset)}`;
  const json = await fetchJson(url, { signal });
  return unwrapData(json) || [];
}

// PUBLIC_INTERFACE
export async function getTrackById({ trackId, signal } = {}) {
  /** Get track details by Audius track ID. Returns the track object or null. */
  if (!trackId) return null;
  const apiBase = getApiBase();
  const url = `${apiBase}/v1/tracks/${encodeURIComponent(trackId)}`;
  const json = await fetchJson(url, { signal });
  const data = unwrapData(json);
  if (Array.isArray(data)) return data[0] || null;
  return data || null;
}

// PUBLIC_INTERFACE
export function getTrackStreamUrl(trackId) {
  /** Build the stream URL (will redirect to actual media). */
  const apiBase = getApiBase();
  return `${apiBase}/v1/tracks/${encodeURIComponent(trackId)}/stream`;
}
