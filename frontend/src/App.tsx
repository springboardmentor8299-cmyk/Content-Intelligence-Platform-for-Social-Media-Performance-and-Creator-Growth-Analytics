import { Routes, Route, Navigate } from 'react-router';

// Public pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import AuthCallback from '@/pages/AuthCallback';

// Role-specific auth pages
import CreatorLogin from '@/pages/auth/CreatorLogin';
import CreatorSignup from '@/pages/auth/CreatorSignup';
import AgencyLogin from '@/pages/auth/AgencyLogin';
import AgencySignup from '@/pages/auth/AgencySignup';
import MarketingLogin from '@/pages/auth/MarketingLogin';
import MarketingSignup from '@/pages/auth/MarketingSignup';
import AdminLogin from '@/pages/auth/AdminLogin';

// Dashboard pages
import Dashboard from '@/pages/Dashboard';
import Content from '@/pages/Content';
import Audience from '@/pages/Audience';
import Growth from '@/pages/Growth';
import Revenue from '@/pages/Revenue';
import Connections from '@/pages/Connections';
import Notifications from '@/pages/Notifications';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Creator Portal */}
      <Route path="/creator/login" element={<CreatorLogin />} />
      <Route path="/creator/signup" element={<CreatorSignup />} />

      {/* Agency Portal */}
      <Route path="/agency/login" element={<AgencyLogin />} />
      <Route path="/agency/signup" element={<AgencySignup />} />

      {/* Marketing Portal */}
      <Route path="/marketing/login" element={<MarketingLogin />} />
      <Route path="/marketing/signup" element={<MarketingSignup />} />

      {/* Admin Portal */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/content" element={<Content />} />
      <Route path="/audience" element={<Audience />} />
      <Route path="/growth" element={<Growth />} />
      <Route path="/revenue" element={<Revenue />} />
      <Route path="/connections" element={<Connections />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
