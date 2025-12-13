//Imports
import express from 'express';
import logMiddleware from "./logMiddleware.js";
import usersController from '../controllers/usersController.js';

const router = express.Router();

router.use(logMiddleware);

router.post("/register", usersController.registerUser);
router.get("/verify", usersController.verifyUser);
router.get("/login", usersController.loginUser);
router.get("/profile/:userid", usersController.getUserProfile);
router.put("/profile/:userid", usersController.updateUserProfile);
router.delete("/:userid", usersController.deleteUserAccount);
router.get("/:userid/coins", usersController.getUserCoins);
router.post("/:userid/coins", usersController.addUserCoins);
router.get("/:userid/level", usersController.getUserLevel);
router.post("/:userid/exp", usersController.addUserExp);

export default router;
