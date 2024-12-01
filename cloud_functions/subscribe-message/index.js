import { cloudEvent } from '@google-cloud/functions-framework';
import { Firestore } from '@google-cloud/firestore';

const projectId = process.env.PROJECT_ID;
const databaseId = process.env.DATABASE_ID;
const firestore = new Firestore({
  projectId: projectId,
  databaseId: databaseId
});

cloudEvent('handleSubscription',async (cloudEvent) => {
  const base64Data = cloudEvent.data.message.data;
  const message = base64Data ? JSON.parse(Buffer.from(base64Data, 'base64').toString()) : {};
  console.log('Received message:', message);
  if (!message) {
    console.error('Invalid message format');
    return;
  }

  const { text, session_id, user_id, sender } = message;

  try {
    const chatRef = firestore.collection('chat_messages').doc(user_id).collection('sessions').doc(session_id);
    const conversationId = chatRef.collection('conversations').doc().id;
    console.log("Storing in user:", user_id, " and session id: ", session_id);
    const newMessage = {
      sender: sender,
      message: text,
      timestamp: new Date().toISOString(),
    };

    await chatRef.collection('conversations').doc(conversationId).set(newMessage);
    console.log('Message stored in Firestore');
  } catch (error) {
    console.error('Error storing message:', error);
  }
});
