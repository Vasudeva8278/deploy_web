import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles, requiredFeature }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/not-authorized" />;
  }

  if (requiredFeature && !user.features.includes(requiredFeature)) {
    return <Navigate to="/not-authorized" />;
  }

  return children;
};

export default PrivateRoute;
