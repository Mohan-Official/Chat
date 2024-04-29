import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import '../MainComponent/Main.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone as Mobile, faVideo as Video, faPlus as Adduser, faPaperPlane as Send, faSmile as Emoji, faLink as Attachments } from '@fortawesome/free-solid-svg-icons';

export default function Main() {
  const [username, setUsername] = useState("");
  const [socket, setSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [authorsList, setAuthors] = useState([]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    const savedUsername = localStorage.getItem('username');
    if (!savedUsername) {
      Swal.fire({
        title: "Enter username",
        input: "text",
        inputLabel: "Username",
        inputPlaceholder: "Enter your username",
        allowOutsideClick: false,
        inputValidator: (value) => {
          if (!value) {
            return "You need to enter a username";
          }
        },
        confirmButtonText: "Enter chat",
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.isConfirmed) {
          setUsername(result.value);
          newSocket.emit("username", result.value);
          localStorage.setItem("username", result.value);
        }
      });
    } else {
      setUsername(savedUsername);
      newSocket.emit("username", savedUsername);
    }

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => 
  {

    if (!socket || !username) return;

    socket.on('all authors', (receivedAuthors) => 
    {
        setAuthors(receivedAuthors);
    });

    setConnectedUsers(prevUsers => {
        const updatedUsers = [...prevUsers, username];
        return Array.from(new Set(updatedUsers));
      });
    
      socket.on('user joined', (newUser) => {
        setConnectedUsers(prevUsers => {
          if (newUser === username) return prevUsers;
          if (!prevUsers.includes(newUser)) {
            return [...prevUsers, newUser];
          }
          return prevUsers;
        });
      });
    
      console.log("Connected User "+connectedUsers);
  
      socket.on('user left', (leftUser) => {
        setConnectedUsers(prevUsers => prevUsers.filter(user => user !== leftUser));
      });
  
    socket.on('chat message', (msg) => {
      const item = document.createElement("li");
      item.classList.add("msg-li");
      const messageAlignment = msg.author === username ? "message-right" : "message-left";
      item.classList.add(messageAlignment);
      const messageContent = msg.author === username ? msg.content : `<div class="authorStyle">${msg.author}</div>${msg.content}`;
      item.classList.add(messageAlignment);
      item.innerHTML = `<div class='msg-content'> ${messageContent}</div>`;
      if (msg.image) {
        const img = document.createElement("img");
        img.classList.add('img-style');
        img.src = msg.image;
        item.appendChild(img);
      }
      document.getElementById("messages").appendChild(item);
      scrollBottom();
    });
  
    socket.on('loaded messages', (messages) => {
      const messageList = document.getElementById("messages");
      messages.forEach((msg) => {
        const item = document.createElement("li");
        item.classList.add("img-li");
        item.classList.add("msg-li");
        const messageAlignment = msg.author === username ? "message-right" : "message-left";
        const messageContent = msg.author === username ? msg.content : `<div class="authorStyle">${msg.author}</div>${msg.content}`;
        item.classList.add(messageAlignment);
        item.innerHTML = `<div class='msg-content'> ${messageContent}</div>`;
        if (msg.image) {
          const img = document.createElement("img");
          img.classList.add("img-style");
          img.src = msg.image;
          item.appendChild(img);
        }
        messageList.appendChild(item);
      });
      scrollBottom();
    });
  }, [socket, username]);
  

  const scrollBottom = () => {
    const message = document.getElementById("messageContainer");
    message.scrollTop = message.scrollHeight;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById("text-area");
    const fileInput = document.getElementById("imageBtn");
    const file = fileInput.files[0];

    if (!file && !input.value) {
      alert("Please enter a message");
      return;
    }

    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        socket.emit("chat message", {
          author: username,
          content: input.value,
          image: reader.result
        });
        input.value = "";
        fileInput.value = "";
      };
    } else {
      socket.emit("chat message", {
        author: username,
        content: input.value,
        image: null
      });
      input.value = "";
    }
  };

  useEffect(() => {
    console.log("Authors:", authorsList);
  }, [authorsList]);

  const handleAttachments = () => {
    const fileInput = document.getElementById('imageBtn');
    fileInput.click();
  };

  return (
    <main id="ChatApplicationContainer">
      <section id="userDetails">
        <div id='chat-profile-section'>
          <img src="https://wallpapercave.com/wp/wp7433217.jpg" alt="chat image" id='chat-profile' />
        </div>
        <div id='chat-user-sections'>
          <label id='chat-name'>RCB FAN CHAT</label>
          <span id='users-div'>
            {authorsList.map((user, index) => (
              <label key={index} className="user-label">{user}{index !== authorsList.length - 1 ? ", " : ""}</label>
            ))}
          </span>
        </div>
        <div id='chat-icons-section'>
          <FontAwesomeIcon icon={Mobile} className='chat-icon mobile'/>
          <FontAwesomeIcon icon={Video} className='chat-icon video'/>
          <FontAwesomeIcon icon={Adduser} className='chat-icon adduser'/>
        </div>
      </section>
      <div id="messageContainer">
        <ul id="messages"></ul>
      </div>
      <form onSubmit={handleSubmit} id="form-container">
        <span id='text-icon-sec'>
          <input type="file" id="imageBtn" accept="image/*" />
          <FontAwesomeIcon icon={Emoji} id='emoji-icon'/>
          <FontAwesomeIcon icon={Attachments} id='attach-icon' onClick={handleAttachments}/>
        </span>
        <span id='text-box-sec'>
          <input type="text" placeholder="Text here" name="" id="text-area" />
        </span>
        <button type="submit" id="send-btn"><FontAwesomeIcon icon={Send} className='send-icon'/></button>
      </form>
    </main>
  );
}
