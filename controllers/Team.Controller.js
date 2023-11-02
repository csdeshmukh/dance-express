const TeamModel = require("../models/Team.Model");
const UserModel = require("../models/User.Model");
const MessageModel = require("../models/Message.Model");

exports.create = async (req, res) => {
    try {
        const { teamCode, teamName, description, teamLogo, lastname, isActive, isDelete, userCode } = req.body;

        const user = await UserModel.findOne({ userCode });
        if (!user) {
            res.status(200).json({ err: 300, msg: "Instructor mis-matched or doesnot exists" });
        }

        let newTeam = new TeamModel({
            teamCode,
            teamName,
            description,
            teamLogo,
            lastname,
            isActive,
            isDelete,
            createdBy: user._id,
            users: [
                user._id
            ]
        });
        let data = await newTeam.save();
        if (data) {
            res.status(200).json({ err: 200, msg: "Team created successfully", data: data });
        } else {
            res.status(200).json({ err: 300, msg: "Failed to save team" });
        }
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
};

exports.update = async (req, res) => {
    try {
        const { teamCode, teamName, description, teamLogo, lastname, isActive, isDelete } = req.body;

        const data = {
            teamCode, teamName, description, teamLogo, lastname, isActive, isDelete
        };

        let teamExists = await TeamModel.findOne({
            teamCode
        });
        if (teamExists) {
            const team = await TeamModel.findOneAndUpdate({ teamCode }, { $set: data }, { new: true });
            if (team) {
                res.status(200).json({ err: 200, msg: "Team updated successfully", data: team });
            } else {
                res.status(200).json({ err: 300, msg: "Failed to update the team" });
            }
        } else {
            let newTeam = new TeamModel(data);
            const team = await newTeam.save();
            if (team) {
                res.status(200).json({ err: 200, msg: "Team created successfully" });
            } else {
                res.status(200).json({ err: 300, msg: "Failed to save team" });
            }
        }
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
};

exports.delete = async (req, res) => {
    try {
        const { teamCode, isActive, isDelete } = req.body;
        const data = {
            isActive,
            isDelete
        }
        const team = await TeamModel.findOneAndUpdate({ teamCode }, { $set: data }, { new: true });
        if (team) {
            res.status(200).json({ err: 200, msg: "Team deleted successfully" });
        } else {
            res.status(200).json({ err: 300, msg: "Failed to delete the team" });
        }
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
};

exports.teamList = async (req, res) => {
    try {
        const { userId, page, limit } = req.query;

        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 20;

        const filter = { users: { $in: [userId] } };

        const teams = await TeamModel.find(filter)
            .populate({ path: "createdBy", select: "_id userCode role name avatar" })
            .populate({ path: "users", select: "_id userCode role name avatar" })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ createdAt: -1 });
        let totalDocuments = await TeamModel.countDocuments(filter);
        totalPages = Math.ceil(totalDocuments / pageSize);

        if (teams.length > 0) {
            for (const team of teams) {
                const unreadMessagesCount = await MessageModel.countDocuments({ readBy: { $nin: [userId] }, teamId: team._id });
                team._doc.unreadMessages = unreadMessagesCount;
            }
            res.status(200).json({ err: 200, msg: "Teams Found", data: teams, totalRecords: totalDocuments, totalPages: totalPages });
        } else {
            res.status(200).json({ err: 300, msg: "No Teams Found" });
        }
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
};

exports.teamDetail = async (req, res) => {
    try {
        const { teamId } = req.query;
        const filter = { _id: teamId };
        const team = await TeamModel.findOne(filter)
            .populate({ path: "createdBy", select: "_id userCode role name avatar" })
            .populate({ path: "users", select: "_id userCode role name avatar" })
            .sort({ createdAt: -1 });
        if (team) {
            res.status(200).json({ err: 200, msg: "Team Found", data: team });
        } else {
            res.status(200).json({ err: 300, msg: "No Team Found" });
        }
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
};

exports.createOrUpdateTeamWithStudents = async (req, res) => {
    try {
        const { teamCode, teamName, description, teamLogo, isActive, isDelete, userCode, members } = req.body;
        const instructor = await UserModel.findOne({ userCode });
        if (instructor) {
            const users = [instructor._id];
            const studentCodes = members.map((member) => {
                return member.code;
            })
            const students = await UserModel.find({ userCode: { $in: studentCodes } });
            if (users.length > 0) {
                for (const student of students) {
                    users.push(student._id);
                }
            }
            const team = await TeamModel.findOne({ teamCode });
            if (team) {
                const updateTeam = await TeamModel.findByIdAndUpdate(team._id, {
                    $set: {
                        teamCode,
                        teamName,
                        description,
                        teamLogo,
                        isActive,
                        isDelete,
                        createdBy: instructor._id,
                        users: users
                    }
                }, { new: true });
                if (updateTeam) {
                    res.status(200).json({ err: 200, msg: "Team Updated successfully", data: updateTeam });
                } else {
                    res.status(200).json({ err: 300, msg: "Failed to update team" });
                }
            } else {
                let newTeam = new TeamModel({
                    teamCode,
                    teamName,
                    description,
                    teamLogo,
                    isActive,
                    isDelete,
                    createdBy: instructor._id,
                    users: users
                });
                let data = await newTeam.save();
                if (data) {
                    res.status(200).json({ err: 200, msg: "Team created successfully", data: data });
                } else {
                    res.status(200).json({ err: 300, msg: "Failed to save team" });
                }
            }
        } else {
            res.status(200).json({ err: 300, msg: "Instrutor not matched to create/modify the team." });
        }
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
};

exports.updateTeamLogo = async (req, res) => {
    try {
        const { teamCode, teamLogo } = req.body;
        const team = await TeamModel.findOne({ teamCode });
        if (team) {
            const updateTeam = await TeamModel.findByIdAndUpdate(team._id, {
                $set: {
                    teamLogo,
                }
            }, { new: true });
            if (updateTeam) {
                res.status(200).json({ err: 200, msg: "Team logo updated successfully", data: updateTeam });
            } else {
                res.status(200).json({ err: 300, msg: "Failed to update team logo" });
            }
        } else {
            res.status(200).json({ err: 300, msg: "Unable to find the team" });
        }
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
}