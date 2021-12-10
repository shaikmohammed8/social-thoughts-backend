const express = require('express');
const auth = require('./middleware/auth');

require('dotenv').config()
const router = require('./routes/userRouter');
require('./db/monogoose')
const postRouter = require('./routes/postrouter');
const chatRouter = require('./routes/chatrouter');
const notificationRoutes = require('./routes/notificationrouter');
const messageRouter = require('./routes/messageroter');
const app = express();
const port = 3000
const socketHandler = require('./socket/socket.io');
const Post = require('./models/PostModel');
const Message = require('./models/MessageModel');
const Chat = require('./models/ChatModel');

app.use(auth);
app.use(express.json())


const server = app.listen(port, () => {
    console.log(`${port}  is up`);
})

const io = require('socket.io')(server, { pingTimeout: 6000 });
io.on('connection', (socket) => {


    console.log('user connected');
    socketHandler.socketHandler(io, socket);
})

app.use(function (req, res, next) {
    req.io = io;
    next();
});


app.use(router);
app.use('/api/message', messageRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notification', notificationRoutes);
app.use("/api/posts", postRouter);

module.exports.io = io;