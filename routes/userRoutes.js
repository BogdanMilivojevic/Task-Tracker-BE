const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/getUser", authController.getUser);
router.patch("/createTask", authController.createTask);
router.patch("/deleteTask", authController.deleteTask);

module.exports = router;
