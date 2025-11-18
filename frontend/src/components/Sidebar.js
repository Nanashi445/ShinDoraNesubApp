import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Clock, Heart, Play, Grid3x3, List } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, translate } = useLanguage();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const menuItems = [
    { icon: Home, label: translate.home, path: '/', testId: 'sidebar-home' },
    { icon: TrendingUp, label: translate.trending, path: '/?sort=trending', testId: 'sidebar-trending' },
    { icon: Clock, label: translate.watchLater, path: '/watch-later', testId: 'sidebar-watch-later' },
    { icon: Heart, label: translate.likedVideos, path: '/liked', testId: 'sidebar-liked' },
    { icon: List, label: { id: 'Playlist', en: 'Playlists' }, path: '/playlists', testId: 'sidebar-playlists' },
    { icon: Play, label: translate.autoplay, path: '/autoplay', testId: 'sidebar-autoplay' },
  ];

  const isActive = (path) => location.pathname === path || location.search === path.split('?')[1];

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-opacity-95 backdrop-blur-sm border-r border-gray-800 transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ width: '16rem' }}
      data-testid="sidebar"
    >
      <ScrollArea className="h-full">
        <div className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => navigate(item.path)}
              data-testid={item.testId}
            >
              <item.icon className="w-5 h-5" />
              {t(item.label)}
            </Button>
          ))}

          <div className="pt-4 border-t border-gray-700 mt-4">
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold mb-3">
              <Grid3x3 className="w-4 h-4" />
              {t(translate.allCategories)}
            </div>
            <div className="grid grid-cols-2 gap-2 px-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/?category=${encodeURIComponent(t(category.name))}`)}
                  data-testid={`category-${category.id}`}
                >
                  <div 
                    className="aspect-square flex flex-col items-center justify-center p-3"
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  >
                    {category.thumbnail_url ? (
                      <img src={category.thumbnail_url} alt={t(category.name)} className="w-12 h-12 object-contain mb-2" />
                    ) : (
                      <Grid3x3 className="w-12 h-12 text-white opacity-50 mb-2" />
                    )}
                    <h3 className="text-xs font-semibold text-white text-center line-clamp-2">
                      {t(category.name)}
                    </h3>
                    <p className="text-xs text-white opacity-75 mt-1">
                      {category.video_count || 0} video
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default Sidebar;
