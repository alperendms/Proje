import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Save, User, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const Settings = ({ user, setUser }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    bio: '',
    avatar: '',
    country: '',
    country_code: '',
    phone: '',
    phone_country_code: '',
    language: 'en',
    social_links: {
      twitter: '',
      instagram: '',
      website: ''
    }
  });

  // Popular countries with codes
  const countries = [
    { name: 'United States', code: 'US', phone: '+1' },
    { name: 'United Kingdom', code: 'GB', phone: '+44' },
    { name: 'Turkey', code: 'TR', phone: '+90' },
    { name: 'Germany', code: 'DE', phone: '+49' },
    { name: 'France', code: 'FR', phone: '+33' },
    { name: 'Spain', code: 'ES', phone: '+34' },
    { name: 'Italy', code: 'IT', phone: '+39' },
    { name: 'Canada', code: 'CA', phone: '+1' },
    { name: 'Australia', code: 'AU', phone: '+61' },
    { name: 'India', code: 'IN', phone: '+91' },
    { name: 'China', code: 'CN', phone: '+86' },
    { name: 'Japan', code: 'JP', phone: '+81' },
    { name: 'Brazil', code: 'BR', phone: '+55' },
    { name: 'Mexico', code: 'MX', phone: '+52' },
    { name: 'Russia', code: 'RU', phone: '+7' },
    { name: 'South Korea', code: 'KR', phone: '+82' },
    { name: 'Netherlands', code: 'NL', phone: '+31' },
    { name: 'Sweden', code: 'SE', phone: '+46' },
    { name: 'Poland', code: 'PL', phone: '+48' },
    { name: 'Portugal', code: 'PT', phone: '+351' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    loadLanguages();

    setFormData({
      username: user.username || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
      country: user.country || '',
      country_code: user.country_code || '',
      phone: user.phone || '',
      phone_country_code: user.phone_country_code || '',
      language: user.language || 'en',
      social_links: user.social_links || {
        twitter: '',
        instagram: '',
        website: ''
      }
    });
  }, [user, navigate]);

  const loadLanguages = async () => {
    try {
      const response = await api.getLanguages();
      setLanguages(response.data);
    } catch (error) {
      console.error('Failed to load languages:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSocialChange = (platform, value) => {
    setFormData({
      ...formData,
      social_links: {
        ...formData.social_links,
        [platform]: value
      }
    });
  };

  const handleCountryChange = (countryCode) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setFormData({
        ...formData,
        country: country.name,
        country_code: countryCode,
        phone_country_code: country.phone
      });
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const response = await api.uploadAvatar(file);
      setFormData({
        ...formData,
        avatar: response.data.avatar_url
      });
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate username
    if (!formData.username) {
      toast.error('Username is required');
      setLoading(false);
      return;
    }

    try {
      await api.updateUserSettings(formData);
      const response = await api.getMe();
      setUser(response.data);
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error(error.response?.data?.detail || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">User Settings</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Profile Photo</h2>
              
              <div className="flex items-center gap-4">
                {formData.avatar ? (
                  <div className="relative">
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: '' })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-3xl font-bold">
                    {formData.username[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
              
              <div>
                <Label htmlFor="username">Username (must start with @)</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="@username"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">This is your unique identifier</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                  />
                </div>

                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">This will be displayed on your profile</p>
              </div>
            </div>

            {/* Location & Language */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Location & Language</h2>
              
              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country_code} onValueChange={handleCountryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select 
                  value={formData.language} 
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.native_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.phone_country_code}
                    disabled
                    className="w-24"
                    placeholder="+1"
                  />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="123 456 7890"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Select country to set phone code</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Social Links</h2>
              
              <div>
                <Label htmlFor="twitter">X (Twitter)</Label>
                <Input
                  id="twitter"
                  value={formData.social_links.twitter}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  placeholder="https://x.com/username"
                />
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.social_links.instagram}
                  onChange={(e) => handleSocialChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.social_links.website}
                  onChange={(e) => handleSocialChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
