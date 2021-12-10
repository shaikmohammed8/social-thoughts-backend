
const express = require("express");
const Notification = require("../models/notifcationModel");
const router = express.Router();

router.get("/", async (req, res) => {
    try {

        var notificaiotns = await Notification.find({ reciver: req.user._id })
            .populate({ path: "sender", select: "name profilePic" })
            .populate({ path: "postId", select: "photo -_id" })
            .limit(25)
            .skip(Number.parseInt(req.query.skip))
            .sort({ updatedAt: -1 });
        res.send(notificaiotns);
    } catch (error) {
        res.status(500).send({ error: `${error.message}` });
    }
});


module.exports = router;