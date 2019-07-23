const express = require('express');
require('./db/mongoose');
const cors = require('cors');

const socketio = require('socket.io');
const http = require('http');

// import model
const User = require('./models/user');

// import router
const UserRouter = require('./routes/user');
const ConversationRouter = require('./routes/conversation');

const app = express();

const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use(cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// use router
app.use(UserRouter);
app.use(ConversationRouter);

// API live
app.get('/', (req, res) => {
    res.send('server is live');
});

const users = new Map();

/* Data testing purpose*/
const { loginSimulation } = require('./simulation/simulation');
/* end testing */

/* this is for simulation purpose. send token to user to bypass authentication */
app.get('/simulation', (req, res) => {
    switch(users.size) {
        case 0:
            res.send(loginSimulation[0])
            break;
        case 1:
            res.send(loginSimulation[1]);
            break;
        case 2:
            res.send(loginSimulation[2]);
            break;
    }
})
/* End simulation process*/

io.on('connection', (socket) => {
    // when user log in, add user to current online user
    socket.on('addUser', (userData) => {
        const { user: userID} = userData;
        users.set(socket.id, {
            socketID: socket.id,
            userID: userID
        })
        
        console.log('start Map iteration');
        users.forEach(val => console.log(val));
    })
    socket.on('message', async (body, callback) => {
        
        // updating database is the responsibility of the user to send AJAX call to server

        // 1. get all current online receivers in the user Map receivers may be just one person
        // but is online on multiple device
        let receivers = [], senders = [];

        // send message to all online receivers (receiver may online on many devices)
        let newIO = io;

        users.forEach(val => {
            if (val.userID === body.receiverID) {
                receivers.push(val);
            }
        });

        // get all senders online except the one send the message
        users.forEach(val => {
            if (val.userID === body.senderID && val.socketID !== socket.id) {
                senders.push(val);
            }
        })

        // if this is the first message between those two people
        const messageType = !body.init ? 'message' : 'initMsg';

        // 2. send message to that user if found
        if (receivers.length) {
            
            receivers.forEach(receiver => {
                newIO = newIO.to(receiver.socketID);
            });
        }
        
        // make all senders client update their UI and data
        console.log('sender length', senders.length);
        console.log('receiver length ', receivers.length);
        if (senders.length) {
            senders.forEach(sender => {
                newIO = newIO.to(sender.socketID);
            })
        }

        newIO.emit(messageType, body);

        callback(null,'message has been sent to receiver');
    })

    socket.on('messageAll', (content) => {
        io.emit('message', content);
    })

    socket.on('disconnect', () => {
        let userID;
        users.forEach((val, key) => {
            if (val.socketID === socket.id) {
                userID = key;
            }
        });

        users.delete(socket.id);
    })
})

module.exports = server;