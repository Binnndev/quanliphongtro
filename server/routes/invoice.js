const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/invoiceController");
const { authenticate } = require("../middlewares/authMiddleware");


router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.delete);
router.get("/mine", authenticate, ctrl.getInvoicesForLoggedInTenant);

module.exports = router;
