const express = require("express");
const guestController = require("../controllers/guestController");

const router = express.Router();

router.get("/", guestController.getAllGuests);
router.get("/id/:id", guestController.getGuestById);
router.get("/gender/:sex", guestController.getGuestByGender);
router.patch("/update/:id", guestController.updateGuest);
router.post("/create", guestController.createGuest);
router.delete("/delete/:id", guestController.deleteGuest);

module.exports = router;
