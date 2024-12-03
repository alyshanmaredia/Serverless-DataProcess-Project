import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRouteAgent = ({ element }) => {
	const { isAuthenticated } = useAuth();

	return isAuthenticated ? element : <Navigate to='/login' />;
};

export default ProtectedRouteAgent;