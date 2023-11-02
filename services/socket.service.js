// // socketService.js
// const { Server } = require('socket.io');
// let colors = require('colors');
// let os = require('os');
// let connectedUsers = [];
// const roomMessages = {};
// const users = [];
// const socketToRoom = {};
// const rooms = [];

// // Function to initialize the Socket.IO server
// function initializeSocketServer(httpServer) {
//     const io = new Server(httpServer);
//     // Socket.IO event handling
//     io.on('connection', async (socket) => {
//         function log() {
//             var array = ['Message from server:'];
//             array.push.apply(array, arguments);
//             socket.emit('log', array);
//         }
//         //console.log("Socket User Id ", socket.handshake.auth.token ?? "");

//         //get token from user handshake
//         var userId = socket.handshake.auth.token;

//         //set user is Online & broadcast user is Online

//         socket.broadcast.emit("userOnline", { userId: userId });

//         socket.on("setup", (userData) => {
//             socket.join(userData._id);
//             rooms.add(userData._id);
//             socket.emit("connected");
//         });

//         socket.on('joinRoom', (room) => {
//             console.log(`Client joined room: ${room}`);
//             socket.join(room);
//         });

//         socket.on("msgSend", (data) => {
//             // spread data
//             const { room, message } = data;
//             // spread message
//             const { chatId, content, content_type, createdBy, readBy } = message;
//             socket.to(room).emit("msgReceive", data);
//         });

//         socket.on("msgSendText", async (socketData) => {
//             // spread data
//             const { room, message } = socketData;
//             // spread message
//             const { chatId, content, content_type, createdBy, readBy } = message;
//             // save document
//             const messageBy = await UserModel.findOne({ _id: createdBy });
//             //msg
//             const msg = await MessageModel.create({
//                 chatId, content, content_type, createdBy, readBy
//             });
//             if (msg) {
//                 const result = {
//                     room,
//                     message: {
//                         messageId: msg._id,
//                         chatId: msg.chatId,
//                         file: msg.file,
//                         content: msg.content,
//                         content_type: msg.content_type,
//                         createdBy: {
//                             _id: messageBy._id,
//                             first_Name: messageBy.first_Name,
//                             last_Name: messageBy.last_Name,
//                             avtar: messageBy.avtar
//                         },
//                         readBy: msg.readBy,
//                         createdAt: msg.createdAt
//                     }
//                 }

//                 await ChatModel.findOneAndUpdate({ _id: chatId }, { $set: { latestMessage: msg._id } });

//                 //console.log(result);

//                 // emit to room
//                 socket.to(room).emit("msgReceive", result);
//             }
//         });

//         socket.on("messgeRead", async (data) => {
//             const { room, receivedBy, chatId, messageId } = data;
//             //console.log("data", data);
//             const result = await MessageModel.findOneAndUpdate(
//                 { _id: messageId, chatId: chatId }, // Find the document using the specified conditions
//                 { $push: { readBy: receivedBy } }, // Use $push to add a new element to the "readBy" array
//                 { new: true } // Return the updated document after the update is applied
//             );
//             //console.log("message read", result);
//         });

//         socket.on("messgeReadAll", async (data) => {
//             const { room, receivedBy, chatId, } = data;
//             //console.log("data", data);
//             const result = await MessageModel.updateMany(
//                 { chatId: chatId, readBy: { $nin: [receivedBy] } }, // Find the document using the specified conditions
//                 { $push: { readBy: receivedBy } }, // Use $push to add a new element to the "readBy" array
//                 { new: true } // Return the updated document after the update is applied
//             );
//             //console.log("message read", result);
//         });

//         socket.on('message', function (message) {
//             log('Client said: ', message);
//             // for a real app, would be room-only (not broadcast)
//             socket.broadcast.emit('message', message);
//         });

//         //diconnection
//         socket.on("disconnect", async (data) => {
//             // get token from user handshake
//             var userId = socket.handshake.auth.token;
//             // set user is offline
//             //await UserModel.findOneAndUpdate({ _id: userId }, { $set: { "isOnline": "0" } });
//             // emit to offline
//             socket.broadcast.emit("userOffline", { userId: userId });

//             const roomID = socketToRoom[socket.id];
//             let room = users[roomID];
//             if (room) {
//                 room = room.filter(id => id !== socket.id);
//                 users[roomID] = room;
//             }
//         });
//     });
//     return io;
// }

