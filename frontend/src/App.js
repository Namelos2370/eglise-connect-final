import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext, useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaNewspaper, FaCalendarAlt, FaUsers, FaComments, FaHandHoldingHeart, 
  FaUserCircle, FaEnvelope, FaBell, FaSignInAlt, FaUserPlus, FaPrayingHands, 
  FaYoutube, FaBars, FaTimes, FaShieldAlt
} from 'react-icons/fa';

// --- IMPORTS DES PAGES ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; 
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import EventsPage from './pages/EventsPage';
import EditEventPage from './pages/EditEventPage';
import CreateEventPage from './pages/CreateEventPage';
import ChatPage from './pages/ChatPage';
import DonationPage from './pages/DonationPage';
import FeedPage from './pages/FeedPage';
import MembersPage from './pages/MembersPage';
import PublicProfilePage from './pages/PublicProfilePage';
import InboxPage from './pages/InboxPage';
import PrivateChatPage from './pages/PrivateChatPage';
import NotificationsPage from './pages/NotificationsPage';
import PrayerWallPage from './pages/PrayerWallPage';
import SermonsPage from './pages/SermonsPage';
import PrivacyPage from './pages/PrivacyPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FeedbackPage from './pages/FeedbackPage';

// --- ADMIN ---
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import UsersManager from './pages/admin/UsersManager';
import ContentManager from './pages/admin/ContentManager';
import FinanceManager from './pages/admin/FinanceManager';
import NewsletterManager from './pages/admin/NewsletterManager';
import FeedbackManager from './pages/admin/FeedbackManager';

// --- COMPOSANTS ---
import Footer from './components/Footer';
import Spinner from './components/Spinner';
import FeedbackButton from './components/FeedbackButton'; // <--- IMPORT DU BOUTON

import './styles/App.css'; 

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const NotificationBadgeLink = () => {
    const { user } = useContext(AuthContext);
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!user) return;
        const fetchCount = async () => {
            try { const res = await fetch('http://localhost:3002/notifications/unread-count', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            if (res.ok) setCount((await res.json()).count); } catch(e) {}
        };
        fetchCount(); const interval = setInterval(fetchCount, 10000); return () => clearInterval(interval);
    }, [user]);
    if (!user) return null;
    return ( <Link to="/notifications" style={{ position:'relative' }}><FaBell style={{marginRight:5}}/>Alertes {count > 0 && (<span style={{ position:'absolute', top:-5, right:-5, background:'red', color:'white', borderRadius:'50%', width:'18px', height:'18px', fontSize:'0.7em', display:'flex', alignItems:'center', justifyContent:'center' }}>{count}</span>)}</Link> );
};

const NavigationBar = () => {
  const { user } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', color:'inherit' }}>
            <img src="/logo.png" alt="Logo" /> <span>Église Connect</span>
        </Link>
      </div>
      
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      <div className={`nav-links ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
        <Link to="/feed"><FaNewspaper style={{marginRight:5}}/> Fil</Link>
        <Link to="/events"><FaCalendarAlt style={{marginRight:5}}/> Events</Link>
        <Link to="/prayers"><FaPrayingHands style={{marginRight:5}}/> Prières</Link>
        <Link to="/chat"><FaComments style={{marginRight:5}}/> Groupe</Link>
        <Link to="/donations"><FaHandHoldingHeart style={{marginRight:5}}/> Dons</Link>

        {user ? (
            <>
                <Link to="/sermons"><FaYoutube style={{marginRight:5}}/> Médias</Link>
                <Link to="/members"><FaUsers style={{marginRight:5}}/> Communauté</Link>
                <Link to="/inbox"><FaEnvelope style={{marginRight:5}}/> Messagerie</Link>
                
                {user.role === 'admin' && (
                    <Link to="/admin" style={{ color:'#dc2626', fontWeight:'bold', border:'1px solid #dc2626', borderRadius:'20px', padding:'5px 15px' }}>
                        <FaShieldAlt style={{marginRight:5}}/> Admin
                    </Link>
                )}

                <NotificationBadgeLink />
                <Link to="/profile" className="profile-link"><FaUserCircle style={{marginRight:5}}/> Profil</Link>
            </>
        ) : (
            <>
                <div style={{ width:1, height:25, background:'#ddd', margin:'0 5px' }} className="desktop-only"></div>
                <Link to="/login" style={{ color:'var(--primary)' }}><FaSignInAlt style={{marginRight:5}}/> Connexion</Link>
                <Link to="/signup"><button style={{ padding:'8px 15px', fontSize:'0.85em' }}><FaUserPlus style={{marginRight:5}}/> Rejoindre</button></Link>
            </>
        )}
      </div>
    </nav>
  );
};

const MainLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <NavigationBar />}
      
      <div className={isAdminRoute ? '' : 'container'}>
        <Routes>
            <Route path="/" element={<HomePage />} /> 
            
            {/* ROUTES PUBLIQUES */}
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/donations" element={<DonationPage />} />
            <Route path="/prayers" element={<PrayerWallPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            
            {/* AUTH */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* ROUTES PROTÉGÉES */}
            <Route path="/sermons" element={<ProtectedRoute><SermonsPage /></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><MembersPage /></ProtectedRoute>} />
            <Route path="/user/:userId" element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>} />
            <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
            <Route path="/private-chat/:conversationId" element={<ProtectedRoute><PrivateChatPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/create-event" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
            <Route path="/edit-event/:id" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            
            {/* ADMIN */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UsersManager />} />
                <Route path="content" element={<ContentManager />} />
                <Route path="finances" element={<FinanceManager />} />
                <Route path="newsletter" element={<NewsletterManager />} />
                <Route path="feedback" element={<FeedbackManager />} />
            </Route>
        </Routes>
      </div>

      {/* BOUTON FEEDBACK (Uniquement sur le site public/membre, pas dans l'admin) */}
      {!isAdminRoute && <FeedbackButton />}

      {!isAdminRoute && <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <MainLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;