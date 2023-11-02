const multer = require("multer");
const messageController = require("../controllers/Message.Controller");
const router = require("express").Router();
const path = require("path");

const upload = multer({
    dest: path.join(__dirname, "../uploads/chatmedia/temp"),
});

const fields = [{ name: "file" }];

router.post("/add", upload.any(fields), messageController.addMessage);
router.post("/list-all", messageController.listAll);//with pagination 
router.post("/delete-message", messageController.deleteMessage); // for user
router.post("/delete", messageController.delete); // delete message

module.exports = router;