import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LikedVideos = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t, translate } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLikedVideos();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchLikedVideos = async () => {
    try {
      const response = await axios.get(`${API}/user/liked-videos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(response.data);
    } catch (error) {
      console.error('Failed to fetch liked videos:', error);
      toast.error('Failed to load liked videos');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (videoId) => {
    try {
      await axios.delete(`${API}/videos/${videoId}/like`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(videos.filter(v => v.id !== videoId));
      toast.success(t({ id: 'Video tidak disukai lagi', en: 'Video unliked' }));
    } catch (error) {
      toast.error('Failed to unlike video');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t({ id: 'Login untuk melihat video yang disukai', en: 'Login to view liked videos' })}</p>
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
    <div className="space-y-6 fade-in" data-testid="liked-videos-page">
      <h1 className="text-2xl font-bold">{t(translate.likedVideos)}</h1>

      {videos.length === 0 ? (
        <div className="text-center py-12" data-testid="empty-liked">
          <p className="text-gray-500">
            {t({ id: 'Tidak ada video yang disukai', en: 'No liked videos' })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="liked-grid">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onLike={() => handleUnlike(video.id)}
              isLiked={true}
              isInWatchLater={user?.watch_later?.includes(video.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedVideos;
