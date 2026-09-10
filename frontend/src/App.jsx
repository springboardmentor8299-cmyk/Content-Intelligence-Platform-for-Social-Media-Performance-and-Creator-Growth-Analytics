import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Integrations from "./pages/Integrations";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login and Register */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "creator",
                "agency",
                "marketing_team",
                "administrator",
              ]}
            >
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Integrations */}
        <Route
          path="/integrations"
          element={
            <ProtectedRoute
              allowedRoles={[
                "creator",
                "agency",
                "marketing_team",
                "administrator",
              ]}
            >
              <DashboardLayout>
                <Integrations />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;