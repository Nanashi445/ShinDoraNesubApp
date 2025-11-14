import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const InfoPage = ({ page }) => {
  const navigate = useNavigate();
  const { t, translate } = useLanguage();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [page]);

  const fetchPage = async () => {
    try {
      const response = await axios.get(`${API}/pages/${page}`);
      setContent(response.data);
    } catch (error) {
      console.error('Failed to fetch page:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const titles = {
      about: translate.about,
      disclaimer: translate.disclaimer,
      privacy: translate.privacy,
      terms: translate.terms
    };
    return t(titles[page] || { id: page, en: page });
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t({ id: 'Halaman tidak ditemukan', en: 'Page not found' })}</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t(translate.backToHome)}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto fade-in" data-testid={`info-page-${page}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl" data-testid="page-title">{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap leading-relaxed" data-testid="page-content">
            {t(content.content)}
          </p>
          <Button onClick={() => navigate('/')} className="mt-6" data-testid="back-btn">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t(translate.backToHome)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoPage;
