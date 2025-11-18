import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PlaylistAutoplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, translate } = useLanguage();
  const [playlist, setPlaylist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(() => {
    return parseInt(localStorage.getItem(`playlistAutoplay_${id}`) || '0');
  });
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  useEffect(() => {
    localStorage.setItem(`playlistAutoplay_${id}`, currentIndex.toString());
  }, [currentIndex, id]);

  const fetchPlaylist = async () => {
    try {
      const response = await axios.get(`${API}/playlists/${id}`);
      setPlaylist(response.data);
      setVideos(response.data.videos || []);
    } catch (error) {
      console.error('Failed to fetch playlist:', error);
      toast.error('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleVideoSelect = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!playlist || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t({ id: 'Playlist kosong atau tidak ditemukan', en: 'Playlist empty or not found' })}</p>
        <Button onClick={() => navigate('/playlists')} className="mt-4">
          {t(translate.backToHome)}
        </Button>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];
  const upNextVideos = videos.slice(currentIndex + 1, currentIndex + 6);

  return (
    <div className="max-w-7xl mx-auto space-y-6 fade-in" data-testid="playlist-autoplay-page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" data-testid="playlist-autoplay-title">
          {playlist.name} - {t({ id: 'Mode Putar Otomatis', en: 'Autoplay Mode' })}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm">{t(translate.autoplayEnabled)}</span>
          <Switch
            checked={autoplayEnabled}
            onCheckedChange={setAutoplayEnabled}
            data-testid="autoplay-toggle"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video rounded-lg overflow-hidden bg-black" data-testid="playlist-autoplay-player">
            <iframe
              src={currentVideo.embed_url}
              className="w-full h-full"
              allowFullScreen
              title={t(currentVideo.title)}
            />
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h2 className="text-xl font-bold" data-testid="current-video-title">
                {t(currentVideo.title)}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span data-testid="current-video-category">{t(currentVideo.category)}</span>
                {currentVideo.episode && (
                  <span data-testid="current-video-episode">
                    {t(translate.episode)} {currentVideo.episode}
                  </span>
                )}
                <span>{currentVideo.views} {t(translate.views)}</span>
              </div>
              <p className="text-sm" data-testid="current-video-description">
                {t(currentVideo.description)}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex-1"
              data-testid="previous-btn"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t(translate.previous)}
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex === videos.length - 1}
              className="flex-1"
              data-testid="next-btn"
            >
              {t(translate.next)}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">{t(translate.upNext)}</h3>
          <div className="space-y-2" data-testid="up-next-list">
            {upNextVideos.map((video, index) => (
              <Card
                key={video.id}
                className="cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleVideoSelect(currentIndex + index + 1)}
                data-testid={`up-next-${video.id}`}
              >
                <CardContent className="p-3 flex gap-3">
                  <div className="w-32 aspect-video rounded overflow-hidden flex-shrink-0">
                    <img
                      src={video.thumbnail_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${video.id}`}
                      alt={t(video.title)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold line-clamp-2">
                      {t(video.title)}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {t(video.category)}
                      {video.episode && ` • ${t(translate.episode)} ${video.episode}`}
                    </p>
                  </div>
                  <Play className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistAutoplay;
