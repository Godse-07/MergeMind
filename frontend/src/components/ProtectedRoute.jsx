// ProtectedRoute.jsx
import { Navigate } from "react-router";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
