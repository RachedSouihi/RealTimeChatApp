const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
require('dotenv').config();
const client = require('./connectionDB')
const bcrypt = require("bcrypt");
//const crypto = require('crypto')
const app = express();
app.use(cors());
app.use(express.json())
app.use(express.json({ limit: '100mb' }));
const server = require('http').createServer(app);
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const User = require('./userModel');
//const secretKey = crypto.randomBytes(32).toString('hex');
const SEKRET_KEY = "bce7af47ea961298fed4bc2d358aea02a5021780a1d132cc9eee26b3ca9494b7"

mongoose.connect("mongodb+srv://RachedSouihi:RachedInformatik12426190863314522613mongodb@cluster0.odiiv58.mongodb.net/RealTimeChatApp?retryWrites=true&w=majority", { dbName: "RealTimeChatApp" });
app.post('/insertNewUser', async (req, res) => {
  const data = req.body;
  const saltRounds = 10;
  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) {
      console.error('Error generating salt:', err);
      return;
    }

    bcrypt.hash(data.password, salt, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return;
      }
      console.log('Hashed password:', hashedPassword);
    })
  })

})


app.get("/compare", (req, res) => {
  const { password } = req.query
  bcrypt.compare(password, "$2b$10$GRt4oT8RhMD1g3KAi9h.uO9zjQyA43obAuzPZIuJ7/xYnlkYv.a8G", (err, result) => {
    if (err) {
      console.log("Error comparing password: ", err);
      return;
    }

    if (result) {
      console.log("OK")
    } else {
      console.log("!!!")
    }


  })
})





app.post("/confirmAccount", (req, res) => {
  const data = req.body;
  console.log(data)
  jwt.verify(data.token, SEKRET_KEY, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: 'Invalide verification code', tokenDone: true, success: false })

    } else {
      if (decoded.number === data.number) {
        const user = new User({
          firstname: data.firstName,
          lastname: data.lastName,
          email: data.email,
          password: data.password,
          dailingCode: data.dialingCode,
          country: data.country,
          aboutYourself: data.aboutYourself,
        })

        user.save()
          .then((result) => {
            
            res.status(200).json({ message: "Verfication seccessfull", tokenDone: false, success: true })
          })
          .catch(err => {
            console.log(err);
            res.status(200).json({ message: "Verfication failed", tokenDone: false, success: false })
          })

      } else {
        res.status(400).json({ message: "Number doesn't match!, try again", tokenDone: false, success: false })
      }
    }
  })

})

app.post('/sendVerifCode', (req, res) => {
  token = jwt.sign({ number: 242619 }, SEKRET_KEY, {
    expiresIn: '1.5m'
  })
  /*const { email } = req.body
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: 'souihirached@istic.u-carthage.tn',                  
      pass: 'a6waBeF*xn'
    }
  })

  const mailOption = {
    from: 'souihirached@istic.u-carthage.tn',
    to: email,
    subject: 'Test sending an email with nodemail',
    text: `<p>Your verification code is <b>${number}</b></p>`
  }

  transporter.sendMail(mailOption, (err, info) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: 'Failed to send verification code' });
    } else {
      console.log('Email sent: ' + info.response);
      res.json({ message: 'Verification code sent to your email', token: token });
    }
  });*/

  res.json({ message: 'Verification code sent to your email', token: token })
})


app.post('/updateProfilePic', (req, res) => {
  const {email, ...imageData} = req.body
 
  
  imageData.picture = Buffer.from(imageData.picture, "base64");
  client.db('RealTimeChatApp').collection('users').updateOne({email: email},{$set: imageData})



})



const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

const namespaces = [];
io.on('connection', (socket) => {

  socket.on('connectToServer', (userId) => {
    socket.join(userId)
    console.log(`The user ${userId} connect to server`)
  })

  socket.on('SendMessage', (sender, receiver, message) => {
    console.log(receiver, message)
    io.to(receiver).emit('GetMessage', message)
    io.to(sender).emit('GetMessage', message)
  })
  socket.on('showAllNS', () => {
    console.log(namespaces)
  })
  console.log('A user connected');

  socket.on('create-namespace', (nameSpace) => {
    const namespace = io.of(`/${nameSpace}`);
    namespaces.push(namespace);
    console.log(`Namespace ${nameSpace} created`);

    namespace.on('connection', (namespaceSocket) => {
      console.log(`A user connected to namespace ${nameSpace}`);

      namespaceSocket.on('message', (message) => {
        console.log(message)
        namespace.emit('GetMessage', message)

      })

      namespaceSocket.on('createRoom', (roomName) => {
        namespaceSocket.join(roomName)
        console.log(`Room ${roomName} created successfully in namespace ${nameSpace}`)
        console.log(namespace.adapter.rooms)
      })


    });


  });



  socket.on("disconnect", () => {
    console.log("A user disconnected");

  });
});

app.listen(5000, () => {
  console.log('Server listening on port 3001');
});




















/*const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const {v4: uuidv4} = require('uuid')

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

const users = {};
const offlineMessages = {};

io.on("connection", (socket) => {

  console.log("A user connected");
  socket.on("join", (userId) => {
    socket.join(userId);
    users[userId] = socket; // Store the user ID and socket connection
    

    // Check if there are any offline messages for the user
    if (offlineMessages[userId]) {
      offlineMessages[userId].forEach((message) => {
        socket.emit("GetMessage", message); // Send the offline messages to the user
      });
      delete offlineMessages[userId]; // Remove the offline messages after sending
    }
  });

  socket.on('create-namespace', (nameSpace) => {
    const namespace = io.of(`/${nameSpace}`);
    console.log(`Namespace ${nameSpace} created`);
    namespace.on('connection', (namespaceSocket) => {
      console.log(`A user connected to namespace ${nameSpace}`);
    })
  })

  socket.on("SendMessage", (data) => {
    const { senderId, recipientId, message } = data;
    const rooms = Array.from(socket.rooms)
    const senderSocket = users[senderId];
    console.log(socket.rooms);
    //if(rooms.includes('ChatGroup'))
      //socket.to('ChatGroup').emit('GetMessage', message);
    const recipientSocket = users[recipientId];

    if (senderSocket) {
      senderSocket.emit("GetMessage", message); // Send the message to the sender
    }

    if (recipientSocket) {
      recipientSocket.emit("GetMessage", message); // Send the message to the recipient
    } else {
      // Store the message for the offline recipient
      if (!offlineMessages[recipientId]) {
        offlineMessages[recipientId] = [];
      }
      offlineMessages[recipientId].push(message);
    }
  });

  socket.on('logout', (userId) => {
    delete users[userId];
    socket.leave(userId);
    
  })

  socket.on('CreateRoom', (roomName) => {
    const roomId = '#1233'
    
    socket.join(roomId);
    console.log('Room created')

  })
 
  socket.on('JoinRoom', (userId) => {
    socket.join('ChatGroup');
    console.log('User joined room');
    


  })

  socket.on('Hello', (arg1, arg2, callback) => {
    console.log(arg1)
    console.log(arg2)
    callback({
      status: "ok",
    })

  })
  

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    // Remove the user from the stored object or map
    const userId = Object.keys(users).find((key) => users[key] === socket);
    if (userId) {
      delete users[userId];
    }
  });
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
*/