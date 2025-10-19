import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const response = await api.getBlogs({ published_only: true });
      setBlogs(response.data);
    } catch (error) {
      console.error('Error loading blogs:', error);
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
    <div className="min-h-screen py-8 pb-24 md:pb-8" data-testid="blogs-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900" data-testid="blogs-title">Blog</h1>

        {blogs.length === 0 ? (
          <div className="text-center py-20" data-testid="no-blogs">
            <p className="text-xl text-gray-400">No blog posts yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="blogs-grid">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                to={`/blogs/${blog.id}`}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                data-testid={`blog-card-${blog.id}`}
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
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(blog.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700" data-testid={`blog-title-${blog.id}`}>
                    {blog.title}
                  </h2>
                  {blog.excerpt && (
                    <p className="text-gray-600 line-clamp-3" data-testid={`blog-excerpt-${blog.id}`}>
                      {blog.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
