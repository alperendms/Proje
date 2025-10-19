import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n/config';
import './App.css';
import { Toaster } from 'sonner';
import api from './utils/api';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Categories from './pages/Categories';
import Discover from './pages/Discover';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import CreateQuote from './pages/CreateQuote';
import Messages from './pages/Messages';
import AdminPanel from './pages/AdminPanel';
import QuoteDetail from './pages/QuoteDetail';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

function App() {
  const { i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.getMe();
          setUser(response.data);
          i18n.changeLanguage(response.data.language || 'en');
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [i18n]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-pulse text-2xl font-light text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <Navbar user={user} setUser={setUser} />
        <div className="pt-16 pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/explore" element={<Explore user={user} />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/discover" element={<Discover user={user} />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/profile/:userId" element={<Profile user={user} />} />
            <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth setUser={setUser} />} />
            <Route path="/create" element={user ? <CreateQuote user={user} /> : <Navigate to="/auth" />} />
            <Route path="/messages" element={user ? <Messages user={user} /> : <Navigate to="/auth" />} />
            <Route path="/messages/:userId" element={user ? <Messages user={user} /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={user?.is_admin ? <AdminPanel /> : <Navigate to="/" />} />
            <Route path="/quote/:quoteId" element={<QuoteDetail user={user} />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:blogId" element={<BlogDetail />} />
          </Routes>
        </div>
        <Footer />
        <BottomNav />
        <Toaster position="top-right" richColors />
      </div>
    </BrowserRouter>
  );
}

export default App;
