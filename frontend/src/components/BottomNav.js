import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Search, Layers, TrendingUp, Trophy } from 'lucide-react';

const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden" data-testid="bottom-nav">
      <div className="grid grid-cols-5 h-16">
        {/* Explore */}
        <Link
          to="/explore"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/explore') ? 'text-gray-900' : 'text-gray-500'
          }`}
          data-testid="bottom-nav-explore"
        >
          <Search className="h-5 w-5" />
          <span className="text-xs">{t('explore')}</span>
        </Link>

        {/* Categories */}
        <Link
          to="/categories"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/categories') ? 'text-gray-900' : 'text-gray-500'
          }`}
          data-testid="bottom-nav-categories"
        >
          <Layers className="h-5 w-5" />
          <span className="text-xs">{t('categories')}</span>
        </Link>

        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center ${
            isActive('/') ? 'text-gray-900' : 'text-gray-500'
          }`}
          data-testid="bottom-nav-home"
        >
          <div className="-mt-6 bg-gray-900 rounded-full p-3 shadow-lg">
            <Home className="h-6 w-6 text-white" />
          </div>
        </Link>

        {/* Discover */}
        <Link
          to="/discover"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/discover') ? 'text-gray-900' : 'text-gray-500'
          }`}
          data-testid="bottom-nav-discover"
        >
          <TrendingUp className="h-5 w-5" />
          <span className="text-xs">{t('discover')}</span>
        </Link>

        {/* Ranking */}
        <Link
          to="/ranking"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/ranking') ? 'text-gray-900' : 'text-gray-500'
          }`}
          data-testid="bottom-nav-ranking"
        >
          <Trophy className="h-5 w-5" />
          <span className="text-xs">{t('ranking')}</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
