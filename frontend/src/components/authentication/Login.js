import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Label, TextInput, Typography } from "flowbite-react";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (!email || !password) {
			setError("Please fill in all fields");
			return;
		}

		console.log("Signing up with:", email, password);

		navigate("/signup/verify");
	};

	return (
		<Card className='max-w-md mx-auto mt-6 p-6'>
			<form onSubmit={handleSubmit}>
				<div className='text-center mb-4'>
					<h5 className='text-xl font-medium'>Sign Up</h5>
				</div>
				<div className='mb-4'>
					<Label htmlFor='email' value='Email' />
					<TextInput
						id='email'
						type='email'
						placeholder='m@example.com'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>
				<div className='mb-4'>
					<Label htmlFor='password' value='Password' />
					<TextInput
						id='password'
						type='password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>
				{error && <div className='mb-4 text-red-600 text-sm'>{error}</div>}
				<Button type='submit' fullSized gradientDuoTone='cyanToBlue'>
					Sign Up
				</Button>
			</form>
		</Card>
	);
}
