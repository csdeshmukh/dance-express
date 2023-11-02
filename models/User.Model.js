const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema(
  {
    userCode: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "student",
    },
    name: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    isActive: {
      type: Number,
      default: 1,
    },
    isDelete: {
      type: Number,
      default: 0,
    },
    firebase_id: {
      type: String,
      default: "",
    },
    isOnline: {
      type: String,
      default: "0",
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("users", User);
