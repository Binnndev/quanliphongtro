const express = require("express");
const router = express.Router();
const controller = require("../controllers/dienNuocController");
const { authenticate } = require("../middlewares/authMiddleware");

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
router.get("/mine", authenticate, controller.getMyElectricWater);

module.exports = router;
