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
      user: '',                  
      pass: ''
    }
  })

  const mailOption = {
    from: '',
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



















