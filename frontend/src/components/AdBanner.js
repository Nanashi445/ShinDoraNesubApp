import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from './ui/card';
import { X } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdBanner = ({ position }) => {
  const { t } = useLanguage();
  const [ads, setAds] = useState([]);
  const [closedAds, setClosedAds] = useState(() => {
    const saved = localStorage.getItem('closedAds');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchAds();
  }, [position]);

  const fetchAds = async () => {
    try {
      const response = await axios.get(`${API}/ads?position=${position}`);
      setAds(response.data.filter(ad => !closedAds.includes(ad.id)));
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    }
  };

  const handleClose = (adId) => {
    const newClosedAds = [...closedAds, adId];
    setClosedAds(newClosedAds);
    localStorage.setItem('closedAds', JSON.stringify(newClosedAds));
    setAds(ads.filter(ad => ad.id !== adId));
  };

  if (ads.length === 0) return null;

  return (
    <div className="space-y-4" data-testid={`ads-${position}`}>
      {ads.map((ad) => (
        <Card key={ad.id} className="relative overflow-hidden" data-testid={`ad-${ad.id}`}>
          <button
            onClick={() => handleClose(ad.id)}
            className="absolute top-2 right-2 z-10 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            data-testid={`close-ad-${ad.id}`}
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <a
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            data-testid={`ad-link-${ad.id}`}
          >
            {ad.image_url && (
              <img
                src={ad.image_url}
                alt={t(ad.title)}
                className="w-full h-auto object-cover"
              />
            )}
            {t(ad.title) && (
              <div className="p-3 text-center">
                <p className="text-sm font-semibold">{t(ad.title)}</p>
              </div>
            )}
          </a>
        </Card>
      ))}
    </div>
  );
};

export default AdBanner;
