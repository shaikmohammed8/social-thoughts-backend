const express = require("express");
const Message = require('../models/MessageModel');
const Chat = require('../models/ChatModel');
const mongoose = require("mongoose");
const router = express.Router();


router.get('/:id/groupMessages', async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.id }).select('-createdAt').populate(
            { path: 'sender', select: "name" }
        ).sort({ updatedAt: -1 }).limit(35).skip(Number.parseInt(req.query.skip));
        res.status(200).send(messages);

    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
});

router.get('/:id/messages', async (req, res) => {
    try {
        var chat = await Chat.findOne({
            isGroupChat: false,
            users: { $size: 2 }
        }
        ).or([
            { users: { $eq: [req.params.id, req.user._id] } },
            { users: { $eq: [req.user._id, req.params.id] } }
        ]);
        if (chat) {
            const messages = await Message.find({ chat: chat._id }).select('-createdAt').populate(
                { path: 'sender', select: "name" }
            ).sort({ updatedAt: -1 }).limit(30).skip(Number.parseInt(req.query.skip));

            res.status(200).send(messages);
        }
        else {
            res.status(200).send([]);
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: `${error.message}` });
    }
});


router.post('/', async (req, res) => {
    try {
        console.log(req.body);
        if (req.query.chatId) {

            console.log('group');
            var chat = await Chat.findById(req.query.chatId);
            const message = await Message.create({
                message: req.body.message,
                sender: req.user._id,
                isGroupchat: true,
                chat: chat._id,
                photo: req.body.photo,
                uuid: req.body.uuid
            });
            var c = await chat.updateOne({ lastMessage: message._id, seenBy: [req.user._id] });
            res.sendStatus(200);
        }
        else {
            const chat = await Chat.findOne({
                isGroupChat: false,
                users: { $size: 2 }
            }
            ).or([
                { users: { $eq: [req.query.id, req.user._id] } },
                { users: { $eq: [req.user._id, req.query.id] } }
            ]);

            if (chat) {
                const message = await Message.create({
                    message: req.body.message,
                    sender: req.user._id,
                    isGroupchat: false,
                    chat: chat._id,
                    photo: req.body.photo,
                    uuid: req.body.uuid,
                });

                var c = await chat.updateOne({ lastMessage: message._id, seenBy: [req.user._id] });

                res.sendStatus(200);
            }
            else {

                const users = [req.user._id, req.query.id];
                const chat = await Chat.create({
                    friend: req.query.id,
                    users: users,

                    isGroupchat: false
                });
                const message = await Message.create({
                    message: req.body.message,
                    sender: req.user._id,
                    isGroupchat: false,
                    chat: chat._id,
                    photo: req.body.photo,
                    uuid: req.body.uuid
                });
                var c = await chat.updateOne({ lastMessage: message._id, seenBy: [req.user._id] });
                res.sendStatus(200);
            }
        }
    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
});



module.exports = router;