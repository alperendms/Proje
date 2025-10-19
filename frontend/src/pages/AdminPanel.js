import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Trash2, Plus, Users, FileText, Layers, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const AdminPanel = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [backgrounds, setBackgrounds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [smtpForm, setSmtpForm] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_from: ''
  });
  const [bgForm, setBgForm] = useState({ type: 'post', url: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '' });
  const [blogForm, setBlogForm] = useState({ title: '', content: '', excerpt: '', featured_image: '', published: true });
  const [editingBlog, setEditingBlog] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, settingsRes, backgroundsRes, categoriesRes, blogsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminSettings(),
        api.getBackgrounds(),
        api.getCategories(),
        api.getBlogs({ published_only: false })
      ]);
      setStats(statsRes.data);
      setSettings(settingsRes.data);
      setBackgrounds(backgroundsRes.data);
      setCategories(categoriesRes.data);
      setBlogs(blogsRes.data);
      
      setSmtpForm({
        smtp_host: settingsRes.data.smtp_host || '',
        smtp_port: settingsRes.data.smtp_port || 587,
        smtp_user: settingsRes.data.smtp_user || '',
        smtp_password: settingsRes.data.smtp_password || '',
        smtp_from: settingsRes.data.smtp_from || ''
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
            <TabsList data-testid="admin-tabs">
              <TabsTrigger value="smtp" data-testid="tab-smtp">SMTP Settings</TabsTrigger>
              <TabsTrigger value="backgrounds" data-testid="tab-backgrounds">Backgrounds</TabsTrigger>
              <TabsTrigger value="categories" data-testid="tab-categories">Categories</TabsTrigger>
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
                    <Label htmlFor="bg_url">Image URL</Label>
                    <Input
                      id="bg_url"
                      value={bgForm.url}
                      onChange={(e) => setBgForm({ ...bgForm, url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      data-testid="bg-url-input"
                    />
                  </div>
                  <Button type="submit" className="bg-gray-900 hover:bg-gray-800" data-testid="add-bg-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Background
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
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{cat.quotes_count} quotes</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
