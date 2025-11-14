import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WatchLater = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t, translate } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWatchLater();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWatchLater = async () => {
    try {
      const response = await axios.get(`${API}/user/watch-later`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(response.data);
    } catch (error) {
      console.error('Failed to fetch watch later:', error);
      toast.error('Failed to load watch later videos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (videoId) => {
    try {
      await axios.delete(`${API}/user/watch-later/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(videos.filter(v => v.id !== videoId));
      toast.success(t({ id: 'Dihapus dari tonton nanti', en: 'Removed from watch later' }));
    } catch (error) {
      toast.error('Failed to remove video');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t({ id: 'Login untuk melihat video tonton nanti', en: 'Login to view watch later videos' })}</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          {t(translate.backToHome)}
        </Button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6 fade-in" data-testid="watch-later-page">
      <h1 className="text-2xl font-bold">{t(translate.watchLater)}</h1>

      {videos.length === 0 ? (
        <div className="text-center py-12" data-testid="empty-watch-later">
          <p className="text-gray-500">
            {t({ id: 'Tidak ada video di tonton nanti', en: 'No videos in watch later' })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="watch-later-grid">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onWatchLater={() => handleRemove(video.id)}
              isInWatchLater={true}
              isLiked={user?.liked_videos?.includes(video.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchLater;
