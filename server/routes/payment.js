const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/paymentController");

router.get("/:maHoaDon", ctrl.getByInvoice);
router.post("/", ctrl.create);
router.delete("/:id", ctrl.delete);

module.exports = router;
