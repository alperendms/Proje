import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Bell, User, LogOut, Settings, Plus } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Navbar = ({ user, setUser }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'tr' : 'en';
    i18n.changeLanguage(newLang);
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
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="text-xs font-medium"
              data-testid="language-toggle"
            >
              {i18n.language === 'en' ? 'TR' : 'EN'}
            </Button>

            {user ? (
              <>
                {/* Create Quote Button */}
                <Link to="/create" data-testid="create-quote-link">
                  <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                    <Plus className="h-4 w-4 mr-1" />
                    {t('create_quote')}
                  </Button>
                </Link>

                {/* Messages */}
                <Link to="/messages" data-testid="messages-link">
                  <Button variant="ghost" size="icon">
                    <MessageSquare className="h-5 w-5" />
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
                    {user.is_admin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')} data-testid="admin-menu-item">
                        <Settings className="h-4 w-4 mr-2" />
                        {t('admin_panel')}
                      </DropdownMenuItem>
                    )}
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
