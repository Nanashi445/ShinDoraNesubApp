import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Home = () => {
  const [searchParams] = useSearchParams();
  const { user, token } = useAuth();
  const { t, translate } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories([{ id: 'all', name: { id: 'Semua', en: 'All' } }, ...response.data]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const category = searchParams.get('category');
      const search = searchParams.get('search');
      let url = `${API}/videos?`;
      if (category && category !== 'All') url += `category=${encodeURIComponent(category)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const response = await axios.get(url);
      setVideos(response.data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (videoId) => {
    if (!user) {
      toast.error(t({ id: 'Login untuk menyukai video', en: 'Login to like videos' }));
      return;
    }
    try {
      const isLiked = user.liked_videos?.includes(videoId);
      if (isLiked) {
        await axios.delete(`${API}/videos/${videoId}/like`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/videos/${videoId}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      // Refresh user data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update like status');
    }
  };

  const handleWatchLater = async (videoId) => {
    if (!user) {
      toast.error(t({ id: 'Login untuk menambah ke tonton nanti', en: 'Login to add to watch later' }));
      return;
    }
    try {
      const isInWatchLater = user.watch_later?.includes(videoId);
      if (isInWatchLater) {
        await axios.delete(`${API}/user/watch-later/${videoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/user/watch-later/${videoId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update watch later');
    }
  };

  return (
    <div className="space-y-6 fade-in" data-testid="home-page">
      <div className="flex gap-2 overflow-x-auto pb-2" data-testid="category-tabs">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === t(cat.name) ? 'default' : 'outline'}
            onClick={() => {
              setSelectedCategory(t(cat.name));
              window.location.href = `/?category=${encodeURIComponent(t(cat.name))}`;
            }}
            className="whitespace-nowrap"
            data-testid={`category-tab-${cat.id}`}
          >
            {t(cat.name)}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-700 rounded-lg" />
              <div className="mt-2 h-4 bg-gray-700 rounded" />
              <div className="mt-2 h-3 bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12" data-testid="no-videos-message">
          <p className="text-gray-500">
            {t({ id: 'Tidak ada video ditemukan', en: 'No videos found' })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="video-grid">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onLike={() => handleLike(video.id)}
              onWatchLater={() => handleWatchLater(video.id)}
              isLiked={user?.liked_videos?.includes(video.id)}
              isInWatchLater={user?.watch_later?.includes(video.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
