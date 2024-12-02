import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
    // const token = localStorage.getItem("jwtToken");
		const token = Cookies.get("jwtToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

	const login = (token) => {
		setIsAuthenticated(true);
		// localStorage.setItem("jwtToken", token);
		Cookies.set("jwtToken", token, { expires: 20, secure: true });
	};

	const logout = () => {
		setIsAuthenticated(false);
		// localStorage.removeItem("jwtToken");
		Cookies.remove("jwtToken");
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};
