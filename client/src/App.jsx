import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io.connect("http://localhost:4000");

function App() {
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const messageEndRef = useRef(null);
  
  const joinChat = () => {
    if (username !== "") {
      setIsJoined(true);
    }
  };

  useEffect(() =>{
    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/messages");
        setMessageList(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    const messageListener = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", messageListener);

    return () => socket.off("receive_message", messageListener);
  }, [socket]);

  useEffect(() => {
    if(messageEndRef.current) {
      messageEndRef.current.scrollTop = messageEndRef.current.scrollHeight;
    }
  }, [messageList]);
  
  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        author: username,
        content: currentMessage,
      };

      await socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  


  if (!isJoined) {
    return (
      <div className="App">
        <div className="chat-header"><h3>Join Unichat</h3></div>
        <div className="chat-body" style={{justifyContent: 'center', alignItems: 'center'}}>
          <input
            type="text"
            placeholder="Enter your name..."
            onChange={(event) => setUsername(event.target.value)}
            onKeyPress={(event) => event.key === "Enter" && joinChat()}
          />
          <button onClick={joinChat}>Join Chat</button>
        </div>
      </div>
    );
  }


  return (
    <div className="App">
      <div className="chat-header">
        <p>Unichat AI</p>
      </div>
      <div className="chat-body" ref={messageEndRef}>
        {messageList.map((messageContent) => {
          const messageId = messageContent.isAI
          ? "ai"
          : username === messageContent.author
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
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyPress={(event) => event.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>►</button>
      </div>
    </div>
  );
}

export default App;