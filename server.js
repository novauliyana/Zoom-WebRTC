const express = require('express');
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
var createUUID = function () {
    return "" + (Math.floor(1E7 * Math.random()).toString(16));
}

var userID = function () {
    return (Math.floor(1E7 * Math.random()).toString(16));
}


app.use('/peerjs', peerServer);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${createUUID()}`);
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})


io.on('connection', socket => {
    socket.on('join-room', (roomId, id) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', id);

        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message)
        })

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', id)
        })
    })
})




server.listen(process.env.PORT || 4040);