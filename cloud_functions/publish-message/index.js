import { PubSub } from '@google-cloud/pubsub';
const pubsub = new PubSub();

export async function publishMessage(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }

  const { text, session_id, user_id, sender } = req.body;
  const topicName = 'message-topic';


  if (!text || !session_id || !user_id || !sender) {
    return res.status(400).send('Missing required parameters');
  }

  const messageData = {
    text,
    session_id,
    user_id,
    sender,
    timestamp: new Date().toISOString(),
  };

  try {
    const topic = pubsub.topic(topicName);
    const messageBuffer = Buffer.from(JSON.stringify(messageData));
    await topic.publish(messageBuffer);
    console.log("Message published");
    res.status(200).send('Message published');
  } catch (error) {
    console.error('Error publishing message:', error);
    res.status(500).send('Error publishing message');
  }
}
