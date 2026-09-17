// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';
// import Sidebar from './components/common/Sidebar';
// import Topbar from './components/common/Topbar';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import ContentAnalytics from './pages/ContentAnalytics';
// import AudienceAnalytics from './pages/AudienceAnalytics';
// import RevenueAnalytics from './pages/RevenueAnalytics';
// import AgencyWorkspace from './pages/AgencyWorkspace';
// import AdminConsole from './pages/AdminConsole';

// const AppLayout = ({ children }) => {
//   return (
//     <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex">
//       <Sidebar />
//       <div className="flex-1 min-w-0">
//         <Topbar />
//         <main className="ml-64 p-8">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           {/* Public Authentication Route */}
//           <Route path="/login" element={<Login />} />

//           {/* Protected Routes for All Authenticated Users */}
//           <Route element={<ProtectedRoute allowedRoles={['Creator', 'Agency', 'Marketing Team', 'Administrator']} />}>
//             <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
//             <Route path="/content" element={<AppLayout><ContentAnalytics /></AppLayout>} />
//             <Route path="/audience" element={<AppLayout><AudienceAnalytics /></AppLayout>} />
//             <Route path="/revenue" element={<AppLayout><RevenueAnalytics /></AppLayout>} />
//           </Route>

//           {/* Agency & Admin Restricted Route */}
//           <Route element={<ProtectedRoute allowedRoles={['Agency', 'Administrator']} />}>
//             <Route path="/agency" element={<AppLayout><AgencyWorkspace /></AppLayout>} />
//           </Route>

//           {/* Administrator Only Restricted Route */}
//           <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
//             <Route path="/admin" element={<AppLayout><AdminConsole /></AppLayout>} />
//           </Route>

//           {/* Default Redirect */}
//           <Route path="*" element={<Navigate to="/dashboard" replace />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/common/Sidebar';
import Topbar from './components/common/Topbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContentAnalytics from './pages/ContentAnalytics';
import AudienceAnalytics from './pages/AudienceAnalytics';
import RevenueAnalytics from './pages/RevenueAnalytics';
import AgencyWorkspace from './pages/AgencyWorkspace';
import AdminConsole from './pages/AdminConsole';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute allowedRoles={['Creator', 'Agency', 'Marketing Team', 'Administrator']} />}>
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/content" element={<AppLayout><ContentAnalytics /></AppLayout>} />
            <Route path="/audience" element={<AppLayout><AudienceAnalytics /></AppLayout>} />
            <Route path="/revenue" element={<AppLayout><RevenueAnalytics /></AppLayout>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Agency', 'Administrator']} />}>
            <Route path="/agency" element={<AppLayout><AgencyWorkspace /></AppLayout>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
            <Route path="/admin" element={<AppLayout><AdminConsole /></AppLayout>} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
