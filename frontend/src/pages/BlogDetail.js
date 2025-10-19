import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';

const BlogDetail = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlog();
  }, [blogId]);

  const loadBlog = async () => {
    setLoading(true);
    try {
      const response = await api.getBlog(blogId);
      setBlog(response.data);
    } catch (error) {
      console.error('Error loading blog:', error);
      toast.error('Blog not found');
      navigate('/blogs');
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

  if (!blog) return null;

  return (
    <div className="min-h-screen py-8 pb-24 md:pb-8" data-testid="blog-detail-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/blogs')}
          className="mb-8 flex items-center"
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blogs
        </Button>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {blog.featured_image && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-full object-cover"
                data-testid="blog-featured-image"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Calendar className="h-4 w-4" />
              <span data-testid="blog-date">{format(new Date(blog.created_at), 'MMMM d, yyyy')}</span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-6" data-testid="blog-title">
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed" data-testid="blog-excerpt">
                {blog.excerpt}
              </p>
            )}

            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }}
              data-testid="blog-content"
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
