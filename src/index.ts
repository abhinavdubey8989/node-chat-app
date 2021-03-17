import express from 'express';
import path from 'path';
import http from 'http';
// const socketio = require('socket.io');
import socket from 'socket.io';



const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public');

const app = express();
const server = http.createServer(app);//express creates the server this way behind the scenes , to access sockets , we do it manually
const io = socket()


app.use(express.static(publicDirPath));

io.on('connection', () => {
    console.log('new socket conn');
});

server.listen(port, () => {
    console.log('server started at : ' + port)
});