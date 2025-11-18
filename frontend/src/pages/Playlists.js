import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Plus, List, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Playlists = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', is_public: true });

  useEffect(() => {
    fetchPlaylists();
  }, [user]);

  const fetchPlaylists = async () => {
    try {
      const url = user ? `${API}/playlists?user_id=${user.username}` : `${API}/playlists`;
      const response = await axios.get(url);
      setPlaylists(response.data);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error(t({ id: 'Login untuk membuat playlist', en: 'Login to create playlist' }));
      return;
    }

    try {
      await axios.post(
        `${API}/playlists`,
        newPlaylist,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t({ id: 'Playlist dibuat', en: 'Playlist created' }));
      setShowCreateDialog(false);
      setNewPlaylist({ name: '', description: '', is_public: true });
      fetchPlaylists();
    } catch (error) {
      toast.error('Failed to create playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm(t({ id: 'Hapus playlist ini?', en: 'Delete this playlist?' }))) return;

    try {
      await axios.delete(`${API}/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t({ id: 'Playlist dihapus', en: 'Playlist deleted' }));
      fetchPlaylists();
    } catch (error) {
      toast.error('Failed to delete playlist');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6 fade-in" data-testid="playlists-page">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <List className="w-8 h-8" />
          <h1 className="text-3xl font-bold">
            {t({ id: 'Playlist', en: 'Playlists' })}
          </h1>
        </div>
        {user && (
          <Button onClick={() => setShowCreateDialog(true)} data-testid="create-playlist-btn">
            <Plus className="w-4 h-4 mr-2" />
            {t({ id: 'Buat Playlist', en: 'Create Playlist' })}
          </Button>
        )}
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-12" data-testid="empty-playlists">
          <p className="text-gray-500">
            {t({ id: 'Belum ada playlist', en: 'No playlists yet' })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" data-testid="playlists-grid">
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              className="cursor-pointer hover:scale-105 transition-transform duration-300 relative group"
              data-testid={`playlist-card-${playlist.id}`}
            >
              <div onClick={() => navigate(`/playlist/${playlist.id}`)}>
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {playlist.thumbnail_url ? (
                    <img src={playlist.thumbnail_url} alt={playlist.name} className="w-full h-full object-cover" />
                  ) : (
                    <List className="w-16 h-16 text-white opacity-50" />
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                    {playlist.video_ids?.length || 0} {t({ id: 'video', en: 'videos' })}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg line-clamp-1" data-testid={`playlist-name-${playlist.id}`}>
                    {playlist.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2" data-testid={`playlist-desc-${playlist.id}`}>
                    {playlist.description || t({ id: 'Tidak ada deskripsi', en: 'No description' })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t({ id: 'Oleh', en: 'By' })} {playlist.user_id}
                  </p>
                </CardContent>
              </div>
              {user?.username === playlist.user_id && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePlaylist(playlist.id);
                  }}
                  data-testid={`delete-playlist-${playlist.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent data-testid="create-playlist-dialog">
          <DialogHeader>
            <DialogTitle>{t({ id: 'Buat Playlist Baru', en: 'Create New Playlist' })}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePlaylist} className="space-y-4">
            <div>
              <Label htmlFor="name">{t({ id: 'Nama Playlist', en: 'Playlist Name' })}</Label>
              <Input
                id="name"
                value={newPlaylist.name}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                required
                data-testid="playlist-name-input"
              />
            </div>
            <div>
              <Label htmlFor="description">{t({ id: 'Deskripsi', en: 'Description' })}</Label>
              <Textarea
                id="description"
                value={newPlaylist.description}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                data-testid="playlist-desc-input"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                checked={newPlaylist.is_public}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, is_public: e.target.checked })}
                data-testid="playlist-public-checkbox"
              />
              <Label htmlFor="is_public">{t({ id: 'Publik', en: 'Public' })}</Label>
            </div>
            <Button type="submit" className="w-full" data-testid="submit-playlist-btn">
              {t({ id: 'Buat', en: 'Create' })}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Playlists;
