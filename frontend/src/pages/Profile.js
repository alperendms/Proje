import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import QuoteCard from '../components/QuoteCard';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Profile = ({ user: currentUser }) => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [userResponse, quotesResponse] = await Promise.all([
        api.getUser(userId),
        api.getQuotes({ user_id: userId })
      ]);
      setUser(userResponse.data);
      setQuotes(quotesResponse.data);

      if (currentUser && userId !== currentUser.id) {
        const followResponse = await api.getFollowStatus(userId);
        setFollowing(followResponse.data.following);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please login to follow users');
      return;
    }
    try {
      const response = await api.followUser(userId);
      setFollowing(response.data.following);
      setUser(prev => ({
        ...prev,
        followers_count: prev.followers_count + (response.data.following ? 1 : -1)
      }));
    } catch (error) {
      toast.error('Error following user');
    }
  };

  const handleMessage = () => {
    if (!currentUser) {
      toast.error('Please login to send messages');
      return;
    }
    navigate(`/messages/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">User not found</div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen py-8" data-testid="profile-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8" data-testid="profile-header">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-4xl" data-testid="profile-avatar">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="profile-username">{user.username}</h1>
              {user.full_name && <p className="text-lg text-gray-600 mb-2" data-testid="profile-fullname">{user.full_name}</p>}
              {user.bio && <p className="text-gray-600 mb-4" data-testid="profile-bio">{user.bio}</p>}
              <div className="flex items-center gap-6 text-sm">
                <div data-testid="profile-followers">
                  <span className="font-semibold text-gray-900">{user.followers_count}</span>
                  <span className="text-gray-600 ml-1">{t('followers')}</span>
                </div>
                <div data-testid="profile-following">
                  <span className="font-semibold text-gray-900">{user.following_count}</span>
                  <span className="text-gray-600 ml-1">{t('following')}</span>
                </div>
                <div data-testid="profile-quotes">
                  <span className="font-semibold text-gray-900">{user.quotes_count}</span>
                  <span className="text-gray-600 ml-1">{t('quotes')}</span>
                </div>
              </div>
            </div>
            {!isOwnProfile && currentUser && (
              <div className="flex gap-2">
                <Button
                  onClick={handleFollow}
                  variant={following ? 'outline' : 'default'}
                  data-testid="follow-btn"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {following ? 'Unfollow' : 'Follow'}
                </Button>
                <Button onClick={handleMessage} variant="outline" data-testid="message-btn">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('send_message')}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* User Quotes */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('quotes')}</h2>
          {quotes.length === 0 ? (
            <div className="text-center py-20" data-testid="no-quotes">
              <p className="text-xl text-gray-400">No quotes yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="profile-quotes-grid">
              {quotes.map((quote) => (
                <QuoteCard key={quote.id} quote={quote} user={currentUser} showUser={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
