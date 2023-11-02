const router = require("express").Router();
const UserController = require("../controllers/User.Controller");

router.post("/create-update", UserController.createOrUpdate);
router.post("/update/firebase-id", UserController.updateFirebaseId);

module.exports = router;
