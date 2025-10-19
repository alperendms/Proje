import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Users, MessageSquare, UserPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import api from '../utils/api';

const Ranking = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('daily');
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, [period]);

  const loadRankings = async () => {
    setLoading(true);
    try {
      const response = await api.getRanking(period);
      setRankings(response.data);
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" data-testid="ranking-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900" data-testid="ranking-title">{t('ranking')}</h1>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40" data-testid="period-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily" data-testid="period-daily">{t('daily')}</SelectItem>
              <SelectItem value="monthly" data-testid="period-monthly">{t('monthly')}</SelectItem>
              <SelectItem value="yearly" data-testid="period-yearly">{t('yearly')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4" data-testid="rankings-list">
          {rankings.map((ranking, index) => (
            <div
              key={ranking.user.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              data-testid={`ranking-item-${index}`}
            >
              <div className="flex items-center gap-6">
                {/* Rank */}
                <div className="flex-shrink-0">
                  {index < 3 ? (
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <Trophy className="h-8 w-8" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <Link to={`/profile/${ranking.user.id}`} className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-lg">
                    {ranking.user.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate" data-testid={`ranking-username-${index}`}>
                      {ranking.user.username}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span data-testid={`ranking-quotes-${index}`}>{ranking.quotes_count} {t('quotes')}</span>
                      <span data-testid={`ranking-followers-${index}`}>{ranking.user.followers_count} {t('followers')}</span>
                    </div>
                  </div>
                </Link>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-8 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900" data-testid={`ranking-views-${index}`}>{ranking.total_views}</div>
                    <div className="text-gray-500">{t('views')}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900" data-testid={`ranking-likes-${index}`}>{ranking.total_likes}</div>
                    <div className="text-gray-500">{t('likes')}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900" data-testid={`ranking-saves-${index}`}>{ranking.total_saves}</div>
                    <div className="text-gray-500">{t('saves')}</div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900" data-testid={`ranking-score-${index}`}>{ranking.score}</div>
                  <div className="text-xs text-gray-500">{t('score')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rankings.length === 0 && (
          <div className="text-center py-20" data-testid="no-rankings">
            <p className="text-xl text-gray-400">No rankings available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;
