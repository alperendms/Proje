import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import api from '../utils/api';
import QuoteCard from '../components/QuoteCard';

const Discover = ({ user }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('liked');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, [activeTab, user]);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'liked') {
        response = await api.getMostLiked();
      } else if (activeTab === 'saved') {
        response = await api.getMostSaved();
      } else {
        response = await api.getMostViewed();
      }
      setQuotes(response?.data || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8" data-testid="discover-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900" data-testid="discover-title">{t('discover')}</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white rounded-lg p-1 border border-gray-200" data-testid="discover-tabs">
            <TabsTrigger value="liked" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white" data-testid="tab-liked">
              {t('most_liked')}
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white" data-testid="tab-saved">
              {t('most_saved')}
            </TabsTrigger>
            <TabsTrigger value="viewed" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white" data-testid="tab-viewed">
              {t('most_viewed')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} data-testid={`tab-content-${activeTab}`}>
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-pulse text-xl text-gray-400">Loading...</div>
              </div>
            ) : quotes.length === 0 ? (
              <div className="text-center py-20" data-testid="no-quotes">
                <p className="text-xl text-gray-400">No quotes found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="quotes-grid">
                {quotes.map((quote) => (
                  <QuoteCard key={quote.id} quote={quote} user={user} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Discover;
