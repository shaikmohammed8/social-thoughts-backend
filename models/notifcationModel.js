const mongoose = require('mongoose');

const io = require('../app')
const socketHandler = require('../socket/socket.io');

const notificationSchema = mongoose.Schema({
    type: { type: String, required: true },
    sender: { type: mongoose.Types.ObjectId, ref: "User" },
    reciver: { type: mongoose.Types.ObjectId, ref: "User" },
    postId: { type: mongoose.Types.ObjectId, ref: "Post" },
    seen: { type: Boolean, default: false },
    contentId: mongoose.Types.ObjectId,

}, { timestamps: true });

notificationSchema.statics.createNotification = async function (type, sender, reciver, contentId, postId) {

    try {
        if (sender.toString() == reciver.toString()) {
            return;
        }

        const notification = {
            type: type,
            sender: sender,
            reciver: reciver,
            contentId: contentId,
            postId: postId
        };
        console.log(notification);
        await Notification.findOneAndUpdate(notification, notification, { upsert: true });
        // await Notification.create(notification);
    } catch (error) {
        console.log(error);
    }
}
var Notification = mongoose.model("Notification", notificationSchema);
Notification.watch().on('change', async data => {

    try {
        if (data['operationType'] == 'replace' || data['operationType'] == 'update' ||
            data['operationType'] == 'insert' || data['operationType'] == 'delete') {

            const notification = await Notification.findById(data.documentKey._id)
                .populate({ path: "sender", select: "name profilePic" })

                .populate({ path: "postId", select: "photo -_id" })
            var list = socketHandler.users;

            if (notification) {
                if (list[notification.sender._id] != undefined) {
                    io.io.to(list[notification.sender._id]).emit('notification:update', {
                        notification: notification,
                        operation: data.operationType,
                        documentId: data.documentKey._id
                    });

                }

            }
        }
        else return;
    }
    catch (error) {
        console.log(error);
    }
});
module.exports = Notification;

