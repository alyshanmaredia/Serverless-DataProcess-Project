import { Firestore } from '@google-cloud/firestore';
import axios from 'axios';

const projectId = process.env.PROJECT_ID;
const databaseId = process.env.DATABASE_ID;
const firestore = new Firestore({
  projectId: projectId,
  databaseId: databaseId
});

export async function assginQDPAgent(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }

  const { user_id, session_id } = req.body;

  if (!user_id || !session_id) {
    return res.status(400).send('Missing required parameters: user_id or session_id');
  }

  try {
    const sessionRef = firestore.collection('chat_messages').doc(user_id).collection('sessions').doc(session_id);

    const sessionDoc = await sessionRef.get();
    if (!sessionDoc.exists) {
      return res.status(404).send('Session not found');
    }

    const sessionData = sessionDoc.data();
    
    const participants = sessionData.participants || [];
    let QDP_AGENT_ID;

    try {
      const agentResponse = await axios.get('https://cflwibhoyxm24hzenxokundc340lvefo.lambda-url.us-east-1.on.aws/');
      QDP_AGENT_ID = agentResponse.data?.email;
      if (!QDP_AGENT_ID) {
        throw new Error('Agent ID not found in response');
      }
    } catch (axiosError) {
      console.error('Error fetching QDP agent:', axiosError.message);
      return res.status(500).send('Failed to fetch QDP agent. Please try again later.');
    }

    const updatedParticipants = Array.from(new Set([...participants, QDP_AGENT_ID]));
    await sessionRef.update({
      status: "active-qdp",
      participants: updatedParticipants,
    });

    const qdpSessionRef = firestore.collection('chat_messages').doc(QDP_AGENT_ID).collection('sessions').doc(session_id);
    const qdpSessionDoc = await qdpSessionRef.get();
    if (!qdpSessionDoc.exists) {
      await qdpSessionRef.set({
        status: sessionData.status,
        participants: updatedParticipants,
      });
    }

    const conversationId = sessionRef.collection('conversations').doc().id;
    const newMessage = {
      sender: "agent",
      message: `QDP Agent [${QDP_AGENT_ID}] has joined the session.`,
      timestamp: new Date().toISOString(),
    };

    await sessionRef.collection('conversations').doc(conversationId).set(newMessage);

    res.json({
      message: `Session ${session_id} updated successfully. Agent ${QDP_AGENT_ID} assigned.`,
      status: "success",
      agent_id: QDP_AGENT_ID
    });
  } catch (error) {
    console.error('Error updating chat session:', error);
    res.status(500).send('Failed to update chat session');
  }
}
