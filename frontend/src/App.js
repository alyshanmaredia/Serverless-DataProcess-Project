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
import Assistant from "./components/assistant/Assistant";

const App = () => {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					<Route path='/login' element={<Login />} />
					<Route path='/register' element={<Registeration />} />
					<Route path='/' element={<Navigate to='/login' />} />
					<Route path='/assistant' element={<Assistant />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
};

export default App;
