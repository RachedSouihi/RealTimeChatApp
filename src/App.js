import * as React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
//import io from "socket.io-client";
import HomePage from "./HomePage";
import Chat from "./Chat";
import { UserDataProvider } from "./userDataContext";
//const socket = io.connect("http://127.0.0.1:3001");


export default function App() {



  return (

    <Router>
      <UserDataProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Chat" element={<Chat />} />

        </Routes>
      </UserDataProvider>
    </Router>
  );
}

/*import "./App.css";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io.connect("http://127.0.0.1:3001");

function App() {
  const [message, setMessage] = useState("");

 useEffect(() => {
      const nameSpace = "NameSpace";
      socket.emit("create-namespace", nameSpace); // Emit the 'create-namespace' event with the desired namespace

      const namespaceSocket = io(`/${nameSpace}`);
      namespaceSocket.on("connect", () => {
        console.log(`Connected to namespace ${nameSpace}`);
      });

      namespaceSocket.on("disconnect", () => {
        console.log(`Disconnected from namespace ${nameSpace}`);
      });

      return () => {
        namespaceSocket.disconnect(); // Disconnect from the namespace when the component unmounts
      }
  }, []);
  const sendMsg = (event) => {
    event.preventDefault(); // Prevent the default form submission
    socket.emit("SendMessage", {
      senderId: "456",
      recipientId: "242619",
      message,
    });
  };
  const joinServer = () => {
    const userId = document.getElementsByClassName("user-id")[0].value;
    socket.emit("join", userId);
  };
  const logOut = () => {
    const userId = document.getElementsByClassName("user-id")[0].value;
    socket.emit("logout", userId);
  };

  const createRoom = () => {
    const roomName = document.getElementsByClassName("room-name")[0].value;
    socket.emit("CreateRoom", roomName);
  };

  const joinRoom = () => {
    const userId = document.getElementsByClassName("user-id")[0].value;
    socket.emit("JoinRoom", userId);
  };
  useEffect(() => {
    // Use socket.on to listen for the 'GetMessage' event
    socket.on("GetMessage", (msg) => {
      const span = document.createElement("span");
      span.textContent = msg;
      document.getElementsByClassName("msg")[0].appendChild(span);
    });

    // Clean up event listener when the component unmounts
    return () => {
      socket.off("GetMessage");
    };
  }, []); // Empty dependency array ensures that the effect runs only once on mount

  return (
    <div className="App">
      <div
        className="msg"
        style={{ display: "flex", flexDirection: "column" }}
      ></div>
      <form onSubmit={sendMsg}>
        <input type="text" className="user-id" />
        <button type="button" onClick={joinServer}>
          LOGIN
        </button>
        <br />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <input type="submit" value="Send" />
        <br />
        <input type="text" className="room-name" />
        <button type="button" onClick={createRoom}>
          Create Room
        </button>
        <br />
        <input type="text" className="join-group" />{" "}
        <button type="button" onClick={joinRoom}>
          Join Group
        </button>
        <br />
        <button type="button" onClick={logOut}>
          LOGOUT
        </button>
      </form>
    </div>
  );
}

export default App;
*/
