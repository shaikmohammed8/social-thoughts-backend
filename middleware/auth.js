const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const auth = async (req, res, next) => {
    if (req.url == '/user/login' || req.url == '/user/register' || req.url == "/") {
        return next()
    }
    try {
        const token = req.header('Authorization').replace("Bearer ", "");
        const decode = jwt.verify(token, process.env.secret);
        const user = await User.findById(decode._id)
        if (!user) {
            throw Error();
        }
        if (user.token != token) {
            throw Error();
        }
        req.tokens = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ 'error': `please sing in` });
    }

}

module.exports = auth;