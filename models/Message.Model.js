const mongoose = require("mongoose");

const Message = mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "teams"
        },
        content: {
            type: mongoose.Schema.Types.String,
            default: "",
            trim: true
        },
        file: {
            type: mongoose.Schema.Types.Array,
        },
        content_type: {
            type: String,
            default: ""
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            }
        ],
        deleted_for: [String],
        replyMessageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "messages"
        }
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("messages", Message);