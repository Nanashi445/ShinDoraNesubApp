import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

// Pages
import Layout from './components/Layout';
import Home from './pages/Home';
import VideoPlayer from './pages/VideoPlayer';
import AutoplayPage from './pages/AutoplayPage';
import Profile from './pages/Profile';
import WatchLater from './pages/WatchLater';
import LikedVideos from './pages/LikedVideos';
import Categories from './pages/Categories';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import PlaylistAutoplay from './pages/PlaylistAutoplay';
import Admin from './pages/Admin';
import InfoPage from './pages/InfoPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <div className="App">
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="/video/:id" element={<VideoPlayer />} />
                  <Route path="/autoplay" element={<AutoplayPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/watch-later" element={<WatchLater />} />
                  <Route path="/liked" element={<LikedVideos />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/playlists" element={<Playlists />} />
                  <Route path="/playlist/:id" element={<PlaylistDetail />} />
                  <Route path="/about" element={<InfoPage page="about" />} />
                  <Route path="/disclaimer" element={<InfoPage page="disclaimer" />} />
                  <Route path="/privacy" element={<InfoPage page="privacy" />} />
                  <Route path="/terms" element={<InfoPage page="terms" />} />
                </Route>
                <Route path="/admin" element={<Admin />} />
              </Routes>
              <Toaster position="bottom-right" richColors />
            </div>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
