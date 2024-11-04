import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Label, TextInput, Alert } from "flowbite-react";
import { userPool } from "../../utility/CognitoConfig";
import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import hashAnswer from "../../utility/Hashing";

const questions = [
	{ question: "What is your mother's maiden name?", answer: "" },
	{ question: "What was the name of your first pet?", answer: "" },
	{ question: "What city were you born in?", answer: "" },
];

export default function Login() {
	const { login } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [step, setStep] = useState(1);
	const [randomQuestion, setRandomQuestion] = useState(null);
	const [securityAnswer, setSecurityAnswer] = useState("");
	const [mathQuestion, setMathQuestion] = useState("");
	const [userMathAnswer, setUserMathAnswer] = useState("");
	const [mathAnswer, setMathAnswer] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [tempToken, setTempToken] = useState("");

	const ValidateAnswerLambdaUrl =
		process.env.REACT_APP_LAMBDA_VERIFY_SECURITY_ANSWER ||
		"https://mpbwkakggrqs3473fowzamfwhm0otuct.lambda-url.us-east-1.on.aws/";
	const navigate = useNavigate();

	useEffect(() => {
		generateMathQuestion();
	}, []);

	const generateMathQuestion = () => {
		const num1 = Math.floor(Math.random() * 10);
		const num2 = Math.floor(Math.random() * 10);
		setMathQuestion(`${num1} + ${num2} = ?`);
		setMathAnswer(num1 + num2);
	};

	const handleLoginSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (step === 1) {
			const authDetails = new AuthenticationDetails({
				Username: email,
				Password: password,
			});

			const cognitoUser = new CognitoUser({
				Username: email,
				Pool: userPool,
			});

			cognitoUser.authenticateUser(authDetails, {
				onSuccess: (result) => {
					setTempToken(result.idToken.jwtToken);
					fetchSecurityQuestion();
				},
				onFailure: (err) => {
					setError(err.message || "An error occurred during login.");
				},
			});
		} else if (step === 2) {
			const hashedAnswer = await hashAnswer(securityAnswer);
			try {
				const response = await axios.post(ValidateAnswerLambdaUrl, {
					username: email,
					question: randomQuestion.question,
					answer: hashedAnswer,
				});
				console.log(response.data.message);
				if (response.status === 200 && response.data.matched === true) {
					setSuccessMessage("Security answer is correct and matched!");
					setStep(3);
				} else if (response.status === 200 && response.data.matched === false) {
					setError("Security answer is incorrect and not matched!");
				} else {
					setError("Error Occured while verifying answers");
				}
			} catch (err) {
				setError("Error occured while querying Security QA table.");
			}
		} else if (step === 3) {
			if (parseInt(userMathAnswer) === mathAnswer) {
				setSuccessMessage("Login successful!");
				login(tempToken);
				navigate("/dashboard");
			} else {
				setError("Math question answer is incorrect. Please try again.");
			}
		}
	};

	const fetchSecurityQuestion = () => {
		const randomIndex = Math.floor(Math.random() * questions.length);
		const selectedQuestion = questions[randomIndex];
		setRandomQuestion(selectedQuestion);
		setStep(2);
	};

	return (
		<Card className='max-w-md mx-auto mt-6 p-6'>
			<form onSubmit={handleLoginSubmit}>
				<div className='text-center mb-4'>
					<h5 className='text-xl font-medium'>
						{step === 1
							? "Login"
							: step === 2
							? "Answer Security Question"
							: "Solve Math Question"}
					</h5>
				</div>
				{error && <Alert color='failure'>{error}</Alert>}
				{successMessage && <Alert color='success'>{successMessage}</Alert>}
				{step === 1 && (
					<>
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
					</>
				)}
				{step === 2 && (
					<div className='mb-4'>
						<Label
							htmlFor='securityQuestion'
							value={randomQuestion?.question}
						/>
						<TextInput
							id='securityQuestion'
							type='text'
							placeholder='Answer the question'
							value={securityAnswer}
							onChange={(e) => setSecurityAnswer(e.target.value)}
							required
						/>
					</div>
				)}
				{step === 3 && (
					<div className='mb-4'>
						<Label htmlFor='mathQuestion' value={mathQuestion} />
						<TextInput
							id='mathQuestion'
							type='text'
							placeholder='Enter the answer'
							value={userMathAnswer}
							onChange={(e) => setUserMathAnswer(e.target.value)}
							required
						/>
					</div>
				)}
				<Button type='submit' fullSized gradientDuoTone='cyanToBlue'>
					{step === 1
						? "Login"
						: step === 2
						? "Submit Answer"
						: "Submit Math Answer"}
				</Button>
			</form>
		</Card>
	);
}
