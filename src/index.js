// import express from 'express';
// import path from 'path';
// import http from 'http';
// // const socketio = require('socket.io');
// import socket from 'socket.io';

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const { getTextMessage, getUrlMessage } = require('./utils/messages');
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users');





//event names
const SERVER_LOCATION_EVENT = "serverLocationMsgEvent";
const CLIENT_LOCATION_EVENT = "clientLocationEvent";
const SERVER_NORMAL_EVENT = "serverNormalMsgEvent";
const CLIENT_NORMAL_EVENT = "clientNormalMsgEvent";
const JOIN_EVENT = "join";
const DISCONNECT_EVENT = "disconnect";
const ROOM_DATA_CHANGE_EVENT = "changed"; //fired when user joins/leaves a chat room





//setup of diectory and http server and socket
const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public');
const app = express();
const server = http.createServer(app);//express creates the server this way behind the scenes , to access sockets , we do it manually
const io = socketio(server);
app.use(express.static(publicDirPath));



io.on('connection', (socket) => {



    //when a user newly joins a chat room
    socket.on(JOIN_EVENT, (username, room, callBack) => {


        const obj = addUser(socket.id, username, room);
        if (obj.error) {
            return callBack(obj.error);
        }

        //down below we user obj.room and obj.username bcz those are trimmed values after call to addUser() 

        //current socket will joing only this room
        socket.join(obj.room);
        //when new client joins , STEP-1: send him a welcome msg 
        socket.emit(SERVER_NORMAL_EVENT, getTextMessage("Admin", "Welcome-to-the-chat-room"));
        //and STEP-2: notify everyone else that new client has joined
        socket.broadcast.to(obj.room).emit(SERVER_NORMAL_EVENT, getTextMessage("Admin", `${obj.username} has joined !`));


        const roomData = {
            roomName: obj.room,
            users: getUsersInRoom(obj.room)
        };
        io.to(obj.room).emit(ROOM_DATA_CHANGE_EVENT, roomData);

        callBack(); //if user successfull joins , callback is called with null args
    });

    //when a user sends a text message
    socket.on(CLIENT_NORMAL_EVENT, (msg, callBack) => {
        const user = getUser(socket.id);
        if (!user) {
            return;
        }
        io.to(user.room).emit(SERVER_NORMAL_EVENT, getTextMessage(user.username, msg));
        callBack('time-stamp');
    });


    //when a client wants to share his location
    socket.on(CLIENT_LOCATION_EVENT, (coords, callBack) => {
        const user = getUser(socket.id);
        if (!user) {
            return;
        }
        io.to(user.room).emit(SERVER_LOCATION_EVENT, getUrlMessage(user.username, coords));
        callBack();
    });



    //when single client disconnects
    socket.on(DISCONNECT_EVENT, () => {
        const removedUser = removeUser(socket.id);
        if (removedUser) {
            //notify everyone remaining 
            io.to(removedUser.room).emit(SERVER_NORMAL_EVENT, getTextMessage("Admin", `${removedUser.username} has left !`));
            const roomData = {
                roomName: removedUser.room,
                users: getUsersInRoom(removedUser.room)
            };
            io.to(removedUser.room).emit(ROOM_DATA_CHANGE_EVENT, roomData);
        }
    });


});


server.listen(port, () => {
    console.log('server started at : ' + port)
});