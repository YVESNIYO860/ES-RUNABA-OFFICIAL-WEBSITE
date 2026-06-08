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
import ELearning from './pages/ELearning';
import TeacherLogin from './pages/TeacherLogin';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import SearchResults from './pages/SearchResults';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TranslationProvider } from './context/TranslationContext';
import SchoolLoader from './components/SchoolLoader';

function App() {
  return (
    <TranslationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TranslationProvider>
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
          <Route path="e-learning" element={<ELearning />} />
          <Route path="staff-login" element={<TeacherLogin />} />
          <Route path="teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="student-dashboard" element={<StudentDashboard />} />
          <Route path="search" element={<SearchResults />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
