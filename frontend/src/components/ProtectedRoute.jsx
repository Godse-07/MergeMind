// ProtectedRoute.jsx
import { Navigate } from "react-router";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import Loader from "./Loader";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <Loader />;

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
