import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Admin = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [pages, setPages] = useState({});
  const [editingVideo, setEditingVideo] = useState(null);
  const [showVideoDialog, setShowVideoDialog] = useState(false);

  useEffect(() => {
    if (adminToken) {
      setAuthenticated(true);
      fetchData();
    }
  }, [adminToken]);

  const fetchData = async () => {
    try {
      const [videosRes, categoriesRes, settingsRes] = await Promise.all([
        axios.get(`${API}/videos`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/settings`)
      ]);
      setVideos(videosRes.data);
      setCategories(categoriesRes.data);
      setSettings(settingsRes.data);

      // Fetch pages
      const pageNames = ['about', 'disclaimer', 'privacy', 'terms'];
      const pagesData = {};
      for (const pageName of pageNames) {
        try {
          const res = await axios.get(`${API}/pages/${pageName}`);
          pagesData[pageName] = res.data;
        } catch (error) {
          console.error(`Failed to fetch ${pageName}:`, error);
        }
      }
      setPages(pagesData);
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

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const videoData = {
      title: {
        id: formData.get('title_id'),
        en: formData.get('title_en')
      },
      description: {
        id: formData.get('description_id'),
        en: formData.get('description_en')
      },
      embed_url: formData.get('embed_url'),
      category: {
        id: formData.get('category_id'),
        en: formData.get('category_en')
      },
      episode: formData.get('episode'),
      thumbnail_url: formData.get('thumbnail_url')
    };

    try {
      if (editingVideo) {
        await axios.put(`${API}/admin/videos/${editingVideo.id}`, videoData, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        toast.success('Video updated successfully');
      } else {
        await axios.post(`${API}/admin/videos`, videoData, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        toast.success('Video created successfully');
      }
      setShowVideoDialog(false);
      setEditingVideo(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save video');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await axios.delete(`${API}/admin/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      toast.success('Video deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const settingsData = {
      logo_url: formData.get('logo_url'),
      theme: {
        primaryColor: formData.get('primaryColor'),
        darkBg: formData.get('darkBg'),
        lightBg: formData.get('lightBg'),
        textColor: formData.get('textColor')
      },
      ads: {
        image: formData.get('ads_image'),
        link: formData.get('ads_link'),
        title: {
          id: formData.get('ads_title_id'),
          en: formData.get('ads_title_en')
        }
      }
    };

    try {
      await axios.put(`${API}/admin/settings`, settingsData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      toast.success('Settings updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handlePageUpdate = async (pageName, e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const pageData = {
      page_name: pageName,
      content: {
        id: formData.get('content_id'),
        en: formData.get('content_en')
      }
    };

    try {
      await axios.put(`${API}/admin/pages/${pageName}`, pageData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      toast.success('Page updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update page');
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="videos" data-testid="videos-tab">Videos</TabsTrigger>
            <TabsTrigger value="categories" data-testid="categories-tab">Categories</TabsTrigger>
            <TabsTrigger value="settings" data-testid="settings-tab">Settings</TabsTrigger>
            <TabsTrigger value="pages" data-testid="pages-tab">Pages</TabsTrigger>
          </TabsList>

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
                      <h3 className="font-semibold">{video.title.en} / {video.title.id}</h3>
                      <p className="text-sm text-gray-500">{video.category.en} - {video.views} views</p>
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

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSettingsUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input
                      id="logo_url"
                      name="logo_url"
                      defaultValue={settings?.logo_url}
                      data-testid="logo-url-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <Input
                        id="primaryColor"
                        name="primaryColor"
                        type="color"
                        defaultValue={settings?.theme?.primaryColor}
                        data-testid="primary-color-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="darkBg">Dark Background</Label>
                      <Input
                        id="darkBg"
                        name="darkBg"
                        type="color"
                        defaultValue={settings?.theme?.darkBg}
                        data-testid="dark-bg-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lightBg">Light Background</Label>
                      <Input
                        id="lightBg"
                        name="lightBg"
                        type="color"
                        defaultValue={settings?.theme?.lightBg}
                        data-testid="light-bg-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="textColor">Text Color</Label>
                      <Input
                        id="textColor"
                        name="textColor"
                        type="color"
                        defaultValue={settings?.theme?.textColor}
                        data-testid="text-color-input"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Advertisement</h3>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="ads_image">Ad Image URL</Label>
                        <Input
                          id="ads_image"
                          name="ads_image"
                          defaultValue={settings?.ads?.image}
                          data-testid="ads-image-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ads_link">Ad Link</Label>
                        <Input
                          id="ads_link"
                          name="ads_link"
                          defaultValue={settings?.ads?.link}
                          data-testid="ads-link-input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="ads_title_id">Ad Title (ID)</Label>
                          <Input
                            id="ads_title_id"
                            name="ads_title_id"
                            defaultValue={settings?.ads?.title?.id}
                            data-testid="ads-title-id-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ads_title_en">Ad Title (EN)</Label>
                          <Input
                            id="ads_title_en"
                            name="ads_title_en"
                            defaultValue={settings?.ads?.title?.en}
                            data-testid="ads-title-en-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" data-testid="save-settings-btn">
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="space-y-4">
            {['about', 'disclaimer', 'privacy', 'terms'].map((pageName) => (
              <Card key={pageName}>
                <CardHeader>
                  <CardTitle className="capitalize">{pageName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handlePageUpdate(pageName, e)} className="space-y-4">
                    <div>
                      <Label htmlFor={`${pageName}_content_id`}>Content (Indonesian)</Label>
                      <Textarea
                        id={`${pageName}_content_id`}
                        name="content_id"
                        rows={5}
                        defaultValue={pages[pageName]?.content?.id}
                        data-testid={`${pageName}-content-id-input`}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${pageName}_content_en`}>Content (English)</Label>
                      <Textarea
                        id={`${pageName}_content_en`}
                        name="content_en"
                        rows={5}
                        defaultValue={pages[pageName]?.content?.en}
                        data-testid={`${pageName}-content-en-input`}
                      />
                    </div>
                    <Button type="submit" data-testid={`save-${pageName}-btn`}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="video-dialog">
          <DialogHeader>
            <DialogTitle>{editingVideo ? 'Edit Video' : 'Add Video'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVideoSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title_id">Title (Indonesian)</Label>
                <Input
                  id="title_id"
                  name="title_id"
                  defaultValue={editingVideo?.title?.id}
                  required
                  data-testid="video-title-id-input"
                />
              </div>
              <div>
                <Label htmlFor="title_en">Title (English)</Label>
                <Input
                  id="title_en"
                  name="title_en"
                  defaultValue={editingVideo?.title?.en}
                  required
                  data-testid="video-title-en-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description_id">Description (Indonesian)</Label>
                <Textarea
                  id="description_id"
                  name="description_id"
                  defaultValue={editingVideo?.description?.id}
                  required
                  data-testid="video-description-id-input"
                />
              </div>
              <div>
                <Label htmlFor="description_en">Description (English)</Label>
                <Textarea
                  id="description_en"
                  name="description_en"
                  defaultValue={editingVideo?.description?.en}
                  required
                  data-testid="video-description-en-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="embed_url">Embed URL (iframe src)</Label>
              <Input
                id="embed_url"
                name="embed_url"
                defaultValue={editingVideo?.embed_url}
                required
                placeholder="https://www.youtube.com/embed/..."
                data-testid="video-embed-url-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category_id">Category (Indonesian)</Label>
                <Input
                  id="category_id"
                  name="category_id"
                  defaultValue={editingVideo?.category?.id}
                  required
                  data-testid="video-category-id-input"
                />
              </div>
              <div>
                <Label htmlFor="category_en">Category (English)</Label>
                <Input
                  id="category_en"
                  name="category_en"
                  defaultValue={editingVideo?.category?.en}
                  required
                  data-testid="video-category-en-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="episode">Episode</Label>
                <Input
                  id="episode"
                  name="episode"
                  defaultValue={editingVideo?.episode}
                  data-testid="video-episode-input"
                />
              </div>
              <div>
                <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                <Input
                  id="thumbnail_url"
                  name="thumbnail_url"
                  defaultValue={editingVideo?.thumbnail_url}
                  data-testid="video-thumbnail-input"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" data-testid="video-submit-btn">
                <Save className="w-4 h-4 mr-2" />
                {editingVideo ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowVideoDialog(false); setEditingVideo(null); }}
                data-testid="video-cancel-btn"
              >
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
