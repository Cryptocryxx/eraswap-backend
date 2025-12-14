//Imports
import express from 'express';
import logMiddleware from "./logMiddleware.js";
import usersController from '../controllers/usersController.js';

const router = express.Router();

router.use(logMiddleware);

router.post("/register", usersController.registerUser);
router.put("/verify", usersController.verifyUser);
router.post("/login", usersController.loginUser);


router.get("/profile/:userid", usersController.getUserProfile);
router.get("/listings/:userid", usersController.getUserListings);

router.put("/profile/:userid", usersController.updateUserProfile);
router.delete("/:userid", usersController.deleteUserAccount);
router.get("/:userid/coins", usersController.getUserCoins);
router.post("/:userid/coins", usersController.addUserCoins);
router.get("/:userid/level", usersController.getUserLevel);
router.post("/:userid/exp", usersController.addUserExp);

export default router;
