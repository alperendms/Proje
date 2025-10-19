import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../utils/api';
import QuoteCard from '../components/QuoteCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useLanguage } from '../contexts/LanguageContext';

const Explore = ({ user }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [quotes, setQuotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadQuotes();
  }, [searchParams, language]);

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const params = { language };
      if (searchParams.get('search')) params.search = searchParams.get('search');
      if (searchParams.get('category')) params.category_id = searchParams.get('category');
      
      const response = await api.getQuotes(params);
      setQuotes(response.data);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    setSearchParams(params);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    const params = {};
    if (search) params.search = search;
    if (value) params.category = value;
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen py-8" data-testid="explore-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900" data-testid="explore-title">{t('explore')}</h1>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8" data-testid="search-filters">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t('search_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-48" data-testid="category-select">
                <SelectValue placeholder={t('category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} data-testid={`category-option-${cat.id}`}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} data-testid="search-btn">{t('search_placeholder')}</Button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-pulse text-xl text-gray-400">Loading...</div>
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-20" data-testid="no-results">
            <p className="text-xl text-gray-400">No quotes found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="quotes-grid">
            {quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
