const router = require("express").Router();
const TeamMemberController = require("../controllers/TeamMember.Controller");

router.post("/add", TeamMemberController.addTeamMember);
router.post("/remove", TeamMemberController.removeTeamMember);

module.exports = router;
