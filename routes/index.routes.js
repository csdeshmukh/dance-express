const router = require("express").Router();
const userRoutes = require("./User.Routes");
const teamRoutes = require("./Team.Routes");
const teamMemberRoutes = require("./TeamMember.Routes");
const messageRoutes = require("./Message.Routes");

router.use("/api/user", userRoutes);
router.use("/api/team", teamRoutes);
router.use("/api/team-member", teamMemberRoutes);
router.use("/api/message", messageRoutes);

module.exports = router;