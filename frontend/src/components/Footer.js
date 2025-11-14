import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const navigate = useNavigate();
  const { t, translate } = useLanguage();

  const socialLinks = [
    { name: 'TikTok', url: 'https://tiktok.com/@shindoranesub' },
    { name: 'Facebook', url: 'https://www.facebook.com/p/ShinDora-Nesub-61567024627372/' },
    { name: 'YouTube', url: 'https://www.youtube.com/channel/UCBmc1P810YLRcKimSfdtFRA' },
  ];

  const supportLinks = [
    { name: 'Trakteer', url: 'https://trakteer.id/ShinDoraNesub/tip' },
    { name: 'Saweria', url: 'https://saweria.co/ShinDoraNesub' },
    { name: 'Ko-fi', url: 'https://ko-fi.com/shindoranesub' },
    { name: 'Sociabuzz', url: 'https://sociabuzz.com/shindoranesub/tribe' },
  ];

  const infoLinks = [
    { label: translate.about, path: '/about' },
    { label: translate.disclaimer, path: '/disclaimer' },
    { label: translate.privacy, path: '/privacy' },
    { label: translate.terms, path: '/terms' },
  ];

  return (
    <footer className="border-t border-gray-800 mt-12 py-8 px-6" data-testid="footer">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">{t(translate.follow)}</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-blue-500 transition-colors"
                  data-testid={`social-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">{t(translate.support)}</h3>
            <div className="flex flex-wrap gap-3">
              {supportLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-blue-500 transition-colors"
                  data-testid={`support-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Links</h3>
            <div className="flex flex-wrap gap-3">
              {infoLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="text-sm hover:text-blue-500 transition-colors"
                  data-testid={`footer-link-${link.path.slice(1)}`}
                >
                  {t(link.label)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-800">
          © 2025 ShinDora Nesub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
