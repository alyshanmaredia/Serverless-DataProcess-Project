const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { LanguageServiceClient } = require('@google-cloud/language');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = getFirestore('users'); 

const languageClient = new LanguageServiceClient();

const handleCors = (handler) => (req, res) => cors(req, res, () => handler(req, res));

functions.http('saveFeedback', handleCors(async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    try {
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ message: 'description is required' });
        }

        const document = {
            content: description,
            type: 'PLAIN_TEXT',
        };

        const [result] = await languageClient.analyzeSentiment({ document });
        const sentiment = result.documentSentiment;

        let sentimentLabel = 'neutral'; 
        if (sentiment.score > 0) {
            sentimentLabel = 'positive';
        } else if (sentiment.score < 0) {
            sentimentLabel = 'negative';
        }

        const docRef = db.collection('feedbackes').doc(); 
        await docRef.set({
            description: description,
            sentiment: sentimentLabel,
            sentimentScore: sentiment.score,
            sentimentMagnitude: sentiment.magnitude,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(200).json({
            message: 'Feedback saved successfully',
            sentiment: sentimentLabel,
            sentimentScore: sentiment.score,
            sentimentMagnitude: sentiment.magnitude,
        });
    } catch (error) {
        console.error('Error saving feedback:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}));
