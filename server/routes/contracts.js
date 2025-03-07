const express = require("express");
const contractController = require("../controllers/contractController");

const router = express.Router();

router.get("/", contractController.getAllContracts);
router.get("/id/:id", contractController.getContractById);
router.patch("/update/:id", contractController.updateContract);
router.post("/create", contractController.createContract);
router.delete("/delete/:id", contractController.deleteContract);
router.get("/room/:id", contractController.getContractByRoomId);
router.get("/guest/:id", contractController.getContractByGuestId);

module.exports = router;