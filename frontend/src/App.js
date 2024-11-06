import React from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "../src/components/authentication/Login";
import Registeration from "../src/components/authentication/Registeration";
import Home from "../src/components/Home";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./utility/RouteProtection";
import Assistant from "./components/assistant/Assistant";

const App = () => {
	return (
		<AuthProvider>
			<Router>
			    <Navbar />
				<Routes>
					<Route path='/login' element={<Login />} />
					<Route path='/register' element={<Registeration />} />
					<Route path='/' element={<Navigate to='/login' />} />
					<Route path='/assistant' element={<Assistant />} />
					<Route
						path='/dashboard'
						element={<ProtectedRoute element={<Dashboard />} />}
					/>
				</Routes>
			</Router>
		</AuthProvider>
	);
};

export default App;
