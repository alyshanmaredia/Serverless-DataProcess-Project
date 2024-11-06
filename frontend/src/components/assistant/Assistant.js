import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { db } from '../../utility/firebase';
import { Avatar, Button, TextInput, Spinner } from 'flowbite-react';
import { FaEdit } from 'react-icons/fa';
import { FaPaperPlane } from 'react-icons/fa';

function AssistantChat() 
{
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const userId = 'ramya124';
  const messagesEndRef = useRef(null);
 
  useEffect(() => {
    const sessionsRef = collection(doc(collection(db, 'chat_messages'), userId), 'sessions');
    const unsubscribe = onSnapshot(sessionsRef, (snapshot) => {
      const sessionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSessions(sessionsData);
      console.log(sessionsData);
    });
    return () => unsubscribe();
  }, [userId]);
 
  useEffect(() => {
    if (userId && selectedSession) {
      const messagesRef = collection(
        doc(collection(db, 'chat_messages'), userId),
        'sessions',
        selectedSession,
        'conversations'
      );
 
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const messagesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(messagesData);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching messages: ", error);
          setError(error);
          setLoading(false);
        }
      );
 
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [selectedSession, userId]);
 
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
 
  const handleNewChat = () => {
    const newSessionId = Date.now().toString();
    setSelectedSession(newSessionId);
    setMessages([]);
    setNewMessage('');
  };
 
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage || !selectedSession || sending) return;
 
    const messageData = {
      text: newMessage,
      session_id: selectedSession,
      user_id: userId,
    };
 
    setSending(true);
 
    try {
      const response = await fetch('https://us-central1-serverless-439419.cloudfunctions.net/assistant-chat-handler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
 
      if (!response.ok) {
        const errorResponse = await response.text();
        throw new Error(`Error ${response.status}: ${errorResponse}`);
      }
 
      const data = await response.json();
      console.log("API response:", data);
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
    } finally {
      setSending(false);
    }
  };
 
  const userAvatarUrl = 'https://randomuser.me/api/portraits/men/1.jpg';
  const botAvatarUrl = 'https://img.icons8.com/?size=100&id=uZrQP6cYos2I&format=png&color=000000';
 
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading messages...</div>;
  }
 
  if (error) {
    return <div className="flex items-center justify-center h-screen">Error loading messages: {error.message}</div>;
  }
 
  return (
    <div className="App" style={{ display: 'flex' }}>
      <Sidebar sessions={sessions} onSelectSession={setSelectedSession} />
      <div className="flex flex-col h-screen w-full bg-white">
      <div className="p-4 flex justify-between items-center">
        <div className="font-semibold text-2xl text-gray-900 italic ">
          QDP Virtual Assistant
        </div>
          <Button onClick={handleNewChat} color="dark" className="bg-black text-white hover:bg-gray-800">
          <FaEdit className="mr-2" />Start New Chat
          </Button>
      </div>
        <div className="flex-1 overflow-y-auto p-4 pb-20">
          {selectedSession ? (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[70%]`}>
                    <Avatar
                      img={msg.sender === 'user' ? userAvatarUrl : botAvatarUrl}
                      rounded
                      size="sm"
                      className={`${msg.sender === 'user' ? 'ml-2' : 'mr-2'}`}
                    />
                    <div className={`rounded-lg p-3 ${msg.sender === 'user' ? 'bg-violet-500 text-white' : 'bg-green-400 text-gray-900'}`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs text-gray-700 mt-1">
                        {new Date(msg.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <p className="mb-4">No active session. Start a new chat to begin!</p>
              <Button onClick={handleNewChat} color="dark" className="bg-black text-white hover:bg-gray-800">
              <FaEdit className="mr-2" /> Start New Chat
              </Button>
            </div>
          )}
        </div>
 
        {selectedSession && (
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex items-center">
            <TextInput
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 mr-2"
              required
              disabled={sending}
            />
            <Button type="submit" color="blue" disabled={sending} className="flex items-center justify-center">
              {sending ? <Spinner size="sm" /> : <FaPaperPlane className="text-white" />}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
 
export default AssistantChat;