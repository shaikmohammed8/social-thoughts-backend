const mongoose = require('mongoose');

const io = require('../app')
const socketHandler = require('../socket/socket.io');

const chatSchema = mongoose.Schema({
    isGroupChat: { type: Boolean, default: false },
    seenBy: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    ChatName: { type: String, trim: true },
    photo: { type: String, default: "https://res.cloudinary.com/ddafqnkvv/image/upload/v1629303235/profile/twiiter_agebux.png" },
    lastMessage: { type: mongoose.Types.ObjectId, ref: "Message" },

}, { timestamps: true });



var Chat = mongoose.model("Chat", chatSchema);
Chat.watch().on('change', async data => {

    try {
        if (data['operationType'] == 'replace' || data['operationType'] == 'update' ||
            data['operationType'] == 'insert' || data['operationType'] == 'delete') {

            const chat = await Chat.findById(data.documentKey._id).select('-createdAt -updatedAt -__v ')
                .populate({ path: 'lastMessage', select: 'message updatedAt seenBy' }).populate({
                    path: 'users', select: 'name profilePic',
                });
            var list = socketHandler.users;

            if (chat) {
                console.log(data)
                chat.users.forEach(user => {
                    if (list[user._id] != undefined) {
                        io.io.to(list[user._id]).emit('chat:update', {
                            chat,
                            operation: data.operationType,
                            documentId: data.documentKey._id
                        });

                    }
                });
            }
        }
        else return;
    }
    catch (error) {
        console.log(error);
    }
});
module.exports = Chat;

