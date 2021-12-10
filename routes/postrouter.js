const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/notifcationModel");
const Post = require("../models/PostModel");
const User = require("../models/userModel");

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        if (req.query.search) {
            const post = await Post.find({
                content: { $regex: req.query.search, $options: "i" },
            }).select('-updatedAt -reply').populate({ path: 'postBy', select: 'name username profilePic' }).sort({ createdAt: -1 }).
                limit(25).skip(Number.parseInt(req.query.skip));
            res.status(200).send(post);
        }
        else {
            var post = await Post.find().select('-updatedAt -reply').populate({ path: 'postData', select: '-reply' }).populate({ path: 'postBy', select: 'name username profilePic' }).sort({ createdAt: -1 }).
                limit(25).skip(Number.parseInt(req.query.skip));
            post = await Post.populate(post, { path: 'postData.postBy', select: 'name username profilePic' });

            res.status(200).send(post);
        }
    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
})

router.get('/:id', async (req, res) => {
    try {
        var post = await Post.findById(req.params.id).select('-updatedAt').populate({ path: 'postData', select: '-reply' }).populate({ path: 'postBy', select: 'name username profilePic' });
        post = await Post.populate(post, { path: 'postData.postBy reply.userId ', select: 'name username profilePic ' });

        res.status(200).send(post);
    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
})

router.get('/following/post', async (req, res) => {
    try {
        var post = await Post.find({ postBy: { $in: req.user.following } }).select('-updatedAt -reply').populate({ path: 'postData', select: '-reply' }).populate({ path: 'postBy', select: 'name username profilePic' }).sort({ createdAt: -1 }).
            limit(25).skip(Number.parseInt(req.query.skip)).sort({ 'updatedAt': -1 });
        post = await Post.populate(post, { path: 'postData.postBy', select: 'name username profilePic' });

        res.send(post);
    } catch (error) {
        console.error(error);
    }
})

router.post('/', async (req, res) => {
    try {
        const post = await Post.create({ ...req.body, postBy: req.user._id });

        res.status(201).send(post);
    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
})

router.put('/:id/like', async (req, res) => {
    try {

        await req.user.updateOne({ $addToSet: { likes: req.params.id } }, { new: true });
        const post = await Post.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.user._id } }, { new: true });
        Notification.createNotification('like', req.user._id, post.postBy, post._id, post._id);
        res.status(200).send(post);

    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
});
router.put('/:id/unlike', async (req, res) => {
    try {
        await req.user.updateOne({ $pull: { likes: req.params.id } }, { new: true });
        const post = await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } }, { new: true })
        res.status(200).send(
            post
        )
    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
});

router.put('/:id/retweet', async (req, res) => {
    try {
        const post = await Post.findOne({ retweets: req.user._id, postData: req.params.id });

        if (!post) {
            const newPost = await Post.create({ postData: req.params.id, retweets: req.user._id, postBy: req.user._id });
            const user = await req.user.updateOne({ $addToSet: { retweets: newPost._id } }, { new: true });
            var npost = await Post.findByIdAndUpdate(req.params.id, { $addToSet: { retweets: req.user._id } }, { new: true });
            Notification.createNotification('retweet', req.user._id, npost.postBy, npost._id, post._id);
            res.status(200).send({ 'retweets': npost.retweets, '_id': npost._id });

        }
        else {

            await post.delete();
            const user = await req.user.updateOne({ $pull: { retweets: post._id } }, { new: true });
            var npost = await Post.findByIdAndUpdate(req.params.id, { $pull: { retweets: req.user._id } }, { new: true });
            res.status(200).send({ 'retweets': npost.retweets, '_id': npost._id });
        }

    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
})

router.put('/:id/reply', async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);
        if (!post) { throw Error("no post found by this id"); }
        if (req.query.delete == 'true') {
            const newPost = await post.updateOne({ $pull: { reply: { _id: req.query.replyId } }, }, { new: true });
            return res.status(200).send({});
        }
        const replyID = mongoose.Types.ObjectId();
        const newPost = await Post.findByIdAndUpdate(req.params.id, { $addToSet: { reply: { _id: replyID, reply: req.body.reply, userId: req.user._id } } }, { new: true })
            .select('reply').populate({ path: 'reply.userId', select: 'name username profilePic' });

        var reply = newPost.reply.find((function (element) {

            return element._id.toString() == replyID.toString();
        }));

        Notification.createNotification('reply', req.user._id, newPost.postBy, newPost._id, newPost._id, post._id);
        res.status(200).send(
            reply
        );
    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
})

router.get('/:id/getPosts', async (req, res) => {
    try {

        var post = await Post.find({ postBy: req.params.id }).select('-updatedAt -reply').populate({ path: 'postData', select: '-reply' }).populate({ path: 'postBy', select: 'name username profilePic' }).sort({ createdAt: -1 }).
            limit(25).skip(Number.parseInt(req.query.skip));
        post = await Post.populate(post, { path: 'postData.postBy', select: 'name username profilePic' });

        res.status(200).send(post);
    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
})

module.exports = router;







