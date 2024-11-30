import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FeedbackCards = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await axios.get('https://us-central1-serverless-439419.cloudfunctions.net/view_feedbacks');
                setFeedbacks(response.data);
            } catch (error) {
                console.error('Error fetching feedbacks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, []);

    if (loading) {
        return <div className="text-center p-4 text-lg">Loading feedbacks...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Feedbacks</h1>

            {/* Feedback Cards Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {feedbacks.length === 0 ? (
                    <div className="text-center text-lg text-gray-500 col-span-4">No feedbacks available</div>
                ) : (
                    feedbacks.map((feedback, index) => {
                        // Safely convert the score to a number and default to 0 if not valid
                        const score = parseFloat(feedback.score);
                        const scoreFormatted = !isNaN(score) ? score.toFixed(3) : '0.000';

                        // Determine the background color based on classification
                        const classificationColor =
                            feedback.classification === 'Positive'
                                ? 'bg-green-800'
                                : feedback.classification === 'Negative'
                                ? 'bg-red-800'
                                : feedback.classification === 'Neutral'
                                ? 'bg-yellow-400'
                                : 'bg-gray-400';

                        return (
                            <a
                                key={index}
                                href="#"
                                className={`block p-6 border border-gray-200 rounded-lg shadow ${classificationColor} 
    hover:opacity-80 hover:text-black transition duration-300`}>
                                <h5 className="mb-2 text-2xl font-bold text-white">{feedback.title || 'No Title'}</h5>
                                <p className="font-normal text-white mb-4">{feedback.feedback || 'No Feedback'}</p>
                                <div className="text-white mb-2">
                                    <span className="font-semibold">Reviewer :  </span>
                                    {feedback.reviewer || 'Anonymous'}
                                </div>
                                <div className="text-white mb-2">
                                    <span className="font-semibold">Score :  </span>
                                    {scoreFormatted}
                                </div>
                                {/* Plain text for classification */}
                                <div className="text-white text-lg font-semibold">{feedback.classification || 'Neutral'}</div>
                            </a>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default FeedbackCards;
