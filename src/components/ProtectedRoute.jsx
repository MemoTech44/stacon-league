// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';

export const ProtectedRoute = ({ children }) => {
  if (!auth.currentUser) {
    return <Navigate to="/login" />;
  }
  return children;
};