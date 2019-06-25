const express = require('express');
require('./db/mongoose');
const cors = require('cors');

const socketio = require('socket.io');
const http = require('http');


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
})

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.emit('message', 'Hello Client from Server');

    socket.on('message', (body) => {
        console.log(body);
    })

    socket.on('messageAll', (content) => {
        io.emit('message', content);
    })
})

module.exports = server;


/* testing purpose */
// const Conversation = require('./models/conversation');

// const myFunc = async() => {
//     const con = await Conversation.findById("5d116bbe96cdd047600a42f9");

//     await con.populate('owners').execPopulate();

//     console.log(con);
// }

// myFunc();