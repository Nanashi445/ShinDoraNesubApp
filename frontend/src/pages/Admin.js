import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Eye, EyeOff, Heart, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Admin = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [pages, setPages] = useState([]);
  const [users, setUsers] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [ads, setAds] = useState([]);
  const [showPasswords, setShowPasswords] = useState({});
  
  // Dialog states
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showPageDialog, setShowPageDialog] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [showSocialDialog, setShowSocialDialog] = useState(false);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  
  // Editing states
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingPage, setEditingPage] = useState(null);
  const [editingAd, setEditingAd] = useState(null);
  const [editingSocial, setEditingSocial] = useState(null);
  const [editingSupport, setEditingSupport] = useState(null);

  useEffect(() => {
    if (adminToken) {
      setAuthenticated(true);
      fetchData();
    }
  }, [adminToken]);

  const fetchData = async () => {
    try {
      const [videosRes, categoriesRes, settingsRes, usersRes, playlistsRes, adsRes] = await Promise.all([
        axios.get(`${API}/videos`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/settings`),
        axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${adminToken}` } }),
        axios.get(`${API}/admin/playlists`, { headers: { Authorization: `Bearer ${adminToken}` } }),
        axios.get(`${API}/admin/ads`, { headers: { Authorization: `Bearer ${adminToken}` } })
      ]);
      setVideos(videosRes.data);
      setCategories(categoriesRes.data);
      setSettings(settingsRes.data);
      setUsers(usersRes.data);
      setPlaylists(playlistsRes.data);
      setAds(adsRes.data);

      // Fetch pages
      const pagesRes = await axios.get(`${API}/pages`);
      setPages(pagesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/admin/auth`, { password });
      const token = response.data.token;
      localStorage.setItem('adminToken', token);
      setAdminToken(token);
      setAuthenticated(true);
      toast.success('Admin login successful');
    } catch (error) {
      toast.error('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
    setAuthenticated(false);
    navigate('/');
  };

  // ===== VIDEO HANDLERS =====
  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const videoData = {
      title: { id: formData.get('title_id'), en: formData.get('title_en') },
      description: { id: formData.get('description_id'), en: formData.get('description_en') },
      embed_url: formData.get('embed_url'),
      category: { id: formData.get('category_id'), en: formData.get('category_en') },
      episode: formData.get('episode'),
      thumbnail_url: formData.get('thumbnail_url')
    };

    try {
      if (editingVideo) {
        await axios.put(`${API}/admin/videos/${editingVideo.id}`, videoData, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        toast.success('Video updated');
      } else {
        await axios.post(`${API}/admin/videos`, videoData, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        toast.success('Video created');
      }
      setShowVideoDialog(false);
      setEditingVideo(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save video');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await axios.delete(`${API}/admin/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      toast.success('Video deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  // ===== CATEGORY HANDLERS =====
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const categoryData = {
      name: { id: formData.get('name_id'), en: formData.get('name_en') },
      color: formData.get('color'),
      thumbnail_url: formData.get('thumbnail_url'),
      video_count: 0
    };

    try {
      if (editingCategory) {
        await axios.put(`${API}/admin/categories/${editingCategory.id}`, 
          { ...categoryData, id: editingCategory.id },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        toast.success('Category updated');
      } else {
        await axios.post(`${API}/admin/categories`, categoryData, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        toast.success('Category created');
      }
      setShowCategoryDialog(false);
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`${API}/admin/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      toast.success('Category deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  // ===== PAGE HANDLERS =====
  const handlePageSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const pageData = {
      page_name: formData.get('page_name'),
      content: { id: formData.get('content_id'), en: formData.get('content_en') }
    };

    try {
      if (editingPage) {
        await axios.put(`${API}/admin/pages/${editingPage.page_name}`, pageData, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        toast.success('Page updated');
      } else {
        await axios.post(`${API}/admin/pages`, pageData, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        toast.success('Page created');
      }
      setShowPageDialog(false);
      setEditingPage(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save page');
    }
  };

  const handleDeletePage = async (pageName) => {
    if (!window.confirm('Delete this page?')) return;
    try {
      await axios.delete(`${API}/admin/pages/${pageName}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      toast.success('Page deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete page');
    }
  };

  // ===== AD HANDLERS =====
  const handleAdSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const adData = {
      title: { id: formData.get('title_id'), en: formData.get('title_en') },
      image_url: formData.get('image_url'),
      link: formData.get('link'),
      position: formData.get('position'),
      enabled: formData.get('enabled') === 'true'
    };

    try {
      if (editingAd) {
        await axios.put(`${API}/admin/ads/${editingAd.id}`, 
          { ...adData, id: editingAd.id },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        toast.success('Ad updated');
      } else {
        await axios.post(`${API}/admin/ads`, adData, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        toast.success('Ad created');
      }
      setShowAdDialog(false);
      setEditingAd(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save ad');
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!window.confirm('Delete this ad?')) return;
    try {
      await axios.delete(`${API}/admin/ads/${adId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      toast.success('Ad deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete ad');
    }
  };

  // ===== SOCIAL/SUPPORT HANDLERS =====
  const handleSocialSupportUpdate = async () => {
    try {
      await axios.put(`${API}/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      toast.success('Links updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update links');
    }
  };

  const handleAddSocial = () => {
    const newLinks = [...(settings.social_links || []), { name: '', url: '' }];
    setSettings({ ...settings, social_links: newLinks });
  };

  const handleRemoveSocial = (index) => {
    const newLinks = settings.social_links.filter((_, i) => i !== index);
    setSettings({ ...settings, social_links: newLinks });
  };

  const handleUpdateSocial = (index, field, value) => {
    const newLinks = [...settings.social_links];
    newLinks[index][field] = value;
    setSettings({ ...settings, social_links: newLinks });
  };

  const handleAddSupport = () => {
    const newLinks = [...(settings.support_links || []), { name: '', url: '' }];
    setSettings({ ...settings, support_links: newLinks });
  };

  const handleRemoveSupport = (index) => {
    const newLinks = settings.support_links.filter((_, i) => i !== index);
    setSettings({ ...settings, support_links: newLinks });
  };

  const handleUpdateSupport = (index, field, value) => {
    const newLinks = [...settings.support_links];
    newLinks[index][field] = value;
    setSettings({ ...settings, support_links: newLinks });
  };

  // ===== USER HANDLERS =====
  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;
    try {
      await axios.delete(`${API}/admin/users/${username}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      toast.success('User deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const togglePasswordVisibility = (username) => {
    setShowPasswords({ ...showPasswords, [username]: !showPasswords[username] });
  };

  // ===== PLAYLIST HANDLERS =====
  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Delete this playlist?')) return;
    try {
      await axios.delete(`${API}/admin/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      toast.success('Playlist deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete playlist');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" data-testid="admin-login">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="admin-password-input"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" data-testid="admin-login-btn">
                  Login
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Site
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="videos" data-testid="videos-tab">Videos</TabsTrigger>
            <TabsTrigger value="categories" data-testid="categories-tab">Categories</TabsTrigger>
            <TabsTrigger value="pages" data-testid="pages-tab">Pages</TabsTrigger>
            <TabsTrigger value="ads" data-testid="ads-tab">Ads</TabsTrigger>
            <TabsTrigger value="users" data-testid="users-tab">Users</TabsTrigger>
            <TabsTrigger value="settings" data-testid="settings-tab">Settings</TabsTrigger>
          </TabsList>

          {/* VIDEOS TAB */}
          <TabsContent value="videos" className="space-y-4">
            <Button onClick={() => { setEditingVideo(null); setShowVideoDialog(true); }} data-testid="add-video-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>

            <div className="grid gap-4">
              {videos.map((video) => (
                <Card key={video.id} data-testid={`video-item-${video.id}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{video.title.en}</h3>
                      <p className="text-sm text-gray-500">{video.category.en} - Episode {video.episode} - {video.views} views</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingVideo(video); setShowVideoDialog(true); }}
                        data-testid={`edit-video-${video.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteVideo(video.id)}
                        data-testid={`delete-video-${video.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* CATEGORIES TAB */}
          <TabsContent value="categories" className="space-y-4">
            <Button onClick={() => { setEditingCategory(null); setShowCategoryDialog(true); }} data-testid="add-category-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>

            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category.id} data-testid={`category-item-${category.id}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded" style={{ backgroundColor: category.color }} />
                      <div>
                        <h3 className="font-semibold">{category.name.en} / {category.name.id}</h3>
                        <p className="text-sm text-gray-500">{category.video_count || 0} videos</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingCategory(category); setShowCategoryDialog(true); }}
                        data-testid={`edit-category-${category.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCategory(category.id)}
                        data-testid={`delete-category-${category.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* PAGES TAB */}
          <TabsContent value="pages" className="space-y-4">
            <Button onClick={() => { setEditingPage(null); setShowPageDialog(true); }} data-testid="add-page-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Page
            </Button>

            <div className="grid gap-4">
              {pages.map((page) => (
                <Card key={page.page_name} data-testid={`page-item-${page.page_name}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold capitalize">{page.page_name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{page.content.en.substring(0, 100)}...</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingPage(page); setShowPageDialog(true); }}
                        data-testid={`edit-page-${page.page_name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePage(page.page_name)}
                        data-testid={`delete-page-${page.page_name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ADS TAB */}
          <TabsContent value="ads" className="space-y-4">
            <Button onClick={() => { setEditingAd(null); setShowAdDialog(true); }} data-testid="add-ad-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Advertisement
            </Button>

            <div className="grid gap-4">
              {ads.map((ad) => (
                <Card key={ad.id} data-testid={`ad-item-${ad.id}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{ad.title.en}</h3>
                      <p className="text-sm text-gray-500">Position: {ad.position} - {ad.enabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingAd(ad); setShowAdDialog(true); }}
                        data-testid={`edit-ad-${ad.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteAd(ad.id)}
                        data-testid={`delete-ad-${ad.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <Card key={user.username} data-testid={`user-item-${user.username}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <img src={user.avatar_url} alt={user.username} className="w-12 h-12 rounded-full" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg">{user.username}</h3>
                              <p className="text-sm text-gray-500">{user.email || 'No email'}</p>
                              
                              <div className="mt-3 space-y-2">
                                <div className="flex items-start gap-2">
                                  <span className="text-xs text-gray-400 font-semibold mt-1 min-w-[70px]">Password:</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => togglePasswordVisibility(user.username)}
                                        data-testid={`toggle-password-${user.username}`}
                                      >
                                        {showPasswords[user.username] ? (
                                          <>
                                            <EyeOff className="w-3 h-3 mr-1" />
                                            Hide
                                          </>
                                        ) : (
                                          <>
                                            <Eye className="w-3 h-3 mr-1" />
                                            Show
                                          </>
                                        )}
                                      </Button>
                                      {showPasswords[user.username] && user.password_plaintext && (
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          onClick={() => {
                                            navigator.clipboard.writeText(user.password_plaintext);
                                            toast.success('Password copied to clipboard!');
                                          }}
                                          data-testid={`copy-password-${user.username}`}
                                        >
                                          Copy Password
                                        </Button>
                                      )}
                                    </div>
                                    {showPasswords[user.username] && (
                                      <div className="mt-2">
                                        <code className="text-xs bg-gray-900 text-green-400 px-3 py-2 rounded block break-all border border-green-700 font-mono">
                                          {user.password_plaintext || 'Password not available (old user)'}
                                        </code>
                                        <p className="text-xs text-red-500 mt-1 font-semibold">
                                          ⚠️ SECURITY RISK: Plaintext password stored for admin recovery
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                          Admin dapat mengirim password ini ke user jika lupa password
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
                                  <span className="flex items-center gap-1">
                                    <Heart className="w-4 h-4" />
                                    {user.liked_videos?.length || 0} likes
                                  </span>
                                  <span className="mx-2">•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {user.watch_later?.length || 0} saved
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.username)}
                            data-testid={`delete-user-${user.username}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Social Links (Ikuti ShinDoraNesub)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {settings?.social_links?.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Name"
                        value={link.name}
                        onChange={(e) => handleUpdateSocial(index, 'name', e.target.value)}
                        data-testid={`social-name-${index}`}
                      />
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => handleUpdateSocial(index, 'url', e.target.value)}
                        data-testid={`social-url-${index}`}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveSocial(index)}
                        data-testid={`remove-social-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button onClick={handleAddSocial} variant="outline" data-testid="add-social-btn">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Social Link
                    </Button>
                    <Button onClick={handleSocialSupportUpdate} data-testid="save-social-btn">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Links (Dukung Kami)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {settings?.support_links?.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Name"
                        value={link.name}
                        onChange={(e) => handleUpdateSupport(index, 'name', e.target.value)}
                        data-testid={`support-name-${index}`}
                      />
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => handleUpdateSupport(index, 'url', e.target.value)}
                        data-testid={`support-url-${index}`}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveSupport(index)}
                        data-testid={`remove-support-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button onClick={handleAddSupport} variant="outline" data-testid="add-support-btn">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Support Link
                    </Button>
                    <Button onClick={handleSocialSupportUpdate} data-testid="save-support-btn">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Playlists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {playlists.map((playlist) => (
                    <div key={playlist.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-semibold">{playlist.name}</h4>
                        <p className="text-sm text-gray-500">By {playlist.user_id} - {playlist.video_ids?.length || 0} videos</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePlaylist(playlist.id)}
                        data-testid={`delete-playlist-${playlist.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* VIDEO DIALOG */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="video-dialog">
          <DialogHeader>
            <DialogTitle>{editingVideo ? 'Edit Video' : 'Add Video'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVideoSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title (Indonesian)</Label>
                <Input name="title_id" defaultValue={editingVideo?.title?.id} required data-testid="video-title-id-input" />
              </div>
              <div>
                <Label>Title (English)</Label>
                <Input name="title_en" defaultValue={editingVideo?.title?.en} required data-testid="video-title-en-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (ID)</Label>
                <Textarea name="description_id" defaultValue={editingVideo?.description?.id} required data-testid="video-description-id-input" />
              </div>
              <div>
                <Label>Description (EN)</Label>
                <Textarea name="description_en" defaultValue={editingVideo?.description?.en} required data-testid="video-description-en-input" />
              </div>
            </div>
            <div>
              <Label>Embed URL</Label>
              <Input name="embed_url" defaultValue={editingVideo?.embed_url} required placeholder="https://www.youtube.com/embed/..." data-testid="video-embed-url-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category (ID)</Label>
                <Input name="category_id" defaultValue={editingVideo?.category?.id} required data-testid="video-category-id-input" />
              </div>
              <div>
                <Label>Category (EN)</Label>
                <Input name="category_en" defaultValue={editingVideo?.category?.en} required data-testid="video-category-en-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Episode</Label>
                <Input name="episode" defaultValue={editingVideo?.episode} data-testid="video-episode-input" />
              </div>
              <div>
                <Label>Thumbnail URL</Label>
                <Input name="thumbnail_url" defaultValue={editingVideo?.thumbnail_url} data-testid="video-thumbnail-input" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" data-testid="video-submit-btn">
                <Save className="w-4 h-4 mr-2" />
                {editingVideo ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowVideoDialog(false); setEditingVideo(null); }} data-testid="video-cancel-btn">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* CATEGORY DIALOG */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent data-testid="category-dialog">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name (Indonesian)</Label>
                <Input name="name_id" defaultValue={editingCategory?.name?.id} required data-testid="category-name-id-input" />
              </div>
              <div>
                <Label>Name (English)</Label>
                <Input name="name_en" defaultValue={editingCategory?.name?.en} required data-testid="category-name-en-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Color</Label>
                <Input name="color" type="color" defaultValue={editingCategory?.color || '#3B82F6'} required data-testid="category-color-input" />
              </div>
              <div>
                <Label>Thumbnail URL</Label>
                <Input name="thumbnail_url" defaultValue={editingCategory?.thumbnail_url} data-testid="category-thumbnail-input" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" data-testid="category-submit-btn">
                <Save className="w-4 h-4 mr-2" />
                {editingCategory ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowCategoryDialog(false); setEditingCategory(null); }} data-testid="category-cancel-btn">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* PAGE DIALOG */}
      <Dialog open={showPageDialog} onOpenChange={setShowPageDialog}>
        <DialogContent className="max-w-2xl" data-testid="page-dialog">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Edit Page' : 'Add Page'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePageSubmit} className="space-y-4">
            <div>
              <Label>Page Name</Label>
              <Input name="page_name" defaultValue={editingPage?.page_name} required disabled={!!editingPage} placeholder="about, disclaimer, privacy, etc" data-testid="page-name-input" />
            </div>
            <div>
              <Label>Content (Indonesian)</Label>
              <Textarea name="content_id" defaultValue={editingPage?.content?.id} required rows={5} data-testid="page-content-id-input" />
            </div>
            <div>
              <Label>Content (English)</Label>
              <Textarea name="content_en" defaultValue={editingPage?.content?.en} required rows={5} data-testid="page-content-en-input" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" data-testid="page-submit-btn">
                <Save className="w-4 h-4 mr-2" />
                {editingPage ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowPageDialog(false); setEditingPage(null); }} data-testid="page-cancel-btn">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AD DIALOG */}
      <Dialog open={showAdDialog} onOpenChange={setShowAdDialog}>
        <DialogContent data-testid="ad-dialog">
          <DialogHeader>
            <DialogTitle>{editingAd ? 'Edit Advertisement' : 'Add Advertisement'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title (Indonesian)</Label>
                <Input name="title_id" defaultValue={editingAd?.title?.id} data-testid="ad-title-id-input" />
              </div>
              <div>
                <Label>Title (English)</Label>
                <Input name="title_en" defaultValue={editingAd?.title?.en} data-testid="ad-title-en-input" />
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input name="image_url" defaultValue={editingAd?.image_url} required data-testid="ad-image-input" />
            </div>
            <div>
              <Label>Link URL</Label>
              <Input name="link" defaultValue={editingAd?.link} required data-testid="ad-link-input" />
            </div>
            <div>
              <Label>Position</Label>
              <Select name="position" defaultValue={editingAd?.position || 'home_top'}>
                <SelectTrigger data-testid="ad-position-select">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_top">Home Top</SelectItem>
                  <SelectItem value="home_sidebar">Home Sidebar</SelectItem>
                  <SelectItem value="video_top">Video Top</SelectItem>
                  <SelectItem value="video_bottom">Video Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="hidden" name="enabled" value={editingAd?.enabled !== false ? 'true' : 'false'} />
              <Label>Enabled</Label>
              <Switch defaultChecked={editingAd?.enabled !== false} onCheckedChange={(checked) => {
                const input = document.querySelector('input[name="enabled"]');
                if (input) input.value = checked ? 'true' : 'false';
              }} data-testid="ad-enabled-switch" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" data-testid="ad-submit-btn">
                <Save className="w-4 h-4 mr-2" />
                {editingAd ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowAdDialog(false); setEditingAd(null); }} data-testid="ad-cancel-btn">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
