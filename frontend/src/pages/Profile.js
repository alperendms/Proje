import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Heart, Bookmark, FileText, Twitter, Instagram, Facebook, Linkedin, Globe } from 'lucide-react';
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
  const [likedQuotes, setLikedQuotes] = useState([]);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quotes');

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const userResponse = await api.getUser(userId);
      setUser(userResponse.data);

      // Load user's quotes
      const quotesResponse = await api.getQuotes({ user_id: userId });
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

  const loadLikedQuotes = async () => {
    try {
      const response = await api.getMostLiked({ user_id: userId });
      setLikedQuotes(response.data);
    } catch (error) {
      console.error('Error loading liked quotes:', error);
    }
  };

  const loadSavedQuotes = async () => {
    if (currentUser && userId === currentUser.id) {
      try {
        const response = await api.getUserSaved();
        setSavedQuotes(response.data);
      } catch (error) {
        console.error('Error loading saved quotes:', error);
      }
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === 'likes' && likedQuotes.length === 0) {
      loadLikedQuotes();
    } else if (value === 'saved' && savedQuotes.length === 0) {
      loadSavedQuotes();
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

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'website': return <Globe className="h-4 w-4" />;
      default: return null;
    }
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
        <div className="text-center">
          <p className="text-xl text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && userId === currentUser.id;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-3xl font-bold">
                  {user.username[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.full_name || user.username}</h1>
                  <p className="text-gray-500">@{user.username}</p>
                  {user.bio && (
                    <p className="mt-2 text-gray-700">{user.bio}</p>
                  )}
                </div>

                {!isOwnProfile && currentUser && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleFollow}
                      variant={following ? 'outline' : 'default'}
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      {following ? 'Unfollow' : 'Follow'}
                    </Button>
                    <Button
                      onClick={handleMessage}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.quotes_count}</div>
                  <div className="text-sm text-gray-500">Quotes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.followers_count}</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.following_count}</div>
                  <div className="text-sm text-gray-500">Following</div>
                </div>
                {user.score > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{user.score}</div>
                    <div className="text-sm text-gray-500">Score</div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {user.social_links && Object.keys(user.social_links).length > 0 && (
                <div className="flex gap-3 mt-4">
                  {Object.entries(user.social_links).map(([platform, url]) => {
                    if (!url) return null;
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {getSocialIcon(platform)}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg">
            <TabsTrigger value="quotes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Quotes
            </TabsTrigger>
            <TabsTrigger value="likes" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Likes
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Saved
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="quotes" className="space-y-4">
            {quotes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No quotes yet</p>
              </div>
            ) : (
              quotes.map((quote) => (
                <QuoteCard key={quote.id} quote={quote} currentUser={currentUser} />
              ))
            )}
          </TabsContent>

          <TabsContent value="likes" className="space-y-4">
            {likedQuotes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No liked quotes yet</p>
              </div>
            ) : (
              likedQuotes.map((quote) => (
                <QuoteCard key={quote.id} quote={quote} currentUser={currentUser} />
              ))
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="saved" className="space-y-4">
              {savedQuotes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                  <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No saved quotes yet</p>
                </div>
              ) : (
                savedQuotes.map((quote) => (
                  <QuoteCard key={quote.id} quote={quote} currentUser={currentUser} />
                ))
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
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
