const router = require("express").Router();
const TeamController = require("../controllers/Team.Controller");

router.post("/create", TeamController.create);
router.put("/update", TeamController.update);
router.put("/remove", TeamController.delete);
router.get("/list", TeamController.teamList);
router.get("/detail", TeamController.teamDetail);
router.post("/create-update/full-team", TeamController.createOrUpdateTeamWithStudents);
router.post("/update-logo", TeamController.updateTeamLogo);

module.exports = router;
