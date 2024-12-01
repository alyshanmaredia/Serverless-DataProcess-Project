import React, { useState, useEffect, useRef } from 'react';
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Avatar, Button, TextInput, Spinner } from 'flowbite-react';
import { FaEdit, FaPaperPlane, FaHistory } from 'react-icons/fa';
import { db } from '../../utility/firebase';
import axios from 'axios';

import { useLocation } from "react-router-dom";

function AssistantChat() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedChat, setSelectedChat] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [userType, setUserType] = useState('user');

  const messagesEndRef = useRef(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("user");

  // const userId = 'QDPTest100';
  // const userId = 'TestUser01';
  const userAvatarUrl = 'https://randomuser.me/api/portraits/men/1.jpg';
  const botAvatarUrl = 'https://img.icons8.com/?size=100&id=uZrQP6cYos2I&format=png&color=000000';
  const agentAvatarUrl = 'https://img.icons8.com/?size=100&id=84771&format=png';

  const API_BASE_URL = 'https://us-central1-serverless-439419.cloudfunctions.net';
  const redirectPhrase = "Do you want me to take you to the";
  const forwardPhrase = "Forwarding to a QDP agent...";

  // Utility: Fetch user sessions
  const fetchSessions = () => {
    const sessionsRef = collection(doc(collection(db, 'chat_messages'), userId), 'sessions');
    return onSnapshot(sessionsRef, (snapshot) => {
      setSessions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  };

  // Utility: Fetch session messages
  const fetchMessages = (sessionId) => {
    const selectedSession = getCurrentSession();
    const sessionParticipants = selectedSession?.participants || [];

    if (userId && sessionId) {
      const uid = userType === 'agent' ? sessionParticipants.find((participant) => participant !== userId) : userId;
      const messagesRef = collection(doc(collection(db, 'chat_messages'), uid), 'sessions', sessionId, 'conversations');
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
      return onSnapshot(
        messagesQuery,
        (snapshot) => {
          setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching messages:", err);
          setError(err);
          setLoading(false);
        }
      );
    }
  };

  // Helper: Determine user type
  const determineUserType = (session) => {
    return session?.conversations ? 'user' : 'agent';
  };

  // Helper: Scroll to the latest message
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getCurrentSession = () => {
    return sessions.find(s => s.id === selectedSessionId);
  }

  // Effect: Load sessions
  useEffect(() => {
    const unsubscribe = fetchSessions();
    return () => unsubscribe();
  }, [userId]);

  // Effect: Load messages for selected session
  useEffect(() => {
    if (selectedSessionId) {
      const unsubscribe = fetchMessages(selectedSessionId);
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [selectedSessionId, userType]);

  // Effect: Scroll on new messages
  useEffect(() => scrollToBottom(), [messages]);

  const handleNewChat = () => {
    setSelectedSessionId(Date.now().toString());
    setMessages([]);
    setNewMessage('');
  };

  const handleSelectChat = (sessionId) => {
    fetchSessions();
    setSelectedSessionId(sessionId);
    fetchMessages();
    const currSession = sessions.find(s => s.id === sessionId);
    setSelectedChat(currSession)
    setUserType(determineUserType(currSession));
    console.log("messages: ", messages);
    console.log("current session: ", getCurrentSession());
    console.log("selectedSessionId: ", selectedSessionId);
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage || sending) return;
    setSending(true);
    const selectedSession = getCurrentSession();
    console.log(selectedSession?.participants)
    try {
      if (selectedSession?.participants?.length > 1 || userType === "agent") {
        let uid = userType === "agent" ? selectedSession.participants.find((id) => id !== userId) : userId;
        await sendMessageToAPI('publish-message', { 
          text: newMessage,
          session_id: selectedSessionId,
          user_id: uid,
          sender: userType
        });
      } else {
        const response = await sendMessageToAPI('assistant-chat-handler', {
          text: newMessage,
          session_id: selectedSessionId,
          user_id: userId,
        });
        await handleAssistantResponse(response.message);
      }
    } finally {
      fetchMessages();
      setSending(false);
      setNewMessage('');
    }
  };

  const sendMessageToAPI = async (endpoint, payload) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${endpoint}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (err) {
      console.error("API Error:", err);
      throw err;
    }
  };

  const handleAssistantResponse = async (message) => {
    if (message === forwardPhrase) {
      const resData = await sendMessageToAPI('qdp-forward', { session_id: selectedSessionId, user_id: userId });
      const qdpAgentId = resData.agent_id;
      fetchSessions();
      fetchMessages();
      setSelectedChat(sessions.find(s => s.id === selectedSessionId));
      console.log("resData: ", resData);
      console.log("qdpAgentId: ", qdpAgentId);
      console.log("selectedSessionId: ", selectedSessionId);
      console.log("selectedSessionId: ", getCurrentSession());
      let participants = selectedChat?.participants;
      if(participants?.length == 1) {
        participants = [participants[0], qdpAgentId];
        setSelectedChat({...selectedChat, participants: participants});
      }
      console.log("selectedChat: ",selectedChat)
    } else if (message.includes(redirectPhrase)) {
      const keyword = message.split(redirectPhrase).pop().split(/[.\n?]/)[0].trim();
      const routes = { 'login/registration page': '/login', 'dashboard page': '/dashboard', 'home page': '/home' };
      if (routes[keyword.toLowerCase()]) window.open(routes[keyword.toLowerCase()], '_blank');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading messages...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">Error loading messages: {error.message}</div>;
  }

  return (
    <div className="flex h-[calc(100vh-68px)]">
      <div className="w-64 border border-gray-200 p-4">
        <h1 className="flex items-center justify-center space-x-2 w-full bg-blue-100 text-blue-800 text-md font-medium me-2 px-3 py-4 rounded dark:bg-blue-900 dark:text-blue-300">
          <FaHistory className="text-xl" /> 
          <span>Chat History</span>
        </h1>
        <ul className="list-none p-0 mt-4">
          {sessions.map((ses) => (
            <li key={ses.id} className="mb-4">
              <button
                onClick={() => handleSelectChat(ses.id)}
                className="focus:outline-none w-full text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
              >
                {ses.id}  
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col h-full w-full bg-white">
        <div className="p-4 flex justify-between items-center border shadow">
          <h1 className="text-2xl font-semibold">{userType === 'agent' ? 'Agent Dashboard' : 'QDP Virtual Assistant'}</h1>
          <Button onClick={handleNewChat} color="dark" className="bg-black hover:bg-gray-800">
            <FaEdit className="mr-2" /> Start New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {selectedSessionId ? (
            <>
              {messages.map((msg) => (
                <MessageBubble 
                  key={msg.id}
                  messageData={msg}
                  avatars={{ userAvatarUrl, botAvatarUrl, agentAvatarUrl }}
                  userType={userType}/>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p>No active session. Start a new chat!</p>
              <Button onClick={handleNewChat} color="dark">
                <FaEdit className="mr-2" /> Start New Chat
              </Button>
            </div>
          )}
        </div>

        {selectedSessionId && (
          <form onSubmit={handleSendMessage} className="p-4 flex items-center border-t bg-white">
            <TextInput
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 mr-2"
              disabled={sending}
              required
            />
            <Button type="submit" color="blue" disabled={sending}>
              {sending ? <Spinner size="sm" /> : <FaPaperPlane />}
            </Button>
          </form>
        )}
      </div>      
    </div>
  );
}

// Subcomponent: Message Bubble
const MessageBubble = ({ messageData, avatars, userType }) => {
  const { sender, message, timestamp } = messageData;
  const avatar =
    sender === 'user'
      ? avatars.userAvatarUrl
      : sender === 'agent'
      ? avatars.agentAvatarUrl
      : avatars.botAvatarUrl;

  const bubbleStyles =
    sender === 'user'
      ? 'bg-blue-500 text-white'
      : sender === 'agent'
      ? 'bg-purple-600 text-white'
      : 'bg-green-400 text-gray-900';

  // Determine alignment based on userType
  const isSenderOnRight =
    (userType === 'user' && sender === 'user') ||
    (userType === 'agent' && sender !== 'user');

  return (
    <div className={`flex mb-2 ${isSenderOnRight ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start max-w-[70%] ${isSenderOnRight ? 'flex-row-reverse' : ''}`}>
        <Avatar img={avatar} size="sm" className={isSenderOnRight ? 'ml-2' : 'mr-2'} />
        <div className={`rounded-lg p-3 ${bubbleStyles}`}>
          <p>{message}</p>
          <p className="text-xs mt-1">{new Date(timestamp).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AssistantChat;
