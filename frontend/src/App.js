import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "../src/components/authentication/Login";
import Registeration from "../src/components/authentication/Registeration";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import ProtectedRoute from "./utility/RouteProtection";
import Assistant from "./components/assistant/Assistant";
import FeedbackForm from "./components/feedback/FeedbackForm";
import FeedbackTable from "./components/feedback/ViewFeedbacks";
import DataProcessor1 from "./components/dataProcessors/DataProcessor1";
import DataProcessor2 from "./components/dataProcessors/DataProcessor2";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="relative">
          <Navbar toggleSidebar={toggleSidebar} />
          <Sidebar isOpen={isSidebarOpen} />
          <div
            className={`ml-0 ${isSidebarOpen ? "ml-64" : ""} transition-all`}
          >
            <div>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Registeration />} />
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route
                  path="/home"
                  element={<ProtectedRoute element={<Home />} />}
                />
                <Route 
									path="/feedback" 
									element={<ProtectedRoute element={<FeedbackForm />} />}
								/>
                <Route 
									path="/viewfeedbacks" 
									element={<FeedbackTable />}
								/>
                <Route
                  path="/dashboard"
                  element={<ProtectedRoute element={<Dashboard />} />}
                />
                <Route path="/dp1" element={<DataProcessor1/>}/>
                <Route path="/dp2" element={<DataProcessor2/>}/>
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
