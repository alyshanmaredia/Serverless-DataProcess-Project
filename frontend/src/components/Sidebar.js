import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen }) => {
  const { userRole } = useAuth();
  return (
    <div
      className={`fixed top-[76px] left-0 h-[calc(100vh-76px)] bg-cyan-700 text-white shadow-lg transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ width: "16rem" }}
    >
      <nav className="mt-4">
        <Link to="/home" className="block py-2 px-4 hover:bg-cyan-600">
          Home
        </Link>
        <Link to="/assistant" className="block py-2 px-4 hover:bg-cyan-600">
          Assistant
        </Link>
        {userRole && userRole === 'user' && (<Link to="/feedback" className="block py-2 px-4 hover:bg-cyan-600">
          Feedback
        </Link>)}
        <Link to="/viewfeedbacks" className="block py-2 px-4 hover:bg-cyan-600">
          View Feedbacks
        </Link>
        {userRole && userRole === 'agent' && (<Link to="/dashboard" className="block py-2 px-4 hover:bg-cyan-600">
          Dashboard
        </Link>)}
      </nav>
    </div>
  );
};

export default Sidebar;
