const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Team = new Schema({
    teamCode: {
        type: String,
        default: "",
    },
    teamName: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    teamLogo: {
        type: String,
        default: ""
    },
    lastMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages"
    },
    isActive: {
        type: Number,
        default: 1
    },
    isDelete: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
    ],
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("teams", Team);