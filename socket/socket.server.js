// socketService.js

const { Server } = require('socket.io');
const MessageModel = require("../models/Message.Model");
const UserModel = require("../models/User.Model");
const TeamModel = require('../models/Team.Model');

// Initialize an empty object to store room messages
const roomMessages = {};
const users = [];
const socketToRoom = {};
let connectedUsers = [];
let rooms = [];

// Function to initialize the Socket.IO server
function initializeSocketServer(httpServer) {
    const io = new Server(httpServer);

    // Socket.IO event handling
    io.on('connection', async (socket) => {

        function log() {
            var array = ['Message from server:'];
            array.push.apply(array, arguments);
            socket.emit('log', array);
        }

        //console.log("Socket User Id ", socket.handshake.auth.token ?? "");

        //get token from user handshake
        var userId = socket.handshake.auth.token;

        //set user is Online
        await UserModel.findOneAndUpdate({ _id: userId }, { $set: { "isOnline": "1" } });

        //broadcast user is Online

        socket.broadcast.emit("userOnline", { userId: userId });

        socket.on("setup", (userData) => {
            socket.join(userData._id);
            rooms.add(userData._id);
            socket.emit("connected");
        });

        socket.on('joinRoom', (room) => {
            console.log(`Client joined room: ${room}`);
            socket.join(room);
        });

        socket.on("msgSend", (data) => {
            // spread data 
            const { room, message } = data;
            // spread message 
            const { chatId, content, content_type, createdBy, readBy } = message;
            socket.to(room).emit("msgReceive", data);
        });

        socket.on("msgSendText", async (socketData) => {
            // spread data 
            const { room, message } = socketData;
            // spread message 
            const { teamId, content, content_type, createdBy, readBy, replyMessageId } = message;
            // save document
            const messageBy = await UserModel.findOne({ _id: createdBy });
            //msg
            const msg = await MessageModel.create({
                teamId, content, content_type, createdBy, readBy, replyMessageId
            });
            if (msg) {
                let replyMsg = {
                    messageId: "",
                    teamId: "",
                    file: null,
                    content: "",
                    content_type: "",
                    createdAt: ""
                };

                const msgSent = await MessageModel.findOne({ _id: msg._id }).populate({ path: "createdBy", select: "_id userCode role name avatar isOnline" }).populate({ path: "replyMessageId", select: "_id teamId file content content_type createdAt" });

                if (msgSent.replyMessageId) {
                    replyMsg = {
                        messageId: msgSent.replyMessageId._id,
                        teamId: msgSent.replyMessageId.teamId,
                        file: msgSent.replyMessageId.file,
                        content: msgSent.replyMessageId.content,
                        content_type: msgSent.replyMessageId.content_type,
                        createdAt: msgSent.replyMessageId.createdAt
                    }
                }

                const result = {
                    room,
                    message: {
                        messageId: msgSent._id,
                        teamId: msgSent.teamId,
                        file: msgSent.file,
                        content: msgSent.content,
                        content_type: msgSent.content_type,
                        createdBy: {
                            _id: msgSent.createdBy._id,
                            userCode: msgSent.createdBy.userCode,
                            name: msgSent.createdBy.name,
                            role: msgSent.createdBy.role,
                            avatar: msgSent.createdBy.avatar,
                            isOnline: msgSent.create.isOnline
                        },
                        readBy: msg.readBy,
                        createdAt: msg.createdAt,
                        replyMessageId: replyMsg
                    }
                }
                await TeamModel.findOneAndUpdate({ _id: teamId }, { $set: { latestMessage: msg._id } });
                // emit to room
                socket.to(room).emit("msgReceive", result);
            }
        });

        socket.on("messgeRead", async (data) => {
            const { room, receivedBy, teamId, messageId } = data;
            //console.log("data", data);
            const result = await MessageModel.findOneAndUpdate(
                { _id: messageId, teamId: teamId }, // Find the document using the specified conditions
                { $push: { readBy: receivedBy } }, // Use $push to add a new element to the "readBy" array
                { new: true } // Return the updated document after the update is applied
            );
            //console.log("message read", result);
        });

        socket.on("messgeReadAll", async (data) => {
            const { room, receivedBy, teamId } = data;
            //console.log("data", data);
            const result = await MessageModel.updateMany(
                { teamId: teamId, readBy: { $nin: [receivedBy] } }, // Find the document using the specified conditions
                { $push: { readBy: receivedBy } }, // Use $push to add a new element to the "readBy" array
                { new: true } // Return the updated document after the update is applied
            );
            //console.log("message read", result);
        });

        //diconnection
        socket.on("disconnect", async (data) => {
            // get token from user handshake
            var userId = socket.handshake.auth.token;
            // set user is offline
            await UserModel.findOneAndUpdate({ _id: userId }, { $set: { "isOnline": "0" } });
            // emit to offline
            socket.broadcast.emit("userOffline", { userId: userId });

            const roomID = socketToRoom[socket.id];
            let room = users[roomID];
            if (room) {
                room = room.filter(id => id !== socket.id);
                users[roomID] = room;
            }
        });

    });

    return io;
}

module.exports = initializeSocketServer;
