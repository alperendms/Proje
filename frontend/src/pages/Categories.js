import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import api from '../utils/api';

const Categories = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
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
    <div className="min-h-screen py-8" data-testid="categories-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900" data-testid="categories-title">{t('categories')}</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="categories-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/explore?category=${category.id}`}
              className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all"
              data-testid={`category-card-${category.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl mb-2">{category.icon || '💬'}</div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid={`category-name-${category.id}`}>
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
              )}
              <p className="text-sm text-gray-500" data-testid={`category-count-${category.id}`}>
                {category.quotes_count} {t('quotes')}
              </p>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20" data-testid="no-categories">
            <p className="text-xl text-gray-400">No categories found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
