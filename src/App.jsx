import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth } from './firebase'; 

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Page Components (Public)
import Home from './pages/Home';
import About from './pages/About';
import Executive from './pages/Executive'; // New Import
import News from './pages/News';
import Players from './pages/Players'; 
import Fixtures from './pages/Fixtures';
import Results from './pages/Results';
import Table from './pages/Table';
import GalleryView from './pages/GalleryView';
import Contact from './pages/Contact';
import PlayerRegistration from './pages/PlayerRegistration';

// Admin Components
import Login from './pages/Login';
import Dashboard from './admin/Dashboard';

// A small helper component to handle Conditional Layouts
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  // Ensure the navbar/footer are hidden on admin and login pages
  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname === '/login';

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh' }}>
      {!isAdminPath && <Navbar />}
      <main style={{ minHeight: '80vh' }}>
        {children}
      </main>
      {!isAdminPath && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <LayoutWrapper>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/executive" element={<Executive />} /> {/* New Route */}
          <Route path="/news" element={<News />} />
          <Route path="/players" element={<Players />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/results" element={<Results />} />
          <Route path="/table" element={<Table />} />
          <Route path="/GalleryView" element={<GalleryView />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<PlayerRegistration />} />

          {/* AUTHENTICATION ROUTE */}
          <Route path="/login" element={<Login />} />

          {/* ADMIN DASHBOARD ROUTE */}
          <Route path="/admin/dashboard" element={<Dashboard />} />

          {/* CATCH-ALL REDIRECT */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;