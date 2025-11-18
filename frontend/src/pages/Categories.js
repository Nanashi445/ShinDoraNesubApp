import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { Grid3x3 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Categories = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6 fade-in" data-testid="categories-page">
      <div className="flex items-center gap-3">
        <Grid3x3 className="w-8 h-8" />
        <h1 className="text-3xl font-bold">
          {t({ id: 'Semua Kategori', en: 'All Categories' })}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" data-testid="categories-grid">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => navigate(`/?category=${encodeURIComponent(t(category.name))}`)}
            data-testid={`category-card-${category.id}`}
          >
            <div
              className="aspect-video flex items-center justify-center"
              style={{ backgroundColor: category.color }}
            >
              {category.thumbnail_url ? (
                <img
                  src={category.thumbnail_url}
                  alt={t(category.name)}
                  className="w-24 h-24 object-contain"
                />
              ) : (
                <Grid3x3 className="w-24 h-24 text-white opacity-50" />
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg" data-testid={`category-name-${category.id}`}>
                {t(category.name)}
              </h3>
              <p className="text-sm text-gray-500" data-testid={`category-count-${category.id}`}>
                {category.video_count || 0} {t({ id: 'video', en: 'videos' })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Categories;
