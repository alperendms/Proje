import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronDown, TrendingUp, Users, Layers } from 'lucide-react';
import api from '../utils/api';
import QuoteCard from '../components/QuoteCard';
import { Button } from '../components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

const Home = ({ user }) => {
  const { t } = useTranslation();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const response = await api.getHomeData();
      setHomeData(response.data);
    } catch (error) {
      console.error('Error loading home data:', error);
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
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Discover Quotes</h3>
              <p className="text-gray-600">Browse thousands of inspiring quotes from various categories</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center" data-testid="step-2">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Share & Create</h3>
              <p className="text-gray-600">Share your favorite quotes or create your own to inspire others</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center" data-testid="step-3">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Connect</h3>
              <p className="text-gray-600">Follow users, save quotes, and build your collection</p>
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
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
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
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 text-center"
                  data-testid={`user-${trendUser.id}`}
                >
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-xl mx-auto mb-3">
                    {trendUser.username[0].toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{trendUser.username}</h3>
                  <p className="text-sm text-gray-500">{trendUser.followers_count} followers</p>
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
