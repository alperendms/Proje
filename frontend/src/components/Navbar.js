import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Bell, User, LogOut, Settings, Plus, FileEdit, Globe } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { api } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = ({ user, setUser }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [languages, setLanguages] = useState([]);
  const { language, changeLanguage } = useLanguage();

  useEffect(() => {
    if (user) {
      fetchUnreadNotifications();
    }
    loadLanguages();
  }, [user]);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await api.getNotifications();
      const unread = response.data.filter(n => !n.read).length;
      setUnreadNotifications(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const loadLanguages = async () => {
    try {
      const response = await api.getLanguages();
      setLanguages(response.data);
    } catch (error) {
      console.error('Failed to load languages:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const handleLanguageChange = async (newLang) => {
    await changeLanguage(newLang);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-gray-900">Quote</span>
              <span className="text-gray-500">Vibe</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" data-testid="nav-home">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                {t('home')}
              </Button>
            </Link>
            <Link to="/explore" data-testid="nav-explore">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                {t('explore')}
              </Button>
            </Link>
            <Link to="/categories" data-testid="nav-categories">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                {t('categories')}
              </Button>
            </Link>
            <Link to="/discover" data-testid="nav-discover">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                {t('discover')}
              </Button>
            </Link>
            <Link to="/ranking" data-testid="nav-ranking">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                {t('ranking')}
              </Button>
            </Link>
            <Link to="/blogs" data-testid="nav-blogs">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                Blogs
              </Button>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32" data-testid="language-selector">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.native_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {user ? (
              <>
                {/* Create Quote Button */}
                <Link to="/create" data-testid="create-quote-link">
                  <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                    <Plus className="h-4 w-4 mr-1" />
                    + Create
                  </Button>
                </Link>

                {/* Messages */}
                <Link to="/messages" data-testid="messages-link">
                  <Button variant="ghost" size="icon">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Notifications */}
                <Link to="/notifications" data-testid="notifications-link">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="user-menu-trigger">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)} data-testid="profile-menu-item">
                      <User className="h-4 w-4 mr-2" />
                      {t('profile')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/create')} data-testid="create-quote-menu-item">
                      <Plus className="h-4 w-4 mr-2" />
                      + Quote
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} data-testid="settings-menu-item">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    {user.is_admin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin')} data-testid="admin-menu-item">
                          <FileEdit className="h-4 w-4 mr-2" />
                          {t('admin_panel')}
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="logout-menu-item">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth" data-testid="login-link">
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                  {t('login')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
