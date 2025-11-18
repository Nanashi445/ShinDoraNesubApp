import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import VideoCard from '../components/VideoCard';
import { Button } from '../components/ui/button';
import { ArrowLeft, Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t, translate } = useLanguage();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      const response = await axios.get(`${API}/playlists/${id}`);
      setPlaylist(response.data);
    } catch (error) {
      console.error('Failed to fetch playlist:', error);
      toast.error('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      await axios.delete(`${API}/playlists/${id}/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t({ id: 'Video dihapus dari playlist', en: 'Video removed from playlist' }));
      fetchPlaylist();
    } catch (error) {
      toast.error('Failed to remove video');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t({ id: 'Playlist tidak ditemukan', en: 'Playlist not found' })}</p>
        <Button onClick={() => navigate('/playlists')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t({ id: 'Kembali', en: 'Back' })}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in" data-testid="playlist-detail-page">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate('/playlists')} data-testid="back-btn">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t({ id: 'Kembali', en: 'Back' })}
          </Button>
          <h1 className="text-3xl font-bold mt-2" data-testid="playlist-title">{playlist.name}</h1>
          <p className="text-gray-500 mt-1" data-testid="playlist-description">{playlist.description}</p>
          <p className="text-sm text-gray-400 mt-1">
            {t({ id: 'Oleh', en: 'By' })} {playlist.user_id} • {playlist.video_ids?.length || 0} {t({ id: 'video', en: 'videos' })}
          </p>
        </div>
        {playlist.videos && playlist.videos.length > 0 && (
          <Button onClick={() => navigate(`/playlist/${id}/autoplay`)} data-testid="autoplay-playlist-btn">
            <Play className="w-4 h-4 mr-2" />
            {t({ id: 'Putar Otomatis', en: 'Autoplay' })}
          </Button>
        )}
      </div>

      {playlist.videos && playlist.videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="playlist-videos">
          {playlist.videos.map((video) => (
            <div key={video.id} className="relative">
              <VideoCard video={video} />
              {user?.username === playlist.user_id && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => handleRemoveVideo(video.id)}
                  data-testid={`remove-video-${video.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12" data-testid="empty-playlist">
          <p className="text-gray-500">
            {t({ id: 'Playlist kosong', en: 'Playlist is empty' })}
          </p>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;
