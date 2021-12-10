const { use } = require("../routes/userRouter");

var users = []


module.exports.socketHandler = function (io, socket) {


    socket.on('join', async (id) => {
        users[id] = socket.id;

        socket.user = id;
        console.log(users);
    })
    socket.on('test', async (data) => {
        console.log(socket.id);
        io.emit('test', data);

    });
    socket.on('like', async (post) => {
        socket.broadcast.emit('like', post);
    });
    socket.on('retweet', async (post) => {
        console.log(post);
        socket.broadcast.emit('retweet', post);
    });
    // socket.on('newMessage', async (post) => {
    //     var chatUsers = post.users;
    //     chatUsers.forEach(element => {
    //         if (users[element._id] != undefined) {
    //             if (users[element._id] == socket.id) {

    //             }
    //             else {
    //                 console.log(users[element._id]);
    //                 io.to(users[element._id]).emit('newMessage', post);
    //             }
    //         }
    //     });
    // });


}

module.exports.users = users;