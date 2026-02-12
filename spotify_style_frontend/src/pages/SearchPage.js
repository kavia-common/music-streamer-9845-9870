import React, { useEffect, useMemo, useState } from "react";
import { searchTracks } from "../api/audius";
import TrackRow from "../components/TrackRow";

// PUBLIC_INTERFACE
export default function SearchPage() {
  /** Search view: query Audius track search endpoint. */
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [tracks, setTracks] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: null });

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const ctrl = new AbortController();
    setStatus({ loading: true, error: null });

    searchTracks({ query: debounced, limit: 20, offset: 0, signal: ctrl.signal })
      .then((data) => setTracks(Array.isArray(data) ? data : []))
      .catch((e) => setStatus({ loading: false, error: e?.message || "Search failed" }))
      .finally(() => setStatus((s) => ({ ...s, loading: false })));

    return () => ctrl.abort();
  }, [debounced]);

  const headerSubtitle = useMemo(() => {
    if (!debounced) return "Find tracks by title or artist";
    return `Results for “${debounced}”`;
  }, [debounced]);

  return (
    <>
      <div className="mainHeader">
        <div className="headerTitle">
          <h1>Search</h1>
          <p>{headerSubtitle}</p>
        </div>

        <div className="headerRight" style={{ flex: 1, justifyContent: "flex-end" }}>
          <div className="searchBar" role="search" aria-label="Search tracks">
            <span className="searchHint">⌘K</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Audius tracks…"
              aria-label="Search input"
            />
          </div>
        </div>
      </div>

      <div className="content">
        {status.error ? <div className="errorBox">{status.error}</div> : null}

        {!debounced ? (
          <div className="badge">Start typing to search.</div>
        ) : status.loading ? (
          <div className="badge">Searching…</div>
        ) : (
          <div className="list" aria-label="Search results">
            {tracks.map((t) => (
              <TrackRow key={t.id} track={t} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
