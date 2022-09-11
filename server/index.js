const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const { userJoin, getRoomUsers } = require('./utils/users');
const formatMessage = require('./utils/messages');

const PORT = 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Point to client side
app.use(express.static(path.join(__dirname, '../client/public')));


// Run when a client connects
io.on('connection', (socket) => {

    socket.on('joinRoom', ({ username, room }) => {

        // Add new user to the room
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        socket.emit('message', formatMessage('Admin', 'hi there'));

        // Broadcast to a room when a user connects
        socket.broadcast.to(user.room).emit(
            'message',
            formatMessage('Admin', `${user.username} has joined the chat`)
        );

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    socket.on('disconnect', (reason) => {
        console.log(reason);
    });

});

server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Listening on port: ${PORT}`);
});