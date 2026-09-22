import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import EditorPage from './pages/EditorPage';
import ArticlePage from './pages/ArticlePage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tag/:tag" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/editor/:slug" element={<EditorPage />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/profile/:username/favorites" element={<ProfilePage />} />
            </Routes>
          </main>
          <footer className="py-4 border-t border-slate-200 mt-8">
            <div className="container mx-auto text-center text-xs text-slate-400">
              <Link to="/" className="font-bold text-emerald-600 hover:underline mr-2">conduit</Link>
              An interactive learning project from <a href="https://thinkster.io" className="text-emerald-600 hover:underline">Thinkster</a>. Code & design licensed under MIT.
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
