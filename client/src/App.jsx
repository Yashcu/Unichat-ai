import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Auth from './components/Auth';

const socket = io.connect("http://localhost:4000");

function App() {
  const [user, setUser] = useState(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('unichat-user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    localStorage.setItem('unichat-user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('unichat-user');
    setUser(null);
    setMessageList([]);
  };

  // --- MESSAGE LOGIC ---
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/messages");
        setMessageList(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (user) {
      fetchMessages();
    }
  }, [user]);

  useEffect(() => {
    const messageListener = (data) => {
      setMessageList((prev) => [...prev, data]);
    };
    socket.on("receive_message", messageListener);
    return () => socket.off("receive_message", messageListener);
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messageList]);

  const sendMessage = async () => {
    if (currentMessage.trim() !== "" && user) {
      const messageData = {
        author: user.username,
        content: currentMessage.trim(),
      };
      socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  // --- RENDER LOGIC ---
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="App">
      <div className="chat-header">
        <p>Welcome, {user.username}</p>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      <div className="chat-body" ref={chatBodyRef}>
        {messageList.map((messageContent) => {
          const messageId = messageContent.isAI
            ? "ai"
            : user.username === messageContent.author
              ? "you"
              : "other";
          return (
            <div
              className="message-container"
              id={messageId}
              key={messageContent._id || `${messageContent.author}-${Math.random()}`}
            >
              <div className="message">
                <p className="message-author">{messageContent.author}</p>
                <p>{messageContent.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>►</button>
      </div>
    </div>
  );
}

export default App;