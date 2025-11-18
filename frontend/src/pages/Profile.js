import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, token, fetchUser } = useAuth();
  const { t, translate } = useLanguage();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    display_name: user?.display_name || '',
    avatar_url: user?.avatar_url || '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t({ id: 'Login untuk melihat profil', en: 'Login to view profile' })}</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          {t(translate.backToHome)}
        </Button>
      </div>
    );
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t({ id: 'Ukuran file maksimal 5MB', en: 'Maximum file size is 5MB' }));
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error(t({ id: 'File harus berupa gambar', en: 'File must be an image' }));
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API}/auth/upload-avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFormData(prev => ({ ...prev, avatar_url: response.data.avatar_url }));
      await fetchUser();
      toast.success(t({ id: 'Avatar berhasil diupload', en: 'Avatar uploaded successfully' }));
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = {
        username: formData.username !== user.username ? formData.username : undefined,
        avatar_url: formData.avatar_url !== user.avatar_url ? formData.avatar_url : undefined,
        password: formData.password || undefined
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
      
      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
        toast.success(t({ id: 'Profil berhasil diperbarui', en: 'Profile updated successfully' }));
        setFormData({ ...formData, password: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto fade-in" data-testid="profile-page">
      <Card>
        <CardHeader>
          <CardTitle>{t(translate.profile)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24" data-testid="profile-avatar">
              <AvatarImage src={formData.avatar_url} />
              <AvatarFallback>{formData.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold" data-testid="profile-username">{user.username}</h2>
              <p className="text-sm text-gray-500" data-testid="profile-email">{user.email || 'No email'}</p>
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="avatar-upload"
                data-testid="avatar-file-input"
              />
              <label htmlFor="avatar-upload">
                <Button type="button" variant="outline" size="sm" asChild data-testid="upload-avatar-btn">
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {t({ id: 'Upload Foto', en: 'Upload Photo' })}
                  </span>
                </Button>
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">{t(translate.username)}</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                data-testid="username-input"
              />
            </div>

            <div>
              <Label htmlFor="avatar_url">{t({ id: 'URL Avatar', en: 'Avatar URL' })}</Label>
              <Input
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                data-testid="avatar-input"
              />
            </div>

            <div>
              <Label htmlFor="password">{t({ id: 'Password Baru (kosongkan jika tidak ingin mengubah)', en: 'New Password (leave empty to keep current)' })}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                data-testid="password-input"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1" data-testid="save-profile-btn">
                {t(translate.save)}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/')} data-testid="cancel-btn">
                {t(translate.cancel)}
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">{t(translate.watchLater)}</span>
              <span className="text-sm font-semibold" data-testid="watch-later-count">{user.watch_later?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">{t(translate.likedVideos)}</span>
              <span className="text-sm font-semibold" data-testid="liked-count">{user.liked_videos?.length || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
