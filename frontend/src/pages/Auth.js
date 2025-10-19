import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGeolocation } from '../hooks/useGeolocation';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const countryCodes = [
  { code: '+1', country: 'US/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+90', country: 'Turkey' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+34', country: 'Spain' },
  { code: '+39', country: 'Italy' },
  { code: '+31', country: 'Netherlands' },
  { code: '+46', country: 'Sweden' },
  { code: '+47', country: 'Norway' },
  { code: '+45', country: 'Denmark' },
  { code: '+358', country: 'Finland' },
  { code: '+48', country: 'Poland' },
  { code: '+7', country: 'Russia' },
  { code: '+86', country: 'China' },
  { code: '+81', country: 'Japan' },
  { code: '+82', country: 'Korea' },
  { code: '+91', country: 'India' },
  { code: '+55', country: 'Brazil' },
  { code: '+52', country: 'Mexico' },
];

const Auth = ({ setUser }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { country } = useGeolocation();
  
  const [languages, setLanguages] = useState([]);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    country: country || 'US',
    country_code: '+1',
    language: 'en'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await api.getLanguages();
      setLanguages(response.data);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.login(loginData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      toast.success('Login successful');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.register(registerData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      toast.success('Registration successful');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100" data-testid="auth-page">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">QuoteVibe</h1>
          <p className="text-gray-600">Join our community</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2" data-testid="auth-tabs">
              <TabsTrigger value="login" data-testid="login-tab">{t('login')}</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">{t('register')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" data-testid="login-form">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">{t('email')}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    data-testid="login-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">{t('password')}</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    data-testid="login-password-input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800"
                  disabled={loading}
                  data-testid="login-submit-btn"
                >
                  {loading ? 'Loading...' : t('login')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" data-testid="register-form">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-username">{t('username')}</Label>
                  <Input
                    id="register-username"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                    data-testid="register-username-input"
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">{t('email')}</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    data-testid="register-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="register-password">{t('password')}</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    data-testid="register-password-input"
                  />
                </div>
                <div>
                  <Label htmlFor="register-fullname">{t('full_name')}</Label>
                  <Input
                    id="register-fullname"
                    value={registerData.full_name}
                    onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                    data-testid="register-fullname-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-language">Language</Label>
                  <Select
                    value={registerData.language}
                    onValueChange={(value) => setRegisterData({ ...registerData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.native_name} ({lang.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="register-country">Country</Label>
                  <Input
                    id="register-country"
                    value={registerData.country}
                    onChange={(e) => setRegisterData({ ...registerData, country: e.target.value })}
                    placeholder="US"
                  />
                </div>

                <div>
                  <Label htmlFor="register-phone">Phone (Optional)</Label>
                  <div className="flex gap-2">
                    <Select
                      value={registerData.country_code}
                      onValueChange={(value) => setRegisterData({ ...registerData, country_code: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((item) => (
                          <SelectItem key={item.code} value={item.code}>
                            {item.code} {item.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="Phone number"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      data-testid="register-phone-input"
                      className="flex-1"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800"
                  disabled={loading}
                  data-testid="register-submit-btn"
                >
                  {loading ? 'Loading...' : t('register')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
