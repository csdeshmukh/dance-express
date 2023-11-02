
const fs = require("fs");
const moment = require("moment");
const crypto = require("crypto");
const TeamModel = require("../models/Team.Model");
const MessageModel = require("../models/Message.Model");

exports.addMessage = async (req, res) => {
    try {
        const { teamId, content, content_type, readBy, createdBy, replyMessageId } = req.body;

        let newMessage = new MessageModel({ teamId, content, content_type, createdBy, readBy, replyMessageId });

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const tmp_path = req.files[i].path;
                const timeStamp = moment().valueOf();
                const randomString = crypto.randomBytes(10).toString('hex');
                const fileExtentsion = req.files[i].originalname.split(".");
                const file_final_name = `${randomString}-${timeStamp}.${fileExtentsion[fileExtentsion.length - 1]}`;
                const final_path = "uploads/chatmedia/" + file_final_name;
                fs.renameSync(tmp_path, final_path, (err) => {
                    if (err) {
                        return req.files[i].fieldname + " file linking failed";
                    }
                });
                newMessage.file.push({ type: file.mimetype, path: final_path });
            }
        }

        let result = await newMessage.save();

        let populatedResult = await MessageModel.populate(result, { path: 'createdBy', select: { _id: 1, userCode: 1, name: 1, role: 1, avatar: 1, isOnline: 1 } });

        await TeamModel.findByIdAndUpdate(teamId, { $set: { latestMessage: result._id } }, { new: true });

        const msgReply = {};
        if (replyMessageId !== undefined && replyMessageId !== "") {
            let replyMsgData = await MessageModel.findOne({ _id: replyMessageId });
            if (replyMsgData) {
                msgReply = {
                    messageId: replyMsgData._id,
                    teamId: replyMsgData.teamId,
                    file: replyMsgData.file,
                    content: replyMsgData.content,
                    content_type: replyMsgData.content_type,
                    createdAt: replyMsgData.createdAt
                };
            }
        }
        const data = {
            messageId: populatedResult._id,
            teamId: populatedResult.teamId,
            file: populatedResult.file,
            content: populatedResult.content,
            content_type: populatedResult.content_type,
            createdBy: {
                _id: populatedResult.createdBy._id,
                userCode: populatedResult.createdBy.userCode,
                role: populatedResult.createdBy.role,
                name: populatedResult.createdBy.name,
                avatar: populatedResult.createdBy.avatar,
                isOnline: populatedResult.createdBy.isOnline
            },
            readBy: populatedResult.readBy,
            createdAt: populatedResult.createdAt,
            replyMessageId: msgReply
        };

        res.status(200).json({ err: 200, msg: "Message added successfully", data });
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.message });
    }
};

// list of all messages 
exports.listAll = async (req, res) => {
    try {
        const { search, teamId, page } = req.body;

        const pageNumber = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;

        let query = {};
        if (search !== "") {
            query.content = { $regex: "^" + search + ".*", $options: "i" };
        }

        if (teamId) {
            query.teamId = teamId;
        }

        let totalDocuments = await MessageModel.countDocuments(query);

        const totalPages = Math.ceil(totalDocuments / pageSize);

        let result = await MessageModel.find(query).populate({ path: "createdBy", select: "_id userCode role name avatar isOnline" }).skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 }).exec();

        res.status(200).json({ err: 200, msg: "Messages Found", pageNumber: pageNumber, pageSize: pageSize, totalDocuments: totalDocuments, totalPages: totalPages, data: result });

    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
};

// for admin all messages without paination
exports.listAllMessages = async (req, res) => {
    try {
        const { search, teamId, sortBy, createdBy, page, limit } = req.body;

        let query = {};
        if (search !== "") {
            query.content = { $regex: search, $options: "i" };
        }
        if (teamId) {
            query.teamId = teamId;
        }

        let result = await MessageModel.find(query)
            .populate({ path: "createdBy", select: "_id userCode role name avatar isOnline" })
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).json({ err: 200, msg: "Messages Found", data: result });
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
};

// delete message for user
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId, deleted_for } = req.body;
        let messageDelete_forUser = await MessageModel.findByIdAndUpdate(messageId, {
            $push: { deleted_for }
        });
        res.status(200).json({ err: 200, msg: "Record deleted successfully", data: messageDelete_forUser });
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
}

// delete message - 
exports.delete = async (req, res) => {
    try {
        const { messageId } = req.body;
        let deleteMessage = await MessageModel.findByIdAndDelete(messageId);
        res.status(200).json({ err: 200, msg: "Record deleted successfully", data: deleteMessage });
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
}