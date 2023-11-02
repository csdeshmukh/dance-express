const TeamModel = require("../models/Team.Model");
const UserModel = require("../models/User.Model");

exports.addTeamMember = async (req, res) => {
    try {
        const { userCode, teamCode, userRole } = req.body;
        const team = await TeamModel.findOne({ teamCode });
        if (team) {
            const user = await UserModel.find({ userCode });
            if (user) {
                const teamUsers = team.users;
                if (teamUsers.includes(user._id)) {
                    res.status(200).json({ err: 200, msg: userRole + " alredy exists in team" });
                } else {
                    let addedTeamMember = await TeamModel.findOneAndUpdate(
                        { teamCode: teamCode, users: { $nin: user._id } },
                        { $push: { users: user._id } },
                        { new: true }
                    );
                    res.status(200).json({ err: 200, msg: userRole + " added to team successfully" });
                }
            } else {
                res.status(200).json({ err: 300, msg: "Unable to find the " + userRole });
            }
        } else {
            res.status(200).json({ err: 300, msg: "Unable to find the team" });
        }
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
}

exports.removeTeamMember = async (req, res) => {
    try {
        const { teamCode, userCode } = req.body;
        let team = await TeamModel.findOneAndUpdate({ teamCode }).exec();
        if (team) {
            const user = await UserModel.findOne({ userCode });
            if (user && user.role === "student") {
                team.users = team.users.filter((i) => i + "" !== user._id + "");
                await team.save();
                res.status(200).json({ err: 200, msg: "User removed from team successfully" });
            } else {
                res.status(400).json({ err: 300, msg: "Instructor cannot leave the team" });
            }
        } else {
            res.status(400).json({ err: 300, msg: "Unable to find such team" });
        }
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
}