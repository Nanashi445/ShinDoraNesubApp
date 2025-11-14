import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'id';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'id' ? 'en' : 'id');
  };

  const t = (bilingualText) => {
    if (!bilingualText) return '';
    if (typeof bilingualText === 'string') return bilingualText;
    return bilingualText[language] || bilingualText.en || '';
  };

  const translate = {
    home: { id: 'Beranda', en: 'Home' },
    trending: { id: 'Trending', en: 'Trending' },
    watchLater: { id: 'Tonton Nanti', en: 'Watch Later' },
    likedVideos: { id: 'Video Disukai', en: 'Liked Videos' },
    autoplay: { id: 'Putar Otomatis', en: 'Autoplay' },
    allCategories: { id: 'Semua Kategori', en: 'All Categories' },
    search: { id: 'Cari video...', en: 'Search videos...' },
    views: { id: 'tayangan', en: 'views' },
    episode: { id: 'Episode', en: 'Episode' },
    description: { id: 'Deskripsi', en: 'Description' },
    comments: { id: 'Komentar', en: 'Comments' },
    noComments: { id: 'Belum ada komentar', en: 'No comments yet' },
    addComment: { id: 'Tambah komentar...', en: 'Add comment...' },
    login: { id: 'Masuk', en: 'Login' },
    register: { id: 'Daftar', en: 'Register' },
    logout: { id: 'Keluar', en: 'Logout' },
    profile: { id: 'Profil', en: 'Profile' },
    username: { id: 'Nama Pengguna', en: 'Username' },
    password: { id: 'Kata Sandi', en: 'Password' },
    email: { id: 'Email', en: 'Email' },
    save: { id: 'Simpan', en: 'Save' },
    cancel: { id: 'Batal', en: 'Cancel' },
    delete: { id: 'Hapus', en: 'Delete' },
    edit: { id: 'Edit', en: 'Edit' },
    autoplayEnabled: { id: 'Putar Otomatis Aktif', en: 'Autoplay Enabled' },
    previous: { id: 'Sebelumnya', en: 'Previous' },
    next: { id: 'Berikutnya', en: 'Next' },
    upNext: { id: 'Selanjutnya', en: 'Up Next' },
    about: { id: 'Tentang Kami', en: 'About Us' },
    disclaimer: { id: 'Disclaimer', en: 'Disclaimer' },
    privacy: { id: 'Kebijakan Privasi', en: 'Privacy Policy' },
    terms: { id: 'Syarat & Ketentuan', en: 'Terms & Conditions' },
    backToHome: { id: 'Kembali ke Beranda', en: 'Back to Home' },
    follow: { id: 'Ikuti ShinDoraNesub:', en: 'Follow ShinDoraNesub:' },
    support: { id: 'Dukung Kami:', en: 'Support Us:' },
    category: { id: 'Kategori', en: 'Category' },
    all: { id: 'Semua', en: 'All' }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};
