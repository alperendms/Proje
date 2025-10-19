import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const CreateQuote = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    content: '',
    author: '',
    category_id: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error('Quote content is required');
      return;
    }

    setLoading(true);
    try {
      const data = {
        content: formData.content.trim(),
        author: formData.author.trim() || null,
        category_id: formData.category_id || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : []
      };
      await api.createQuote(data);
      toast.success('Quote created successfully');
      navigate(`/profile/${user.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error creating quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12" data-testid="create-quote-page">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900" data-testid="create-quote-title">{t('create_quote')}</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="create-quote-form">
            <div>
              <Label htmlFor="content">{t('quote_content')} *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                required
                className="mt-2"
                placeholder="Enter your quote here..."
                data-testid="quote-content-input"
              />
            </div>

            <div>
              <Label htmlFor="author">{t('author')}</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="e.g., Albert Einstein"
                className="mt-2"
                data-testid="quote-author-input"
              />
            </div>

            <div>
              <Label htmlFor="category">{t('category')}</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger className="mt-2" data-testid="quote-category-select">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} data-testid={`category-option-${cat.id}`}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">{t('tags')}</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="motivation, life, success (comma separated)"
                className="mt-2"
                data-testid="quote-tags-input"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 bg-gray-900 hover:bg-gray-800"
                disabled={loading}
                data-testid="create-quote-submit"
              >
                {loading ? 'Creating...' : t('create_quote')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                data-testid="create-quote-cancel"
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuote;
