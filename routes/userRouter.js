const express = require("express");
const Notification = require("../models/notifcationModel");
const User = require("../models/userModel");

const router = express.Router();

router.get('/user', async (req, res) => {
    try {
        if (req.query.search) {
            const user = await User.find({
                $or: [
                    {
                        name: { $regex: req.query.search, $options: "i" },
                        username: { $regex: req.query.search, $options: "i" }
                    }
                ]
            }, (error, users) => {
                if (users) {
                    var usersFiltred = users.filter((value, index, users) => {
                        return value._id.toString() != req.user._id.toString();
                    })
                    return res.status(200).send(usersFiltred);
                }
                if (error) {
                    throw Error(error);
                }
                else res.status(200).send([]);

            })


        }
        else users = await User.find((error, users) => {
            if (users) {
                var usersFiltred = users.filter((value, index, users) => {
                    return value._id.toString() != req.user._id.toString();
                })
                return res.status(200).send(usersFiltred);
            }
            if (error) {
                throw Error(error)
            }
        })

    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
});

router.post("/user/register", async (req, res) => {
    try {
        const chekUser = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
        if (chekUser) {
            if (chekUser.email == req.body.email) {
                throw Error("this is email already in use")
            }
            else {
                throw Error("this usename already exist");
            }
        }
        const user = await User.create(req.body);
        const token = await user.genrateToken();

        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send({ error: `${error.message}` });
    }
});

router.post('/user/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findUserByEmail(email, password);
        const token = await user.genrateToken();
        res.status(200).send({ user, token });

    } catch (error) {
        res.status(400).send({ error: `${error.message}` })
    }
})

router.get('/user/:id/profile', async (req, res) => {
    try {
        const users = await User.findById(req.params.id).select('-password -likes -retweets');
        res.status(200).send(users);

    } catch (error) {
        res.status(400).send({ error: `${error.message}` })
    }
})

router.put('/user/:id/follow', async (req, res) => {
    try {
        const isFollwed = req.user.following.includes(req.params.id);
        if (!isFollwed) {
            await User.findByIdAndUpdate(req.params.id, { $addToSet: { follower: req.user.id } });
            await req.user.updateOne({ $addToSet: { following: req.params.id } });
            Notification.createNotification('follow', req.user._id, req.params.id, req.user._id);
        }
        else {
            await User.findByIdAndUpdate(req.params.id, { $pull: { follower: req.user.id } });
            await req.user.updateOne({ $pull: { following: req.params.id } });
            //   console.log(req.user)

        }
        res.status(200).send({});

    } catch (error) {
        res.status(400).send({ error: `${error.message}` })
    }
})



router.put('/user/updateProfile', async (req, res) => {
    console.log(req.query)
    try {
        if (req.query.name) {

            await req.user.update({
                name: req.query.name,
            })
            if (req.query.profilePic) {

                await req.user.update({
                    name: req.query.name,
                    profilePic: req.query.profilePic
                })
            }
        }
        else if (req.query.profilePic) {

            await req.user.update({
                profilePic: req.query.profilePic
            })
        }
        res.status(200).send({});

    } catch (error) {
        res.status(400).send({ error: `${error.message}` })
    }
})
router
module.exports = router;