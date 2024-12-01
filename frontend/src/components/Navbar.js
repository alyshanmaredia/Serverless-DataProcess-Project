import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fullname, setFullname] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setFullname(decoded["custom:fullname"]);
        if (decoded["custom:usertype"] === "QDPAgents") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  const isLoginPage = location.pathname === "/login";

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <nav className="bg-cyan-600 text-white shadow-lg">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {isAuthenticated && (<button
          className="text-2xl px-4 focus:outline-none hover:bg-cyan-500 rounded"
          onClick={toggleSidebar}
        >
          ☰
        </button>)}
        <a
          href="/"
          className="text-3xl font-bold tracking-wide hover:opacity-90 transition duration-300"
        >
          QDP App
        </a>

        <div className="hidden md:flex items-center space-x-6 text-lg">
          {isAuthenticated ? (
            <div className="relative">
              <button
                className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-400 transition duration-300 flex items-center space-x-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span>{fullname}</span>
                <svg
                  className={`h-4 w-4 transition-transform duration-300 ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-cyan-700 text-white rounded shadow-lg z-10">
                  {isAdmin && (
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-cyan-600 transition"
                      onClick={goToDashboard}
                    >
                      Dashboard
                    </button>
                  )}
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-cyan-600 transition"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : isLoginPage ? (
            <Link
              to="/register"
              className="hover:text-gray-200 transition duration-300"
            >
              Register
            </Link>
          ) : (
            <Link
              to="/login"
              className="hover:text-gray-200 transition duration-300"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
