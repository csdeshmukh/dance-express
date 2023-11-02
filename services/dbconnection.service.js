const mongoose = require("mongoose");
require('dotenv').config();
var colors = require("colors");
colors.enable();

const mongooseConnect = () => {
    let connecting = setTimeout(() => console.log("Connecting to DB...".green), 1000);
    mongoose
        .connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            clearTimeout(connecting);
            console.log("Connected to DB".green);
        })
        .catch((err) => {
            console.log(err);
            clearTimeout(connecting);
            console.log("Unable to connect to DB".yellow);
            console.log("Retrying in 10 seconds".blue);
            setTimeout(mongooseConnect, 10 * 1000);
        });
};

mongooseConnect();
//  connectDB: () => {
//    mongoose
//      .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
//      .then(() => console.log("Connected to MongoDB"))
//      .catch((err) => console.log("Failed to connect to MongoDB", err));
//  };