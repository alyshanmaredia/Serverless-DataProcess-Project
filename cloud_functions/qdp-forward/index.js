import { Firestore } from '@google-cloud/firestore';
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

    // Check if session exists
    const sessionDoc = await sessionRef.get();
    if (!sessionDoc.exists) {
      return res.status(404).send('Session not found');
    }

    const sessionData = sessionDoc.data();
    
    // Ensure sessionData.participants exists
    const participants = sessionData.participants || [];
    const QDP_AGENT_ID = "QDPTest100";

    // Update session status and assign agent
    const updatedParticipants = Array.from(new Set([...participants, QDP_AGENT_ID]));
    await sessionRef.update({
      status: "active-qdp",
      participants: updatedParticipants,
    });

    // Create or update QDP agent session
    const qdpSessionRef = firestore.collection('chat_messages').doc(QDP_AGENT_ID).collection('sessions').doc(session_id);
    const qdpSessionDoc = await qdpSessionRef.get();
    if (!qdpSessionDoc.exists) {
      await qdpSessionRef.set({
        status: sessionData.status,
        participants: updatedParticipants, // Ensure updated participants are added here
      });
    }

    // Log agent assignment in conversations
    const conversationId = sessionRef.collection('conversations').doc().id; // Remove duplicate declaration
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
