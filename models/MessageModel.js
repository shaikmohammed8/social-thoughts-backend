const mongoose = require('mongoose');
const io = require('../app');
const Chat = require('./ChatModel');
const socketHandler = require('../socket/socket.io')
const messageSchema = mongoose.Schema({
    sender: { type: mongoose.Types.ObjectId, ref: "User" },
    message: { type: String, trim: true },
    uuid: { type: String },
    photo: { type: String },
    chat: { type: mongoose.Types.ObjectId, ref: "Chat" },

}, { timestamps: true });



var Message = mongoose.model("Message", messageSchema);

Message.watch().on('change', async data => {
    try {
        if (data['operationType'] == 'replace' || 'update' || 'insert' || 'delete') {
            const message = await Message.findById(data.documentKey._id).select('-createdAt').populate(
                { path: 'sender', select: "name" }
            );
            const chat = await Chat.findById(message.chat._id);
            var list = socketHandler.users;
            chat.users.forEach(user => {
                if (list[user] != undefined) {
                    io.io.to(list[user]).emit('message:update', {
                        message,
                        operation: data.operationType,
                        documentId: data.documentKey._id
                    });

                }
            });
        }
        else return;
    } catch (error) {
        console.log(error);
    }

});

module.exports = Message;

