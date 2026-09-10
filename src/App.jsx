import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { ContentAnalytics } from './pages/ContentAnalytics';
import { AudienceAnalytics } from './pages/AudienceAnalytics';
import { RevenueAnalytics } from './pages/RevenueAnalytics';
import { SocialConnect } from './pages/SocialConnect';
import { Playground } from './pages/Playground';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="connect" element={<SocialConnect />} />
        <Route path="content" element={<ContentAnalytics />} />
        <Route path="audience" element={<AudienceAnalytics />} />
        <Route path="revenue" element={<RevenueAnalytics />} />
        <Route path="playground" element={<Playground />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
