//Imports
const express = require('express');

const router = express.Router();

const logMiddleware = require("./logMiddleware");
router.use(logMiddleware);

const usersController = require('../controllers/usersController');


router.post("/register", usersController.registerUser);
router.post("/login", usersController.loginUser);
router.get("/:userID/profile", usersController.getUserProfile);
router.put("/:userID/profile", usersController.updateUserProfile);
router.delete("/:userID", usersController.deleteUserAccount);

module.exports = router;
