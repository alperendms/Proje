import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import QuoteCard from '../components/QuoteCard';
import { Button } from '../components/ui/button';

const QuoteDetail = ({ user }) => {
  const { t } = useTranslation();
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuote();
  }, [quoteId]);

  const loadQuote = async () => {
    setLoading(true);
    try {
      const response = await api.getQuote(quoteId);
      setQuote(response.data);
    } catch (error) {
      console.error('Error loading quote:', error);
      toast.error('Quote not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;
    
    try {
      await api.deleteQuote(quoteId);
      toast.success('Quote deleted');
      navigate('/');
    } catch (error) {
      toast.error('Error deleting quote');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!quote) return null;

  const canDelete = user && (user.id === quote.user_id || user.is_admin);

  return (
    <div className="min-h-screen py-8" data-testid="quote-detail-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center"
            data-testid="back-btn"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {canDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              size="icon"
              data-testid="delete-quote-btn"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <QuoteCard quote={quote} user={user} />
      </div>
    </div>
  );
};

export default QuoteDetail;
