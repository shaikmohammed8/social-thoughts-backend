const mongoose = require('mongoose');
const io = require('../app')
const postSchema = mongoose.Schema({
    content: { type: String, trim: true },
    postBy: { type: mongoose.Types.ObjectId, ref: "User" },
    pinned: { type: Boolean },
    likes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    retweets: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    photo: { type: String },
    postData: { type: mongoose.Types.ObjectId, ref: "Post" },
    reply: [{ reply: { type: String }, userId: { type: mongoose.Types.ObjectId, ref: "User" } }]

}, { timestamps: true });





const Post = mongoose.model("Post", postSchema);

module.exports = Post;