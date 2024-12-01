import axios from 'axios';

const DIALOGFLOW_URL = process.env.DIALOGFLOW_URL;
const FIRESTORE_URL = process.env.FIRESTORE_URL;

export async function handleChat(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }

  const { text, session_id, user_id } = req.body;
  
  if (!text) {
    return res.status(400).send('No text provided');
  }

  const sessionId = session_id || 'default-session';
  
  try {
    await axios.post(FIRESTORE_URL, {
      conversation_message: text,
      session_id: sessionId,
      user_id: user_id,
      sender: "user",
      timestamp: new Date().toISOString()
    });

    const dialogflowResponse = await axios.post(DIALOGFLOW_URL, {
      text: text,
      session_id: sessionId,
    });
    
    const botResponse = dialogflowResponse.data.response;
    console.log(botResponse);
    const newMessage = {
      conversation_message: botResponse,
      session_id: sessionId,
      user_id: user_id,
      sender: "bot",
      timestamp: new Date().toISOString()
    };
    console.log(newMessage);
    const storedMessageResponse = await axios.post(FIRESTORE_URL, newMessage);
    const storedMessage = storedMessageResponse.data;
    console.log(storedMessage);
    return res.json({
        sender: storedMessage.sender,
        message: storedMessage.message,
        timestamp: storedMessage.timestamp
    });
  } catch (error) {
    console.error('Error handling chat:', error);
    return res.status(500).send('Failed to handle chat');
  }
}
