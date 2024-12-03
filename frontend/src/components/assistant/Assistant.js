import React, { useState, useEffect, useRef } from 'react';
import { collection, doc, onSnapshot, query, orderBy, updateDoc, getDoc } from 'firebase/firestore';
import { Avatar, Button, TextInput, Spinner } from 'flowbite-react';
import { FaEdit, FaPaperPlane, FaHistory } from 'react-icons/fa';
import { db } from '../../utility/firebaseChatData';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import Cookies from "js-cookie";

// import { useLocation } from "react-router-dom";

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
  // const [userId, setUserId] = useState('guest');

  const messagesEndRef = useRef(null);

  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const getUserId() = queryParams.get("user");

  // const getUserId() = 'QDPTest100';
  // const getUserId() = 'TestUser01';
  const userAvatarUrl = 'https://randomuser.me/api/portraits/men/1.jpg';
  const botAvatarUrl = 'https://img.icons8.com/?size=100&id=uZrQP6cYos2I&format=png&color=000000';
  const agentAvatarUrl = 'https://img.icons8.com/?size=100&id=84771&format=png';

  const API_BASE_URL = 'https://us-central1-serverless-439419.cloudfunctions.net';
  const redirectPhrase = "Taking you to the";
  const forwardPhrase = "Forwarding to a QDP agent...";

  // Utility: Fetch user sessions
  const fetchSessions = () => {
    console.log("User:", getUserId())
    if(getUserId()) {
      const sessionsRef = collection(doc(collection(db, 'chat_messages'), getUserId()), 'sessions');
      return onSnapshot(sessionsRef, (snapshot) => {
        setSessions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
    }
    // if(getUserId() && getUserId() !== "guest") {
    //   const sessionsRef = collection(doc(collection(db, 'chat_messages'), getUserId()), 'sessions');
    //   return onSnapshot(sessionsRef, (snapshot) => {
    //     setSessions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    //   });
    // } else {
    //   setSessions([{
    //     id: 'default',
    //     created_at: new Date().toISOString(),
    //     participants: ['guest'],
    //     status: "active"
    //   }]);
    //   setSelectedSessionId('default');
    //   const currSession = sessions.find(s => s.id === selectedSessionId);
    //   setSelectedChat(currSession)
    //   setUserType('user');
    //   return null;
    // }
    
  };

  // Utility: Fetch session messages
  const fetchMessages = (sessionId) => {
    const selectedSession = getCurrentSession();
    const sessionParticipants = selectedSession?.participants || [];
    if (getUserId() && getUserId() !== "guest" && sessionId) {
      const uid = userType === 'agent' ? sessionParticipants.find((participant) => participant !== getUserId()) : getUserId();
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
    return null;
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

  const getUserId = () => {
    const token = Cookies.get("jwtToken");
    if (token) {
			try {
				const decoded = jwtDecode(token);
        console.log("User token:", decoded);
				return decoded["email"] || "guest";
			} catch (error) {
				return 'guest';
			}
		}
    return 'guest';
  }

	useEffect(() => {
    console.log(getUserId())

    setTimeout(() => {
      const unsubscribe = fetchSessions();
      if(unsubscribe) return () => unsubscribe();
    }, 2000);
	}, []);

  // Effect: Load messages for selected session
  useEffect(() => {
    if (selectedSessionId) {
      const unsubscribe = fetchMessages(selectedSessionId);
      if(unsubscribe) return () => unsubscribe();
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
        let uid = userType === "agent" ? selectedSession.participants.find((id) => id !== getUserId()) : getUserId();
        await sendMessageToAPI('publish-message', { 
          text: newMessage,
          session_id: selectedSessionId,
          user_id: uid,
          sender: userType
        });
      } else {
        if(getUserId() === 'guest') {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: new Date().toISOString(),
              message: newMessage,
              sender: "user",
              timestamp: new Date().toISOString(),
            },
          ]);
          console.log(messages);
        }
        const response = await sendMessageToAPI('assistant-chat-handler', {
          text: newMessage,
          session_id: selectedSessionId,
          user_id: getUserId(),
        });
        if(getUserId() === 'guest') {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: response.timestamp,
              message: response.message,
              sender: response.sender,
              timestamp: response.timestamp,
            },
          ]);
          console.log(messages);
        }
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

  const closeChat = async () => {
    const response = await axios.post('https://fob6n3b5g3eli5guvw5jflgvtq0jbneo.lambda-url.us-east-1.on.aws/', {email: getUserId()}, {
      headers: { 'Content-Type': 'application/json' },
    });
    if(response.status === 200) {
      try {
        const sessionRef = collection(doc(collection(db, 'chat_messages'), getUserId()), 'sessions');
        const sessionDocRef = doc(sessionRef, selectedSessionId);
        const docSnap = await getDoc(sessionDocRef);
        if (!docSnap.exists()) {
          throw new Error(`No session document found with ID: ${selectedSessionId}`);
        }
        await updateDoc(sessionDocRef, { status: 'closed' });
        console.log(`Session ${selectedSessionId} status updated to closed`);
      } catch (error) {
        console.error("Error updating session status:", error);
      }
    }
  }

  const handleAssistantResponse = async (message) => {
    if (message === forwardPhrase && getUserId() !== 'guest') {
      try {
        const resData = await sendMessageToAPI('qdp-forward', { session_id: selectedSessionId, user_id: getUserId() });
  
        // Handle successful response
        const qdpAgentId = resData.agent_id;
        fetchSessions();
        fetchMessages();
        setSelectedChat(sessions.find(s => s.id === selectedSessionId));
        console.log("resData: ", resData);
        console.log("qdpAgentId: ", qdpAgentId);
        console.log("selectedSessionId: ", selectedSessionId);
        console.log("selectedSessionId: ", getCurrentSession());
  
        let participants = selectedChat?.participants;
        if (participants?.length === 1) {
          participants = [participants[0], qdpAgentId];
          setSelectedChat({ ...selectedChat, participants: participants });
        }
        console.log("selectedChat: ", selectedChat);
      } catch (error) {
        // Handle errors
        console.error("Error while assigning QDP Agent:", error);
  
        // Check for HTTP 500 status
        if (error.response && error.response.status === 500) {
          alert("Failed to assign QDP Agent. Please try again later.");
        } else {
          alert("An unexpected error occurred.");
        }
      }
    } else if (message.includes(redirectPhrase)) {
      const keyword = message.split("Taking you to the ")[1]?.split("...")[0];
  
      const routes = { 'login': '/login', 'dashboard': '/dashboard', 'home': '/home' };
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
    <div className="flex h-[calc(100vh-76px)]">
      {(getUserId() !== "guest") && (<div className="w-64 border border-gray-200 p-4">
        <h1 onClick={fetchSessions} className="flex items-center justify-center space-x-2 w-full bg-blue-100 text-blue-800 text-md font-medium me-2 px-3 py-4 rounded dark:bg-blue-900 dark:text-blue-300">
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
      </div>)}
      <div className="flex flex-col h-full w-full bg-white">
        <div className="p-4 flex justify-between items-center border shadow">
          <h1 className="text-2xl font-semibold">{userType === 'agent' ? 'Agent Dashboard' : 'QDP Virtual Assistant'}</h1>
          {(getUserId() !== "guest") && (<div className='flex gap-2'>
            <Button onClick={handleNewChat} color="dark" className="bg-black hover:bg-gray-800">
              <FaEdit className="mr-2" /> Start New Chat
            </Button>
            {selectedSessionId && (<Button onClick={closeChat} className="bg-red-500 hover:bg-gray-800">
              Close Chat
            </Button>)}
          </div>)}
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

        {getCurrentSession() && (getCurrentSession()?.status === 'closed') && (<h2 className="p-4 flex items-center text-center border-t bg-white">This chat is Closed</h2>)}
        {selectedSessionId && (getCurrentSession()?.status !== 'closed') && (
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
