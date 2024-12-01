import { SessionsClient } from '@google-cloud/dialogflow-cx';
const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const location = process.env.DIALOGFLOW_LOCATION;
const agentId = process.env.DIALOGFLOW_AGENT_ID;

export async function detectIntent(req, res) {
  const { text, session_id } = req.body;
  const sessionClient = new SessionsClient({
    apiEndpoint: `${location}-dialogflow.googleapis.com`,
  });

  if (!text) {
    return res.status(400).send('No text provided');
  }

  const sessionPath = `projects/${projectId}/locations/${location}/agents/${agentId}/sessions/${session_id || 'default-session'}`;
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: text,
      },
      languageCode: 'en',
    },
  };
  
  try {
    const responses = await sessionClient.detectIntent(request);
    const resultText = responses[0].queryResult.responseMessages[0].text.text[0];
    res.json({ response: resultText });
  } catch (error) {
    console.error('Dialogflow request failed:', error);
    res.status(500).send('Dialogflow request failed');
  }
}