// module.exports = initializeSocketServer;
const MessageModel = require("../models/Message.Model");
const UserModel = require("../models/User.Model");
const TeamModel = require("../models/Team.Model");
const { Server } = require("socket.io");
let colors = require("colors");
let os = require("os");
let connectedUsers = [];
const roomMessages = {};
const users = [];
const socketToRoom = {};
const rooms = [];

// Function to initialize the Socket.IO server
function initializeSocketServer(httpServer) {
  const io = new Server(httpServer);
  // Socket.IO event handling
  io.on("connection", async (socket) => {
    function log() {
      var array = ["Message from server:"];
      array.push.apply(array, arguments);
      socket.emit("log", array);
    }
    //console.log("Socket User Id ", socket.handshake.auth.token ?? "");

    //get token from user handshake
    var userId = socket.handshake.auth.token;

    //set user is Online & broadcast user is Online

    socket.broadcast.emit("userOnline", { userId: userId });

    socket.on("setup", (userData) => {
      socket.join(userData._id);
      rooms.push(userData._id);
      socket.emit("connected", "this user connected to the room");
    });

    socket.on("joinRoom", (room) => {
      console.log(`Client joined room: ${room}`);
      socket.join(room);
    });

    socket.on("msgSend", (data) => {
      // spread data
      const { room, message } = data;
      // spread message
      console.log(data, "here the data ");
      // const { chatId, content, content_type, createdBy, readBy } = message;
      socket.to(room).emit("msgImage", data.message);
    });

    socket.on("msgSendText", async (socketData) => {
      // spread data
      const { room, message } = socketData;
      // spread message
      console.log(socketData, "Soket data ");
      const { chatId, content, content_type, createdBy, readBy } = message;
      // save document
      const messageBy = await UserModel.findOne({ _id: createdBy });
      //msg
      console.log(messageBy, "messs");
      const msg = await MessageModel.create({
        chatId,
        content,
        content_type,
        createdBy,
        readBy,
      });
      if (msg) {
        const result = {
          room,
          message: {
            messageId: msg._id,
            chatId: msg.chatId,
            file: msg.file || [],
            content: msg.content,
            content_type: msg.content_type,
            createdBy: {
              _id: messageBy._id,
              first_Name: messageBy.first_Name,
              last_Name: messageBy.last_Name,
              avtar: messageBy.avtar,
            },
            readBy: msg.readBy,
            createdAt: msg.createdAt,
          },
        };
        // console.log(result, "this is a message model", msg);
        await TeamModel.findOneAndUpdate(
          { _id: chatId },
          { $set: { latestMessage: msg._id } }
        );

        //console.log(result);

        // emit to room
        socket.emit("msgReceive", result.message);
        socket.to(room).emit("msgReceive", result);
      }
    });

    socket.on("messgeRead", async (data) => {
      const { room, receivedBy, chatId, messageId } = data;
      //console.log("data", data);
      const result = await MessageModel.findOneAndUpdate(
        { _id: messageId, chatId: chatId }, // Find the document using the specified conditions
        { $push: { readBy: receivedBy } }, // Use $push to add a new element to the "readBy" array
        { new: true } // Return the updated document after the update is applied
      );
      //console.log("message read", result);
    });

    socket.on("messgeReadAll", async (data) => {
      const { room, receivedBy, chatId } = data;
      //console.log("data", data);
      const result = await MessageModel.updateMany(
        { chatId: chatId, readBy: { $nin: [receivedBy] } }, // Find the document using the specified conditions
        { $push: { readBy: receivedBy } }, // Use $push to add a new element to the "readBy" array
        { new: true } // Return the updated document after the update is applied
      );
      //console.log("message read", result);
    });

    socket.on("message", function (message) {
      log("Client said: ", message);
      // for a real app, would be room-only (not broadcast)
      socket.broadcast.emit("message", message);
    });

    //diconnection
    socket.on("disconnect", async (data) => {
      // get token from user handshake
      var userId = socket.handshake.auth.token;
      // set user is offline
      //await UserModel.findOneAndUpdate({ _id: userId }, { $set: { "isOnline": "0" } });
      // emit to offline
      socket.broadcast.emit("userOffline", { userId: userId });

      const roomID = socketToRoom[socket.id];
      let room = users[roomID];
      if (room) {
        room = room.filter((id) => id !== socket.id);
        users[roomID] = room;
      }
    });
  });
  return io;
}

module.exports = initializeSocketServer;
