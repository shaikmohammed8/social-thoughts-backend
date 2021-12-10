const { query } = require("express");
const express = require("express");
const router = express.Router();
const Chat = require('../models/ChatModel');

router.post('/', async (req, res) => {
    try {

        req.body.users.push(req.user._id);
        const chat = await Chat.create(req.body);
        res.status(200).send(chat);
    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
});

router.get('/', async (req, res) => {
    try {
        if (req.query.isGroup == 'true') {
            const chat = await Chat.find({ isGroupChat: true, users: { $in: [req.user._id] } }).select('-createdAt -updatedAt -__v -users')
                .populate({ path: 'lastMessage', select: 'message updatedAt seenBy' })
                .limit(25)
                .skip(Number.parseInt(req.query.skip));
            res.status(200).send(chat);
        }
        else {
            var chat = await Chat.find({ isGroupChat: false, users: { $in: [req.user._id] } }).select('-createdAt -updatedAt -__v ')
                .populate({ path: 'lastMessage', select: 'message updatedAt seenBy' }).populate({
                    path: 'users', select: 'name profilePic',
                })
                .limit(25)
                .skip(Number.parseInt(req.query.skip));;
            res.status(200).send(chat);
        }
    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
})

router.put('/seen', async (req, res) => {
    try {
        if (req.query.chatId) {
            var chat = await Chat.findById(req.query.chatId);
            await chat.updateOne({ $addToSet: { seenBy: req.user._id } });
            res.sendStatus(200);
        }

        else {
            var chat = await Chat.findOne({
                isGroupChat: false,
                users: { $size: 2 }
            }
            ).or([
                { users: { $eq: [req.query.userId, req.user._id] } },
                { users: { $eq: [req.user._id, req.query.userId] } }
            ]);
            await chat.updateOne({ $addToSet: { seenBy: req.user._id } });
            res.sendStatus(200);
        }
    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
})


module.exports = router;