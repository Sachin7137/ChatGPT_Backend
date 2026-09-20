import express from "express";
import {login , logout, signup, profile, deleteAccount} from "../controllers/userController.js";
import authUserMiddleware from "../middlewares/authUserMiddleware.js";

const userRouter = express.Router();


userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.post("/signup", signup);
userRouter.get("/profile", authUserMiddleware, profile);
userRouter.delete("/deleteAccount", authUserMiddleware, deleteAccount);

export default userRouter;