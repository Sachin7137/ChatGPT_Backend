import express from "express";
import {login , logout, signup, profile, deleteAccount} from "../controllers/userController.js";
import authUserMiddleware from "../middlewares/authUserMiddleware.js";
import unauthenticatedRateLimiter from "../middlewares/unathenticatedRateLimiter.js";
import authenticatedRateLimiter from "../middlewares/authenticatedRateLimiter.js";
const userRouter = express.Router();


userRouter.post("/login", unauthenticatedRateLimiter, login);
userRouter.post("/logout", authUserMiddleware, authenticatedRateLimiter, logout);
userRouter.post("/signup", unauthenticatedRateLimiter, signup);
userRouter.get("/profile", authUserMiddleware, authenticatedRateLimiter, profile);
userRouter.delete("/deleteAccount", authUserMiddleware, deleteAccount);

export default userRouter;