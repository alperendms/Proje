import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Trash2, Plus, Users, FileText, Layers, MessageSquare, Settings as SettingsIcon, Globe } from 'lucide-react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const AdminPanel = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [backgrounds, setBackgrounds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [users, setUsers] = useState([]);
  const [systemSettings, setSystemSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [smtpForm, setSmtpForm] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_from: ''
  });
  const [bgForm, setBgForm] = useState({ type: 'post', file: null });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '' });
  const [blogForm, setBlogForm] = useState({ title: '', content: '', excerpt: '', featured_image: '', published: true });
  const [editingBlog, setEditingBlog] = useState(null);
  
  const [languageForm, setLanguageForm] = useState({ code: '', name: '', native_name: '', enabled: true });
  const [editingLanguage, setEditingLanguage] = useState(null);
  
  // Translation Management
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [currentTranslatingLang, setCurrentTranslatingLang] = useState(null);
  const [translationKeys, setTranslationKeys] = useState({});
  const [translations, setTranslations] = useState({});
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  
  const [translationForm, setTranslationForm] = useState({ language: '', name: '', description: '' });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  
  const [systemForm, setSystemForm] = useState({
    recaptcha_enabled: false,
    recaptcha_site_key: '',
    recaptcha_secret_key: '',
    sms_enabled: false,
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
    email_enabled: false,
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_from: '',
    homepage_quotes_count: 5,
    homepage_categories_count: 5,
    homepage_users_count: 5,
    homepage_blogs_count: 4
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, settingsRes, backgroundsRes, categoriesRes, blogsRes, languagesRes, systemRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminSettings(),
        api.getBackgrounds(),
        api.getCategories(),
        api.getBlogs({ published_only: false }),
        api.getLanguages(),
        api.getSystemSettings()
      ]);
      setStats(statsRes.data);
      setSettings(settingsRes.data);
      setBackgrounds(backgroundsRes.data);
      setCategories(categoriesRes.data);
      setBlogs(blogsRes.data);
      setLanguages(languagesRes.data);
      setSystemSettings(systemRes.data);
      
      setSmtpForm({
        smtp_host: settingsRes.data.smtp_host || '',
        smtp_port: settingsRes.data.smtp_port || 587,
        smtp_user: settingsRes.data.smtp_user || '',
        smtp_password: settingsRes.data.smtp_password || '',
        smtp_from: settingsRes.data.smtp_from || ''
      });
      
      setSystemForm({
        recaptcha_enabled: systemRes.data.recaptcha_enabled || false,
        recaptcha_site_key: systemRes.data.recaptcha_site_key || '',
        recaptcha_secret_key: systemRes.data.recaptcha_secret_key || '',
        sms_enabled: systemRes.data.sms_enabled || false,
        twilio_account_sid: systemRes.data.twilio_account_sid || '',
        twilio_auth_token: systemRes.data.twilio_auth_token || '',
        twilio_phone_number: systemRes.data.twilio_phone_number || '',
        email_enabled: systemRes.data.email_enabled || false,
        smtp_host: systemRes.data.smtp_host || '',
        smtp_port: systemRes.data.smtp_port || 587,
        smtp_user: systemRes.data.smtp_user || '',
        smtp_password: systemRes.data.smtp_password || '',
        smtp_from: systemRes.data.smtp_from || '',
        homepage_quotes_count: systemRes.data.homepage_quotes_count || 5,
        homepage_categories_count: systemRes.data.homepage_categories_count || 5,
        homepage_users_count: systemRes.data.homepage_users_count || 5,
        homepage_blogs_count: systemRes.data.homepage_blogs_count || 4
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Error loading admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.updateAdminSettings(smtpForm);
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Error saving settings');
    }
  };

  const handleAddBackground = async (e) => {
    e.preventDefault();
    if (!bgForm.url) {
      toast.error('URL is required');
      return;
    }
    try {
      await api.addBackground(bgForm);
      toast.success('Background added');
      setBgForm({ type: 'post', url: '' });
      const res = await api.getBackgrounds();
      setBackgrounds(res.data);
    } catch (error) {
      toast.error('Error adding background');
    }
  };

  const handleDeleteBackground = async (bgId) => {
    if (!window.confirm('Delete this background?')) return;
    try {
      await api.deleteBackground(bgId);
      toast.success('Background deleted');
      setBackgrounds(backgrounds.filter(bg => bg.id !== bgId));
    } catch (error) {
      toast.error('Error deleting background');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) {
      toast.error('Category name is required');
      return;
    }
    try {
      await api.createCategory(categoryForm);
      toast.success('Category added');
      setCategoryForm({ name: '', description: '', icon: '' });
      const res = await api.getCategories();
      setCategories(res.data);
    } catch (error) {
      toast.error('Error adding category');
    }
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.content) {
      toast.error('Title and content are required');
      return;
    }
    try {
      if (editingBlog) {
        await api.updateBlog(editingBlog.id, blogForm);
        toast.success('Blog updated');
        setEditingBlog(null);
      } else {
        await api.createBlog(blogForm);
        toast.success('Blog created');
      }
      setBlogForm({ title: '', content: '', excerpt: '', featured_image: '', published: true });
      const res = await api.getBlogs({ published_only: false });
      setBlogs(res.data);
    } catch (error) {
      toast.error('Error saving blog');
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || '',
      featured_image: blog.featured_image || '',
      published: blog.published
    });
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Delete this blog?')) return;
    try {
      await api.deleteBlog(blogId);
      toast.success('Blog deleted');
      setBlogs(blogs.filter(b => b.id !== blogId));
    } catch (error) {
      toast.error('Error deleting blog');
    }
  };

  // Language Management Functions
  const handleAddLanguage = async (e) => {
    e.preventDefault();
    if (!languageForm.code || !languageForm.name || !languageForm.native_name) {
      toast.error('All fields are required');
      return;
    }
    try {
      if (editingLanguage) {
        await api.updateLanguage(editingLanguage.id, languageForm);
        toast.success('Language updated');
        setEditingLanguage(null);
      } else {
        await api.createLanguage(languageForm);
        toast.success('Language added');
      }
      setLanguageForm({ code: '', name: '', native_name: '', enabled: true });
      const res = await api.getLanguages();
      setLanguages(res.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error saving language');
    }
  };

  const handleEditLanguage = (lang) => {
    setEditingLanguage(lang);
    setLanguageForm({
      code: lang.code,
      name: lang.name,
      native_name: lang.native_name,
      enabled: lang.enabled
    });
  };

  const handleDeleteLanguage = async (langId) => {
    if (!window.confirm('Delete this language?')) return;
    try {
      await api.deleteLanguage(langId);
      toast.success('Language deleted');
      setLanguages(languages.filter(l => l.id !== langId));
    } catch (error) {
      toast.error('Error deleting language');
    }
  };

  // Translation Management Functions
  const handleOpenTranslateModal = async (language) => {
    setCurrentTranslatingLang(language);
    setLoadingTranslations(true);
    setShowTranslateModal(true);
    
    try {
      // Load translation keys structure
      const keysRes = await api.getTranslationKeys();
      setTranslationKeys(keysRes.data);
      
      // Load existing translations for this language
      const transRes = await api.getSiteTranslations(language.code);
      setTranslations(transRes.data.translations || {});
    } catch (error) {
      console.error('Error loading translations:', error);
      toast.error('Error loading translations');
    } finally {
      setLoadingTranslations(false);
    }
  };

  const handleSaveTranslations = async () => {
    if (!currentTranslatingLang) return;
    
    try {
      await api.updateSiteTranslations(currentTranslatingLang.code, translations);
      toast.success(`Translations saved for ${currentTranslatingLang.native_name}`);
      setShowTranslateModal(false);
    } catch (error) {
      console.error('Error saving translations:', error);
      toast.error('Error saving translations');
    }
  };

  const handleTranslationChange = (key, value) => {
    setTranslations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // System Settings Functions
  const handleSaveSystemSettings = async (e) => {
    e.preventDefault();
    try {
      await api.updateSystemSettings(systemForm);
      toast.success('System settings saved');
    } catch (error) {
      toast.error('Error saving system settings');
    }
  };

  // User Management Functions
  const loadUsers = async () => {
    try {
      const res = await api.getAllUsers();
      setUsers(res.data);
    } catch (error) {
      toast.error('Error loading users');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This will also delete all their data.')) return;
    try {
      await api.deleteUser(userId);
      toast.success('User deleted');
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  // Category Translation Functions
  const handleOpenTranslation = (category) => {
    setSelectedCategory(category);
    setTranslationForm({ language: '', name: '', description: '' });
    setShowTranslationModal(true);
  };

  const handleSaveTranslation = async (e) => {
    e.preventDefault();
    if (!translationForm.language || !translationForm.name) {
      toast.error('Language and name are required');
      return;
    }
    try {
      await api.updateCategoryTranslation(selectedCategory.id, {
        language: translationForm.language,
        name: translationForm.name,
        description: translationForm.description
      });
      toast.success('Translation saved');
      setShowTranslationModal(false);
      const res = await api.getCategories();
      setCategories(res.data);
    } catch (error) {
      toast.error('Error saving translation');
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
    <div className="min-h-screen py-8" data-testid="admin-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900" data-testid="admin-title">{t('admin_panel')}</h1>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="stats-cards">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stats-users">{stats?.users_count || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Quotes</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stats-quotes">{stats?.quotes_count || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Categories</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stats-categories">{stats?.categories_count || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Messages</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stats-messages">{stats?.messages_count || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Tabs defaultValue="smtp" className="space-y-6">
            <TabsList data-testid="admin-tabs" className="flex-wrap">
              <TabsTrigger value="smtp" data-testid="tab-smtp">SMTP</TabsTrigger>
              <TabsTrigger value="system" data-testid="tab-system">System Settings</TabsTrigger>
              <TabsTrigger value="languages" data-testid="tab-languages">Languages</TabsTrigger>
              <TabsTrigger value="backgrounds" data-testid="tab-backgrounds">Backgrounds</TabsTrigger>
              <TabsTrigger value="categories" data-testid="tab-categories">Categories</TabsTrigger>
              <TabsTrigger value="blogs" data-testid="tab-blogs">Blogs</TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            </TabsList>

            {/* SMTP Settings */}
            <TabsContent value="smtp" data-testid="smtp-content">
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={smtpForm.smtp_host}
                    onChange={(e) => setSmtpForm({ ...smtpForm, smtp_host: e.target.value })}
                    placeholder="smtp.example.com"
                    data-testid="smtp-host-input"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={smtpForm.smtp_port}
                    onChange={(e) => setSmtpForm({ ...smtpForm, smtp_port: parseInt(e.target.value) })}
                    data-testid="smtp-port-input"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_user">SMTP User</Label>
                  <Input
                    id="smtp_user"
                    value={smtpForm.smtp_user}
                    onChange={(e) => setSmtpForm({ ...smtpForm, smtp_user: e.target.value })}
                    data-testid="smtp-user-input"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={smtpForm.smtp_password}
                    onChange={(e) => setSmtpForm({ ...smtpForm, smtp_password: e.target.value })}
                    data-testid="smtp-password-input"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_from">From Email</Label>
                  <Input
                    id="smtp_from"
                    type="email"
                    value={smtpForm.smtp_from}
                    onChange={(e) => setSmtpForm({ ...smtpForm, smtp_from: e.target.value })}
                    placeholder="noreply@quotevibe.com"
                    data-testid="smtp-from-input"
                  />
                </div>
                <Button type="submit" className="bg-gray-900 hover:bg-gray-800" data-testid="save-smtp-btn">
                  Save Settings
                </Button>
              </form>
            </TabsContent>

            {/* Backgrounds */}
            <TabsContent value="backgrounds" data-testid="backgrounds-content">
              <div className="space-y-6">
                <form onSubmit={handleAddBackground} className="space-y-4">
                  <div>
                    <Label htmlFor="bg_type">Type</Label>
                    <Select value={bgForm.type} onValueChange={(value) => setBgForm({ ...bgForm, type: value })}>
                      <SelectTrigger data-testid="bg-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="post">Post (Square)</SelectItem>
                        <SelectItem value="story">Story (Vertical)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bg_file">Upload Image</Label>
                    <Input
                      id="bg_file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBgForm({ ...bgForm, file: e.target.files[0] })}
                      data-testid="bg-file-input"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload an image from your device</p>
                  </div>
                  <Button type="submit" className="bg-gray-900 hover:bg-gray-800" data-testid="add-bg-btn" disabled={!bgForm.file}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Background
                  </Button>
                </form>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="backgrounds-grid">
                  {backgrounds.map((bg) => (
                    <div key={bg.id} className="relative group" data-testid={`bg-item-${bg.id}`}>
                      <img src={bg.url} alt="Background" className="w-full h-32 object-cover rounded-lg" />
                      <div className="absolute top-2 right-2">
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDeleteBackground(bg.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`delete-bg-${bg.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="text-xs bg-black/50 text-white px-2 py-1 rounded">{bg.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Categories */}
            <TabsContent value="categories" data-testid="categories-content">
              <div className="space-y-6">
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div>
                    <Label htmlFor="cat_name">Category Name</Label>
                    <Input
                      id="cat_name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="e.g., Motivation"
                      data-testid="cat-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cat_desc">Description</Label>
                    <Input
                      id="cat_desc"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="Category description"
                      data-testid="cat-desc-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cat_icon">Icon (emoji)</Label>
                    <Input
                      id="cat_icon"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                      placeholder="💡"
                      maxLength={2}
                      data-testid="cat-icon-input"
                    />
                  </div>
                  <Button type="submit" className="bg-gray-900 hover:bg-gray-800" data-testid="add-cat-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </form>

                <div className="space-y-2" data-testid="categories-list">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid={`cat-item-${cat.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{cat.icon || '📁'}</div>
                        <div>
                          <div className="font-semibold text-gray-900">{cat.name}</div>
                          {cat.description && <div className="text-sm text-gray-600">{cat.description}</div>}
                          {cat.translations && Object.keys(cat.translations).length > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              Translations: {Object.keys(cat.translations).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-500">{cat.quotes_count} quotes</div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenTranslation(cat)}
                        >
                          <Globe className="h-4 w-4 mr-1" />
                          Translate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Blogs */}
            <TabsContent value="blogs" data-testid="blogs-content">
              <div className="space-y-6">
                <form onSubmit={handleSaveBlog} className="space-y-4">
                  <div>
                    <Label htmlFor="blog_title">Title</Label>
                    <Input
                      id="blog_title"
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      placeholder="Blog title"
                      data-testid="blog-title-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="blog_excerpt">Excerpt</Label>
                    <Input
                      id="blog_excerpt"
                      value={blogForm.excerpt}
                      onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                      placeholder="Short description"
                      data-testid="blog-excerpt-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="blog_content">Content</Label>
                    <Textarea
                      id="blog_content"
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      placeholder="Blog content (Markdown supported)"
                      className="min-h-[200px] resize-vertical"
                      data-testid="blog-content-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="blog_image">Featured Image URL</Label>
                    <Input
                      id="blog_image"
                      value={blogForm.featured_image}
                      onChange={(e) => setBlogForm({ ...blogForm, featured_image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      data-testid="blog-image-input"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="blog_published"
                      checked={blogForm.published}
                      onChange={(e) => setBlogForm({ ...blogForm, published: e.target.checked })}
                      data-testid="blog-published-checkbox"
                    />
                    <Label htmlFor="blog_published">Published</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-gray-900 hover:bg-gray-800" data-testid="save-blog-btn">
                      <Plus className="h-4 w-4 mr-2" />
                      {editingBlog ? 'Update Blog' : 'Create Blog'}
                    </Button>
                    {editingBlog && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEditingBlog(null);
                          setBlogForm({ title: '', content: '', excerpt: '', featured_image: '', published: true });
                        }}
                        data-testid="cancel-edit-btn"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>

                <div className="space-y-4" data-testid="blogs-list">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="p-4 bg-gray-50 rounded-lg" data-testid={`blog-item-${blog.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{blog.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded ${blog.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {blog.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          {blog.excerpt && <p className="text-sm text-gray-600 mb-2">{blog.excerpt}</p>}
                          <div className="text-xs text-gray-500">
                            Created: {new Date(blog.created_at).toLocaleDateString()}
                            {blog.updated_at !== blog.created_at && (
                              <span> • Updated: {new Date(blog.updated_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditBlog(blog)}
                            data-testid={`edit-blog-${blog.id}`}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteBlog(blog.id)}
                            data-testid={`delete-blog-${blog.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" data-testid="system-content">
              <form onSubmit={handleSaveSystemSettings} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Homepage Content Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Homepage Quotes Count</Label>
                      <Input 
                        type="number" 
                        value={systemForm.homepage_quotes_count}
                        onChange={(e) => setSystemForm({...systemForm, homepage_quotes_count: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Homepage Categories Count</Label>
                      <Input 
                        type="number" 
                        value={systemForm.homepage_categories_count}
                        onChange={(e) => setSystemForm({...systemForm, homepage_categories_count: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Homepage Users Count</Label>
                      <Input 
                        type="number" 
                        value={systemForm.homepage_users_count}
                        onChange={(e) => setSystemForm({...systemForm, homepage_users_count: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Homepage Blogs Count</Label>
                      <Input 
                        type="number" 
                        value={systemForm.homepage_blogs_count}
                        onChange={(e) => setSystemForm({...systemForm, homepage_blogs_count: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Google reCAPTCHA Settings
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={systemForm.recaptcha_enabled}
                        onCheckedChange={(checked) => setSystemForm({...systemForm, recaptcha_enabled: checked})}
                      />
                      <Label>Enable reCAPTCHA</Label>
                    </div>
                    <Input 
                      placeholder="Site Key" 
                      value={systemForm.recaptcha_site_key}
                      onChange={(e) => setSystemForm({...systemForm, recaptcha_site_key: e.target.value})}
                    />
                    <Input 
                      placeholder="Secret Key" 
                      type="password"
                      value={systemForm.recaptcha_secret_key}
                      onChange={(e) => setSystemForm({...systemForm, recaptcha_secret_key: e.target.value})}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Twilio SMS Settings
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={systemForm.sms_enabled}
                        onCheckedChange={(checked) => setSystemForm({...systemForm, sms_enabled: checked})}
                      />
                      <Label>Enable SMS</Label>
                    </div>
                    <Input 
                      placeholder="Account SID" 
                      value={systemForm.twilio_account_sid}
                      onChange={(e) => setSystemForm({...systemForm, twilio_account_sid: e.target.value})}
                    />
                    <Input 
                      placeholder="Auth Token" 
                      type="password"
                      value={systemForm.twilio_auth_token}
                      onChange={(e) => setSystemForm({...systemForm, twilio_auth_token: e.target.value})}
                    />
                    <Input 
                      placeholder="Phone Number (e.g., +1234567890)" 
                      value={systemForm.twilio_phone_number}
                      onChange={(e) => setSystemForm({...systemForm, twilio_phone_number: e.target.value})}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Email/SMTP Settings
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={systemForm.email_enabled}
                        onCheckedChange={(checked) => setSystemForm({...systemForm, email_enabled: checked})}
                      />
                      <Label>Enable Email</Label>
                    </div>
                    <Input 
                      placeholder="SMTP Host" 
                      value={systemForm.smtp_host}
                      onChange={(e) => setSystemForm({...systemForm, smtp_host: e.target.value})}
                    />
                    <Input 
                      placeholder="SMTP Port" 
                      type="number"
                      value={systemForm.smtp_port}
                      onChange={(e) => setSystemForm({...systemForm, smtp_port: parseInt(e.target.value)})}
                    />
                    <Input 
                      placeholder="SMTP User" 
                      value={systemForm.smtp_user}
                      onChange={(e) => setSystemForm({...systemForm, smtp_user: e.target.value})}
                    />
                    <Input 
                      placeholder="SMTP Password" 
                      type="password"
                      value={systemForm.smtp_password}
                      onChange={(e) => setSystemForm({...systemForm, smtp_password: e.target.value})}
                    />
                    <Input 
                      placeholder="From Email" 
                      value={systemForm.smtp_from}
                      onChange={(e) => setSystemForm({...systemForm, smtp_from: e.target.value})}
                    />
                  </div>
                </div>

                <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Save System Settings
                </Button>
              </form>
            </TabsContent>

            {/* Languages */}
            <TabsContent value="languages" data-testid="languages-content">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Language Management</h3>
                  <p className="text-sm text-gray-600 mb-4">Manage supported languages for the platform</p>
                </div>

                <form onSubmit={handleAddLanguage} className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold">{editingLanguage ? 'Edit Language' : 'Add New Language'}</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Language Code</Label>
                      <Input
                        placeholder="en"
                        value={languageForm.code}
                        onChange={(e) => setLanguageForm({...languageForm, code: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>English Name</Label>
                      <Input
                        placeholder="English"
                        value={languageForm.name}
                        onChange={(e) => setLanguageForm({...languageForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Native Name</Label>
                      <Input
                        placeholder="English"
                        value={languageForm.native_name}
                        onChange={(e) => setLanguageForm({...languageForm, native_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={languageForm.enabled}
                      onCheckedChange={(checked) => setLanguageForm({...languageForm, enabled: checked})}
                    />
                    <Label>Enabled</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
                      <Plus className="h-4 w-4 mr-2" />
                      {editingLanguage ? 'Update' : 'Add'} Language
                    </Button>
                    {editingLanguage && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setEditingLanguage(null);
                          setLanguageForm({ code: '', name: '', native_name: '', enabled: true });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>

                <div className="space-y-2">
                  <h4 className="font-semibold">Existing Languages ({languages.length})</h4>
                  <div className="grid gap-2">
                    {languages.map((lang) => (
                      <div key={lang.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-lg">{lang.code}</span>
                          <div>
                            <p className="font-medium">{lang.native_name}</p>
                            <p className="text-sm text-gray-500">{lang.name}</p>
                          </div>
                          {lang.enabled ? (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Enabled</span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">Disabled</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditLanguage(lang)}>
                            Edit Info
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleOpenTranslateModal(lang)}
                          >
                            <Globe className="h-4 w-4 mr-1" />
                            Translate
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteLanguage(lang.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Users */}
            <TabsContent value="users" data-testid="users-content">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">User Management</h3>
                    <p className="text-sm text-gray-600">Manage users, scores, and permissions</p>
                  </div>
                  <Button onClick={loadUsers}>
                    <Users className="h-4 w-4 mr-2" />
                    Load Users
                  </Button>
                </div>

                {users.length > 0 && (
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex gap-4 mt-1 text-xs text-gray-500">
                            <span>Quotes: {user.quotes_count}</span>
                            <span>Followers: {user.followers_count}</span>
                            <span>Score: {user.score}</span>
                            {user.is_admin && <span className="text-blue-600 font-semibold">ADMIN</span>}
                          </div>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)} disabled={user.is_admin}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Translation Modal */}
          {showTranslationModal && selectedCategory && (
            <Dialog open={showTranslationModal} onOpenChange={setShowTranslationModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Translate Category: {selectedCategory.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveTranslation} className="space-y-4 mt-4">
                  <div>
                    <Label>Language Code</Label>
                    <Select
                      value={translationForm.language}
                      onValueChange={(value) => setTranslationForm({...translationForm, language: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.native_name} ({lang.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Translated Name</Label>
                    <Input
                      value={translationForm.name}
                      onChange={(e) => setTranslationForm({...translationForm, name: e.target.value})}
                      placeholder="Enter translated name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Translated Description</Label>
                    <Textarea
                      value={translationForm.description}
                      onChange={(e) => setTranslationForm({...translationForm, description: e.target.value})}
                      placeholder="Enter translated description"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
                      Save Translation
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowTranslationModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* Translation Modal */}
          <Dialog open={showTranslateModal} onOpenChange={setShowTranslateModal}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Translate Site Content - {currentTranslatingLang?.native_name} ({currentTranslatingLang?.code})
                </DialogTitle>
              </DialogHeader>
              
              {loadingTranslations ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading translations...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Left side shows the English original text. Enter translations on the right.
                      Leave blank to use the English version.
                    </p>
                  </div>

                  {Object.entries(translationKeys).map(([section, keys]) => (
                    <div key={section} className="space-y-3">
                      <h3 className="font-semibold text-lg capitalize border-b pb-2">
                        {section.replace('_', ' ')}
                      </h3>
                      
                      <div className="grid gap-3">
                        {keys.map((key) => (
                          <div key={key} className="grid grid-cols-2 gap-3 items-start">
                            <div className="bg-gray-50 p-3 rounded border">
                              <p className="text-xs text-gray-500 mb-1 font-mono">{key}</p>
                              <p className="text-sm">
                                {translations.en?.[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                            </div>
                            
                            <div>
                              <Input
                                placeholder={`Translation in ${currentTranslatingLang?.native_name}`}
                                value={translations[key] || ''}
                                onChange={(e) => handleTranslationChange(key, e.target.value)}
                                className="w-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Category Translations Section */}
                  {categories.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg border-b pb-2">Category Names</h3>
                      <p className="text-sm text-gray-600">Translate category names for this language</p>
                      
                      <div className="grid gap-3">
                        {categories.map((category) => (
                          <div key={category.id} className="grid grid-cols-2 gap-3 items-start">
                            <div className="bg-gray-50 p-3 rounded border">
                              <p className="text-xs text-gray-500 mb-1">Original</p>
                              <p className="text-sm font-medium">{category.name}</p>
                              {category.description && (
                                <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Input
                                placeholder={`${category.name} in ${currentTranslatingLang?.native_name}`}
                                value={translations[`category_${category.id}_name`] || ''}
                                onChange={(e) => handleTranslationChange(`category_${category.id}_name`, e.target.value)}
                              />
                              <Input
                                placeholder="Description translation"
                                value={translations[`category_${category.id}_desc`] || ''}
                                onChange={(e) => handleTranslationChange(`category_${category.id}_desc`, e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowTranslateModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveTranslations} className="bg-blue-600 hover:bg-blue-700">
                      Save Translations
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
