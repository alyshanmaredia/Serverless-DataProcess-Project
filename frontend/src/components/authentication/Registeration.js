import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Label, TextInput, Select, Alert } from "flowbite-react";
import { userPool } from "../../utility/CognitoConfig";
import { CognitoUser } from "amazon-cognito-identity-js";
import { LOGIN } from "../../utility/Constants";
import axios from "axios";
import hashAnswer from "../../utility/Hashing";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../utility/firebaseDefault";

export default function Registration() {
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [type, setType] = useState("");
	const [error, setError] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [isRegistered, setIsRegistered] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const [securityQuestions, setSecurityQuestions] = useState([
		{ question: "What is your mother's maiden name?", answer: "" },
		{ question: "What was the name of your first pet?", answer: "" },
		{ question: "What city were you born in?", answer: "" },
	]);
	const [successMessage, setSuccessMessage] = useState("");
	const navigate = useNavigate();

	const addUserToGroup =
		process.env.REACT_APP_ASSIGN_USER_TO_GROUP ||
		"https://3tlvqdqub3zuwus763yb6fkvgi0azygo.lambda-url.us-east-1.on.aws/";

	const addSecurityQAUrl =
		process.env.REACT_APP_LAMBDA_STORE_SECURITY_QA ||
		"https://yf2xrervd3urtlskq52kof2u4u0ntzxt.lambda-url.us-east-1.on.aws/";

	const SNSNotificationLambdaUrl =
		process.env.REACT_APP_LAMBDA_SNS_NOTIFICATION ||
		"https://lfgb5dgzov6unjdy3wawma72pa0ukmhi.lambda-url.us-east-1.on.aws/";

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (!fullName || !email || !password || !confirmPassword || !type) {
			setError("All fields are required. Please fill in all fields.");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match. Please try again.");
			return;
		}

		userPool.signUp(
			email,
			password,
			[
				{ Name: "custom:fullname", Value: fullName },
				{ Name: "custom:usertype", Value: type },
				{ Name: "custom:status", Value: "unassigned" },
			],
			null,
			(err, result) => {
				if (err) {
					setError(err.message || "An error occurred during registration.");
				} else {
					setSuccessMessage(
						"Registration successful! Please verify your email."
					);
					setIsRegistered(true);
				}
			}
		);
	};

	const storeRegistrationLogs = async (email) => {
		const now = new Date();
		const SignUpDetails = {
			email,
			type,
			fullName,
			day: now.getDate(),
			month: now.getMonth() + 1,
			year: now.getFullYear(),
			timestamp: now.toISOString(),
		};

		try {
			await setDoc(
				doc(db, "signup_logs", `${email}-${now.getTime()}`),
				SignUpDetails
			);
			console.log("Signup Logs stored successfully.");
		} catch (error) {
			console.error("Error storing sign up logs: ", error);
		}
	};

	const triggerSNSNotification = async (email) => {
		try {
			const response = await axios.post(SNSNotificationLambdaUrl, {
				email: email,
				eventType: "Registration",
			});

			if (response.status === 200 && response.data.matched === true) {
				setSuccessMessage(
					"Successfully sent a SNS Notification on User Login."
				);
			}
		} catch (err) {
			setError("Error sending a SNS Notification on user login action.");
		}
	};

	const handleVerificationSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccessMessage("");

		const userData = {
			Username: email,
			Pool: userPool,
		};

		const cognitoUser = new CognitoUser(userData);

		cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
			if (err) {
				setError(
					err.message ||
						"Error confirming registration. Please check your code."
				);
			} else {
				setSuccessMessage(
					"Verification successful! Now you can set your security questions."
				);
				axios.post(addUserToGroup, {
					emailAddress: email,
					groupName: type,
				});
				setIsVerified(true);
			}
		});
	};

	const handleSecurityQuestionsChange = (index, field, value) => {
		const updatedQuestions = [...securityQuestions];
		updatedQuestions[index][field] = value;
		setSecurityQuestions(updatedQuestions);
	};

	const handleSecurityQuestionsSubmit = async (e) => {
		e.preventDefault();

		const hashedAnswers = await Promise.all(
			securityQuestions.map((item) => hashAnswer(item.answer))
		);

		const questionsWithHashedAnswers = securityQuestions.map((item, index) => ({
			question: item.question,
			answer: hashedAnswers[index],
		}));

		try {
			await axios.post(addSecurityQAUrl, {
				username: email,
				securityQuestions: questionsWithHashedAnswers,
			});
			await triggerSNSNotification(email);
			await storeRegistrationLogs(email);
			setSuccessMessage("Security questions saved successfully!");
			setTimeout(() => {
				navigate(LOGIN);
			}, 400);
		} catch (err) {
			setError("Failed to set security questions. Please try again.");
		}
	};

	return (
		<Card className='max-w-md mx-auto mt-6 p-6'>
			<form
				onSubmit={
					isRegistered
						? isVerified
							? handleSecurityQuestionsSubmit
							: handleVerificationSubmit
						: handleSubmit
				}
			>
				<div className='text-center mb-4'>
					<h5 className='text-xl font-medium'>
						{isRegistered
							? isVerified
								? "Set Security Questions"
								: "Verify Your Account"
							: "Sign Up"}
					</h5>
				</div>
				{error && <Alert color='failure'>{error}</Alert>}
				{successMessage && <Alert color='success'>{successMessage}</Alert>}
				{!isRegistered ? (
					<>
						<div className='mb-4'>
							<Label htmlFor='fullName' value='Full Name' />
							<TextInput
								id='fullName'
								type='text'
								placeholder='John Doe'
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								required
							/>
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
						<div className='mb-4'>
							<Label htmlFor='confirmPassword' value='Confirm Password' />
							<TextInput
								id='confirmPassword'
								type='password'
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
							/>
						</div>
						<div className='mb-4'>
							<Label htmlFor='type' value='Type' />
							<Select
								id='type'
								value={type}
								onChange={(e) => setType(e.target.value)}
								required
							>
								<option value=''>Select Type</option>
								<option value='QDPAgents'>Admin</option>
								<option value='RegisteredUsers'>User</option>
							</Select>
						</div>
					</>
				) : isVerified ? (
					<>
						{securityQuestions.map((question, index) => (
							<div key={index} className='mb-4'>
								<Label
									htmlFor={`securityQuestion${index}`}
									value={`Security Question ${index + 1}`}
								/>
								<TextInput
									id={`securityQuestion${index}`}
									type='text'
									placeholder={question.question}
									value={question.answer}
									onChange={(e) =>
										handleSecurityQuestionsChange(
											index,
											"answer",
											e.target.value
										)
									}
									required
								/>
							</div>
						))}
					</>
				) : (
					<>
						<div className='mb-4'>
							<Label htmlFor='verificationCode' value='Verification Code' />
							<TextInput
								id='verificationCode'
								type='text'
								placeholder='Enter verification code'
								value={verificationCode}
								onChange={(e) => setVerificationCode(e.target.value)}
								required
							/>
						</div>
					</>
				)}
				<Button type='submit' fullSized gradientDuoTone='cyanToBlue'>
					{isRegistered
						? isVerified
							? "Save Security Questions"
							: "Confirm Code"
						: "Sign Up"}
				</Button>
			</form>
		</Card>
	);
}
