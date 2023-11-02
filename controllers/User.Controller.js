const UserModel = require("../models/User.Model");

exports.createOrUpdate = async (req, res) => {
    try {
        const { userCode, role, name, mobile, email, avatar, isActive, isDelete } = req.body;
        const userExists = await UserModel.findOne({ userCode });
        if (userExists) {
            const updateData = {
                userCode, role, name, mobile, email, avatar, isActive, isDelete
            };
            const user = await UserModel.findOneAndUpdate({ userCode }, { $set: updateData }, { new: true });
            if (user) {
                res.status(200).json({ err: 200, msg: "User updated successfully", data: user });
            } else {
                res.status(200).json({ err: 300, msg: "Failed to update the user data" });
            }
        } else {
            const newUser = new UserModel({
                userCode, role, name, mobile, email, avatar, isActive, isDelete
            });
            const data = await newUser.save();
            if (data) {
                res.status(200).json({ err: 200, msg: "User created successfully", data: data });
            } else {
                res.status(200).json({ err: 300, msg: "Failed to save user" }); F
            }
        }
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
};

exports.updateFirebaseId = async (req, res) => {
    try {
        const { userCode, firebase_id } = req.body;
        const user = await UserModel.findOneAndUpdate({ userCode }, { $set: { firebase_id } }, { new: true });
        res.status(200).json({ err: 200, msg: "Friebase id created successfully" });
    } catch (error) {
        res.status(500).json({ err: 500, msg: error.toString() });
    }
};