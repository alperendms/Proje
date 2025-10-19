import { Heart, Bookmark, Copy, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import html2canvas from 'html2canvas';

const QuoteCard = ({ quote, user, showUser = true }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(quote.likes_count || 0);
  const [savesCount, setSavesCount] = useState(quote.saves_count || 0);
  const [quoteUser, setQuoteUser] = useState(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [backgrounds, setBackgrounds] = useState({ story: [], post: [] });
  const [selectedBg, setSelectedBg] = useState(null);
  const [downloadFormat, setDownloadFormat] = useState('post');

  useEffect(() => {
    if (user) {
      loadStatus();
    }
    if (showUser) {
      loadUser();
    }
  }, [quote.id, user]);

  const loadStatus = async () => {
    try {
      const response = await api.getQuoteStatus(quote.id);
      setLiked(response.data.liked);
      setSaved(response.data.saved);
    } catch (error) {
      console.error('Error loading status:', error);
    }
  };

  const loadUser = async () => {
    try {
      const response = await api.getUser(quote.user_id);
      setQuoteUser(response.data);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to like quotes');
      return;
    }
    try {
      const response = await api.likeQuote(quote.id);
      setLiked(response.data.liked);
      setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      toast.error('Error liking quote');
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to save quotes');
      return;
    }
    try {
      const response = await api.saveQuote(quote.id);
      setSaved(response.data.saved);
      setSavesCount(prev => response.data.saved ? prev + 1 : prev - 1);
      toast.success(response.data.saved ? 'Quote saved' : 'Quote unsaved');
    } catch (error) {
      toast.error('Error saving quote');
    }
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    const text = `"${quote.content}"${quote.author ? ` - ${quote.author}` : ''}`;
    navigator.clipboard.writeText(text);
    toast.success('Quote copied to clipboard');
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const bgResponse = await api.getBackgrounds();
      const bgs = bgResponse.data;
      setBackgrounds({
        story: bgs.filter(bg => bg.type === 'story'),
        post: bgs.filter(bg => bg.type === 'post')
      });
      setDownloadOpen(true);
    } catch (error) {
      toast.error('Error loading backgrounds');
    }
  };

  const generateImage = async () => {
    if (!selectedBg) {
      toast.error('Please select a background');
      return;
    }

    const element = document.getElementById('download-preview');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });

      const link = document.createElement('a');
      link.download = `quotevibe-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Image downloaded');
      setDownloadOpen(false);
    } catch (error) {
      toast.error('Error generating image');
    }
  };

  return (
    <>
      <div
        className="quote-card bg-white rounded-2xl p-6 shadow-sm hover:shadow-md cursor-pointer border border-gray-100"
        onClick={() => navigate(`/quote/${quote.id}`)}
        data-testid={`quote-card-${quote.id}`}
      >
        {showUser && quoteUser && (
          <div className="flex items-center mb-4">
            <div
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${quoteUser.id}`);
              }}
              data-testid={`quote-user-avatar-${quote.id}`}
            >
              {quoteUser.username[0].toUpperCase()}
            </div>
            <div className="ml-3">
              <div
                className="font-medium text-sm text-gray-900 cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${quoteUser.id}`);
                }}
                data-testid={`quote-username-${quote.id}`}
              >
                {quoteUser.username}
              </div>
            </div>
          </div>
        )}

        <p className="text-lg text-gray-800 leading-relaxed mb-2" data-testid={`quote-content-${quote.id}`}>
          "{quote.content}"
        </p>

        {quote.author && (
          <p className="text-sm text-gray-500 mb-4" data-testid={`quote-author-${quote.id}`}>— {quote.author}</p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-500"
              data-testid={`quote-like-btn-${quote.id}`}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-sm">{likesCount}</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-500"
              data-testid={`quote-save-btn-${quote.id}`}
            >
              <Bookmark className={`h-5 w-5 ${saved ? 'fill-blue-500 text-blue-500' : ''}`} />
              <span className="text-sm">{savesCount}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8"
              data-testid={`quote-copy-btn-${quote.id}`}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="h-8 w-8"
              data-testid={`quote-download-btn-${quote.id}`}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
        <DialogContent className="max-w-2xl" data-testid="download-dialog">
          <DialogHeader>
            <DialogTitle>Download Quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button
                variant={downloadFormat === 'post' ? 'default' : 'outline'}
                onClick={() => setDownloadFormat('post')}
                data-testid="format-post-btn"
              >
                Post (Square)
              </Button>
              <Button
                variant={downloadFormat === 'story' ? 'default' : 'outline'}
                onClick={() => setDownloadFormat('story')}
                data-testid="format-story-btn"
              >
                Story (Vertical)
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 max-h-64 overflow-y-auto">
              {backgrounds[downloadFormat].map((bg) => (
                <div
                  key={bg.id}
                  className={`cursor-pointer border-2 rounded-lg overflow-hidden ${
                    selectedBg?.id === bg.id ? 'border-gray-900' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedBg(bg)}
                  data-testid={`background-${bg.id}`}
                >
                  <img src={bg.url} alt="Background" className="w-full h-24 object-cover" />
                </div>
              ))}
            </div>

            {selectedBg && (
              <div id="download-preview" className="relative mx-auto" style={{
                width: downloadFormat === 'story' ? '400px' : '600px',
                height: downloadFormat === 'story' ? '700px' : '600px'
              }}>
                <img src={selectedBg.url} alt="Background" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="text-center text-white">
                    <p className="text-2xl font-medium mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                      "{quote.content}"
                    </p>
                    {quote.author && (
                      <p className="text-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>— {quote.author}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Button onClick={generateImage} className="w-full" data-testid="generate-image-btn">
              Download Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuoteCard;
