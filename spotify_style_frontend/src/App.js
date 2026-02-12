import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { PlaybackProvider } from "./context/PlaybackContext";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import LibraryPage from "./pages/LibraryPage";
import TrackDetailsPage from "./pages/TrackDetailsPage";

function NotFound() {
  return (
    <>
      <div className="mainHeader">
        <div className="headerTitle">
          <h1>Not found</h1>
          <p>That page doesn’t exist.</p>
        </div>
      </div>
      <div className="content">
        <div className="badge">Try Home, Search, or Your Library.</div>
      </div>
    </>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Application entrypoint: provides routing and persistent playback state. */
  return (
    <PlaybackProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/track/:trackId" element={<TrackDetailsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PlaybackProvider>
  );
}

export default App;
