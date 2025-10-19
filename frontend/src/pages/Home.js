import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronDown, TrendingUp, Users, Layers, UserPlus, MessageSquare, Twitter, Instagram, Globe } from 'lucide-react';
import api from '../utils/api';
import QuoteCard from '../components/QuoteCard';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

const Home = ({ user }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, [language]);

  const loadHomeData = async () => {
    try {
      const response = await api.getHomeData({ language });
      setHomeData(response.data);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get translated category name
  const getCategoryName = (category) => {
    if (language === 'en' || !category.translations || !category.translations[language]) {
      return category.name;
    }
    return category.translations[language].name || category.name;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight" data-testid="hero-title">
            {t('app_name')}
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto" data-testid="hero-subtitle">
            {t('start_sharing')}
          </p>
          {user ? (
            <Link to="/create" data-testid="hero-create-btn">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6">
                {t('create_quote')}
              </Button>
            </Link>
          ) : (
            <Link to="/auth" data-testid="hero-auth-btn">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6">
                {t('start_sharing')}
              </Button>
            </Link>
          )}
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pb-8 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white/50" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* How It Works */}
        <section className="space-y-8" data-testid="how-it-works-section">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900">
            {t('how_it_works')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center" data-testid="step-1">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Layers className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('discover_quotes')}</h3>
              <p className="text-gray-600">{t('discover_quotes_desc')}</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center" data-testid="step-2">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('share_create')}</h3>
              <p className="text-gray-600">{t('share_create_desc')}</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center" data-testid="step-3">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('connect')}</h3>
              <p className="text-gray-600">{t('connect_desc')}</p>
            </div>
          </div>
        </section>

        {/* Trending Quotes */}
        {homeData?.trending_quotes && homeData.trending_quotes.length > 0 && (
          <section className="space-y-6" data-testid="trending-quotes-section">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">{t('trending_quotes')}</h2>
              <Link to="/discover" data-testid="view-more-quotes">
                <Button variant="outline">View More</Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {homeData.trending_quotes.map((quote) => (
                <QuoteCard key={quote.id} quote={quote} user={user} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Categories */}
        {homeData?.trending_categories && homeData.trending_categories.length > 0 && (
          <section className="space-y-6" data-testid="trending-categories-section">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">{t('trending_categories')}</h2>
              <Link to="/categories" data-testid="view-all-categories">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {homeData.trending_categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/explore?category=${category.id}`}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 text-center"
                  data-testid={`category-${category.id}`}
                >
                  <div className="text-3xl mb-2">{category.icon || '💬'}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{getCategoryName(category)}</h3>
                  <p className="text-sm text-gray-500">{category.quotes_count} quotes</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trending Users */}
        {homeData?.trending_users && homeData.trending_users.length > 0 && (
          <section className="space-y-6" data-testid="trending-users-section">
            <h2 className="text-3xl font-bold text-gray-900">{t('trending_users')}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {homeData.trending_users.map((trendUser) => (
                <Link
                  key={trendUser.id}
                  to={`/profile/${trendUser.id}`}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200"
                  data-testid={`user-${trendUser.id}`}
                >
                  <div className="flex flex-col items-center">
                    {trendUser.avatar ? (
                      <img
                        src={trendUser.avatar}
                        alt={trendUser.username}
                        className="w-16 h-16 rounded-full object-cover mb-3"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-medium text-xl mb-3">
                        {trendUser.username[0].toUpperCase()}
                      </div>
                    )}
                    
                    <div className="text-center mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {trendUser.full_name || trendUser.username}
                      </h3>
                      <p className="text-sm text-gray-500">{trendUser.username}</p>
                    </div>
                    
                    {/* Social Links */}
                    {trendUser.social_links && Object.keys(trendUser.social_links).length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {trendUser.social_links.twitter && (
                          <a href={trendUser.social_links.twitter} target="_blank" rel="noopener noreferrer" 
                             onClick={(e) => e.stopPropagation()}
                             className="text-gray-600 hover:text-blue-500">
                            <Twitter className="h-4 w-4" />
                          </a>
                        )}
                        {trendUser.social_links.instagram && (
                          <a href={trendUser.social_links.instagram} target="_blank" rel="noopener noreferrer"
                             onClick={(e) => e.stopPropagation()}
                             className="text-gray-600 hover:text-pink-500">
                            <Instagram className="h-4 w-4" />
                          </a>
                        )}
                        {trendUser.social_links.website && (
                          <a href={trendUser.social_links.website} target="_blank" rel="noopener noreferrer"
                             onClick={(e) => e.stopPropagation()}
                             className="text-gray-600 hover:text-green-500">
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{trendUser.followers_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{trendUser.quotes_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <UserPlus className="h-4 w-4" />
                        <span>{trendUser.following_count}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent Blogs */}
        {homeData?.recent_blogs && homeData.recent_blogs.length > 0 && (
          <section className="space-y-6" data-testid="recent-blogs-section">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Latest from Blog</h2>
              <Link to="/blogs" data-testid="view-all-blogs">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {homeData.recent_blogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blogs/${blog.id}`}
                  className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200"
                  data-testid={`blog-${blog.id}`}
                >
                  {blog.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700">
                      {blog.title}
                    </h3>
                    {blog.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2">{blog.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="space-y-6 max-w-3xl mx-auto" data-testid="faq-section">
          <h2 className="text-3xl font-bold text-center text-gray-900">{t('faq')}</h2>
          <Accordion type="single" collapsible className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <AccordionItem value="item-1" data-testid="faq-item-1">
              <AccordionTrigger className="px-6">What is QuoteVibe?</AccordionTrigger>
              <AccordionContent className="px-6 text-gray-600">
                QuoteVibe is a free platform where you can discover, share, and create inspiring quotes. 
                Connect with others who share your interests and build your personal collection.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" data-testid="faq-item-2">
              <AccordionTrigger className="px-6">How do I create a quote?</AccordionTrigger>
              <AccordionContent className="px-6 text-gray-600">
                Simply sign up or log in, click on the "Create Quote" button, and start sharing your thoughts. 
                You can add categories, tags, and author information to your quotes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" data-testid="faq-item-3">
              <AccordionTrigger className="px-6">Is QuoteVibe free?</AccordionTrigger>
              <AccordionContent className="px-6 text-gray-600">
                Yes! QuoteVibe is completely free to use. You can create an account, share quotes, 
                follow users, and access all features without any charges.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" data-testid="faq-item-4">
              <AccordionTrigger className="px-6">Can I download quotes as images?</AccordionTrigger>
              <AccordionContent className="px-6 text-gray-600">
                Absolutely! You can download any quote as an image in two formats: Story (vertical) or 
                Post (square). Choose from various background images to create beautiful quote graphics.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
};

export default Home;
