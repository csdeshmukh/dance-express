const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const socketService = require('./services/socket.service');
//connect to database
require("./services/dbconnection.service");
//init express app
const app = express();
const http = require('http').createServer(app);
const routes = require("./routes/index.routes");

const d1 = './uploads';
if (!fs.existsSync(d1)) {
    fs.mkdirSync(d1);
}

const d2 = './uploads/chatmedia';
if (!fs.existsSync(d2)) {
    fs.mkdirSync(d2);
}

const d3 = './uploads/chatmedia/temp';
if (!fs.existsSync(d3)) {
    fs.mkdirSync(d3);
}

// for parsing application/json
app.use(bodyParser.json())
// for parsing multipart-formdata
app.use(bodyParser.urlencoded({ extended: true }))
// cors Middleware
app.use(cors({
    origin: "*"
}));
// cookie parser 
app.use(cookieParser());

//define port
const PORT = process.env.PORT || 3501;

//socket service initializer
const io = socketService(http);
app.set('socketio', io);

//access all chat media files 
app.use("/uploads", express.static("./uploads"));
app.use("/uploads/chatmedia", express.static("./uploads/chatmedia"));

//check server is running
app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use(routes);

http.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`)
});