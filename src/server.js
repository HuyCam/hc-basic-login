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

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

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
        case 3:
            res.send(loginSimulation[2]);
            break;
    }
})
/* End simulation process*/

io.on('connection', (socket) => {
    // when user log in, add user to current online user
    socket.on('addUser', (userData) => {
        const { user: userID} = userData;
        users.set(userID, {
            socketID: socket.id
        })
        
        console.log('start Map iteration');
        users.forEach(val => console.log(val));
    })
    socket.on('message', (body, callback) => {
        console.log('got message',body);

        /*
        1. get that user in the user Map
        2. send message to that user
        3. If found that user, emit event to that user
        4. If not found that user, do nothing

        updating database is the responsibility of the user to send AJAX call to server
        */

        // 1. get that user in the user Map
        const receiver = users.get(body.receiverID);

        // 2. send message to that user
        if (receiver) {
            io.to(receiver.socketID).emit('message', body);
            callback(null,'message has been sent to receiver');
        } else {
            callback(null, 'User is currently offline. Message is sent to receiver.')
        }
        
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

        users.delete(userID);
    })
})

module.exports = server;