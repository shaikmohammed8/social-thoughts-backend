const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: { required: true, type: String, trim: true, maxlength: 15 },
    username: { required: true, type: String, unique: true, trim: true, maxlength: 15 },
    password: { required: true, type: String, minLength: 6, maxlength: 200 },
    email: { required: true, type: String, unique: true, maxlength: 40 },
    profilePic: { type: String, default: "https://res.cloudinary.com/ddafqnkvv/image/upload/v1629303235/profile/twiiter_agebux.png" },
    likes: [{ type: mongoose.Types.ObjectId, ref: "Post" }],
    retweets: [{ type: mongoose.Types.ObjectId, ref: "Post" }],
    follower: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    token: { type: String }
}, { timestamps: true });



userSchema.pre('save', async function (next) {
    if (this.isModified("password")) {

        try { this.password = await bcrypt.hash(this.password, 8); }
        catch (e) {
            console.log(e);
            throw Error(e.message);
        }
    }
    next();
});

userSchema.methods.genrateToken = async function () {
    try {
        const token = JWT.sign({ _id: this._id.toString() }, process.env.secret);
        this.token = token;
        await this.save();
        return token;
    }
    catch (e) {
        console.log(e);
        throw Error(e.message);
    }

}

userSchema.statics.findUserByEmail = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) {
        throw Error("cant find user by this email");
    }
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
        throw Error("password is wrong");
    }
    return user
}

const User = mongoose.model("User", userSchema);
module.exports = User;