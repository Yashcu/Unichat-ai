import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect("http://localhost:4000");

function App() {
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const joinChat = () => {
    if (username !== "") {
      setIsJoined(true);
    }
  };

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

  useEffect(() => {
    
    const messageListener = (data) => {

      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", messageListener);

    return () => socket.off("receive_message", messageListener);
  }, [socket]);

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
      <div className="chat-body">
        {messageList.map((messageContent) => {
          return (
            <div
              className="message-container"
              id={username === messageContent.author ? "you" : "other"}
              key={messageContent._id} // Use the unique ID from the database as the key
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