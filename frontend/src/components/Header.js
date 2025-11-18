import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Moon, Sun, Globe, User, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme, settings } = useTheme();
  const { language, changeLanguage, translate, t, availableLanguages } = useLanguage();
  const { user, login, register, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authData, setAuthData] = useState({ username: '', display_name: '', password: '', email: '' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({ username: '', new_password: '' });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        await login(authData.username, authData.password);
        toast.success(language === 'id' ? 'Login berhasil!' : 'Login successful!')
      } else {
        if (!authData.display_name) {
          toast.error(language === 'id' ? 'Nama pengguna wajib diisi' : 'Display name is required');
          return;
        }
        await register(authData.username, authData.display_name, authData.password, authData.email);
        toast.success(language === 'id' ? 'Registrasi berhasil!' : 'Registration successful!');
      }
      setShowAuth(false);
      setAuthData({ username: '', display_name: '', password: '', email: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/auth/forgot-password`, forgotPasswordData);
      toast.success(language === 'id' ? 'Password berhasil direset!' : 'Password has been reset!');
      setShowForgotPassword(false);
      setForgotPasswordData({ username: '', new_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reset password');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success(language === 'id' ? 'Logout berhasil' : 'Logged out successfully');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-800" data-testid="main-header">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onMenuClick} data-testid="menu-toggle-btn">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')} data-testid="logo-link">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="ShinDora Nesub" className="h-8 w-8" />
              ) : (
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
              )}
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                ShinDora Nesub
              </h1>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-6" data-testid="search-form">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t(translate.search)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-full"
                data-testid="search-input"
              />
            </div>
          </form>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="theme-toggle-btn">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="language-toggle-btn">
                  <Globe className="w-5 h-5" />
                  <span className="ml-1 text-xs font-semibold">{language.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={language === lang.code ? 'bg-blue-500/20' : ''}
                    data-testid={`lang-${lang.code}`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {language === lang.code && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="user-menu-btn">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="profile-menu-item">
                    <User className="w-4 h-4 mr-2" />
                    {t(translate.profile)}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="logout-menu-item">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t(translate.logout)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => { setAuthMode('login'); setShowAuth(true); }} data-testid="login-btn">
                {t(translate.login)}
              </Button>
            )}
          </div>
        </div>
      </header>

      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent data-testid="auth-dialog">
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? t(translate.login) : t(translate.register)}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="username">{t(translate.username)}</Label>
              <Input
                id="username"
                value={authData.username}
                onChange={(e) => setAuthData({ ...authData, username: e.target.value })}
                required
                data-testid="auth-username-input"
              />
            </div>
            {authMode === 'register' && (
              <div>
                <Label htmlFor="display_name">{language === 'id' ? 'Nama Pengguna' : 'Display Name'}</Label>
                <Input
                  id="display_name"
                  value={authData.display_name}
                  onChange={(e) => setAuthData({ ...authData, display_name: e.target.value })}
                  required
                  data-testid="auth-display-name-input"
                />
              </div>
            )}
            <div>
              <Label htmlFor="password">{t(translate.password)}</Label>
              <Input
                id="password"
                type="password"
                value={authData.password}
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                required
                data-testid="auth-password-input"
              />
            </div>
            {authMode === 'register' && (
              <div>
                <Label htmlFor="email">{t(translate.email)} (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={authData.email}
                  onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                  data-testid="auth-email-input"
                />
              </div>
            )}
            {authMode === 'login' && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => { setShowAuth(false); setShowForgotPassword(true); }}
                  className="text-sm"
                  data-testid="forgot-password-link"
                >
                  {language === 'id' ? 'Lupa Password?' : 'Forgot Password?'}
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" data-testid="auth-submit-btn">
                {authMode === 'login' ? t(translate.login) : t(translate.register)}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                data-testid="auth-mode-toggle-btn"
              >
                {authMode === 'login' ? t(translate.register) : t(translate.login)}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
