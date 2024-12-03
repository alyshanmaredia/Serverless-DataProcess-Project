import { Firestore } from '@google-cloud/firestore';
const projectId = process.env.PROJECT_ID;
const databaseId = process.env.DATABASE_ID;
const firestore = new Firestore({
  projectId: projectId,
  databaseId: databaseId
});

export async function saveChat(req, res) {
  const { conversation_message, session_id, user_id, sender, timestamp } = req.body;
  
  if (!conversation_message) {
    return res.status(400).send('Invalid input');
  }
  
  const sessionId = session_id || 'default-session';
  const chatRef = firestore.collection('chat_messages').doc(user_id).collection('sessions').doc(sessionId);
  const conversationId = firestore.collection('chat_messages').doc(user_id).collection('sessions').doc(sessionId).collection('conversations').doc().id;

  
  try {
    const sessionDoc = await chatRef.get();

    if (!sessionDoc.exists) {
      await chatRef.set({
        created_at: timestamp || new Date().toISOString(),
        status: "active",
        participants: [user_id],
        conversations: {}
      });
    }

    const newMessage = {
      sender: sender,
      message: conversation_message,
      timestamp: timestamp || new Date().toISOString()
    }

    await chatRef.collection('conversations').doc(conversationId).set(newMessage);
    
    res.json(newMessage);
  } catch (error) {
    console.error('Failed to save chat:', error);
    res.status(500).send('Failed to save chat');
  }
}
