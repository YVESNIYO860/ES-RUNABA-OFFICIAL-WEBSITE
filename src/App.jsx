import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy loading or direct imports for pages
import Home from './pages/Home';
import About from './pages/About';
import Academics from './pages/Academics';
import StudentLife from './pages/StudentLife';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import TeacherLogin from './pages/TeacherLogin';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import SearchResults from './pages/SearchResults';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import NewsAndNotices from './pages/NewsAndNotices';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import SchoolLoader from './components/SchoolLoader';
import CookieBanner from './components/CookieBanner';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return <SchoolLoader />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="academics" element={<Academics />} />
          <Route path="student-life" element={<StudentLife />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
          <Route path="staff-login" element={<TeacherLogin />} />
          <Route path="teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="student-dashboard" element={<StudentDashboard />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="super-admin" element={<SuperAdminDashboard />} />
          <Route path="news" element={<NewsAndNotices />} />
        </Route>
      </Routes>
      <CookieBanner />
    </Router>
  );
}

export default App;
