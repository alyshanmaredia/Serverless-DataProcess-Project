import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRouteAgent = ({ element }) => {
	const { isAuthenticated, userRole } = useAuth();

	return isAuthenticated && userRole === 'agent' ? element : <Navigate to='/' />;
};

export default ProtectedRouteAgent;
