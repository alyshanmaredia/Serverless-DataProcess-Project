import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function Home() {
	const [name, setName] = useState("Guest");
	const navigate = useNavigate();

	useEffect(() => {
		const token = Cookies.get("jwtToken");
		

		if (token) {
			try {
				const decoded = jwtDecode(token);
				setName(decoded["custom:fullname"] || "Guest");
			} catch (error) {
				console.error("Invalid token", error);
			}
		} else {
			navigate("/login");
		}
	}, [navigate]);

	return (
		<div className="flex items-center justify-center h-[calc(100vh-76px)]">
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-5xl">QDP APP</h1>
				<h2 className="text-6xl mt-12">Welcome, <b>{name}</b>!</h2>
			</div>
		</div>
	);
}
