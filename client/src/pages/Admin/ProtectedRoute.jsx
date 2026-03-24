import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isAdmin, user, loading }) => {
  if (loading) return null; // Or a loading spinner

  if (!user) {
    return <Navigate to="/signin" />;
  }

  if (isAdmin && user.role !== 'admin') {
    return <Navigate to="/signin" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;  