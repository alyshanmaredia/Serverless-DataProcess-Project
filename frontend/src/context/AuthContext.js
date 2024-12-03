import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userRole, setUserRole] = useState('guest');

	useEffect(() => {
		const token = Cookies.get("jwtToken");
    if (token) {
			const decoded = jwtDecode(token);
			if(decoded["custom:usertype"] && decoded["custom:usertype"] === 'RegisteredUsers') {
				setUserRole('user');
			} else {
				setUserRole('agent');
			}
      setIsAuthenticated(true);
    }
  }, []);

	const login = (token) => {
		setIsAuthenticated(true);
		Cookies.set("jwtToken", token, { expires: 20, secure: true });
		const decoded = jwtDecode(token);
		if(decoded["custom:usertype"] && decoded["custom:usertype"] === 'RegisteredUsers') {
			setUserRole('user');
		} else {
			setUserRole('agent');
		}
	};

	const logout = () => {
		setIsAuthenticated(false);
		Cookies.remove("jwtToken");
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};
