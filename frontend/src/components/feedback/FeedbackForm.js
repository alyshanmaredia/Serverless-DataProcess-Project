import React, { useState } from 'react';
import axios from 'axios';

const FeedbackForm = () => {
    const [title, setTitle] = useState('');
    const [feedback, setFeedback] = useState('');
    const [reviewer, setReviewer] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');
        setIsLoading(true);

        try {
            // Sending data to the backend
            const response = await axios.post(
                'https://us-central1-serverless-439419.cloudfunctions.net/user_feedbacks', // Updated endpoint
                {
                    title,
                    feedback,
                    reviewer,
                }
            );

            // Handle successful submission
            setSuccessMessage('Feedback submitted and analyzed successfully!');
            console.log('Server Response:', response.data);
            setTitle('');
            setFeedback('');
            setReviewer('');
        } catch (error) {
            // Handle errors during submission
            console.error('Error submitting feedback:', error);
            setErrorMessage(
                error.response?.data?.error || 'Failed to submit feedback. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg flex flex-col">
                <h3 className="text-2xl font-semibold text-center mb-6">Submit Feedback</h3>
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                <label
                            htmlFor="title"
                            className="block text-sm font-medium text-black-700 mb-2"
                        >
                            Feedback Title
                        </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter feedback title"
                        className="w-full p-3 border rounded-md border-gray-300 mb-4 text-black-700"
                        required
                    />
                    <label
                            htmlFor="feedback"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Feedback
                        </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Enter your feedback"
                        className="w-full h-32 p-3 border rounded-md border-gray-300 mb-4 text-gray-700"
                        required
                    />
                    <label
                            htmlFor="reviewer"
                            className="block text-sm font-medium text-black-700 mb-2"
                        >
                            Reviewer Name
                        </label>
                    <input
                        type="text"
                        value={reviewer}
                        onChange={(e) => setReviewer(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full p-3 border rounded-md border-gray-300 mb-4 text-gray-700"
                        required
                    />
                    <div className="flex-grow"></div> {/* This div pushes the button to the bottom */}
                    <div className="text-right">
                        <button
                            type="submit"
                            className={`py-2 px-4 rounded-full text-white transition duration-200 ${
                                isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
                {successMessage && <p className="mt-4 text-green-500 text-center">{successMessage}</p>}
                {errorMessage && <p className="mt-4 text-red-500 text-center">{errorMessage}</p>}
            </div>
        </div>
    );
};

export default FeedbackForm;
