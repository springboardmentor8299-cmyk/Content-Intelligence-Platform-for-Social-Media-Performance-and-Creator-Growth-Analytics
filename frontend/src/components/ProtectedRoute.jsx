import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("user_role");

  // User is not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specific roles are provided
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(userRole)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;