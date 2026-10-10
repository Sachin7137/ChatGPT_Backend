import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";
import { redisClient } from "../config/redis.js";

const authUserMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({
                message: "You need to login first"
            });
        }

        const blockedToken = await redisClient.get(
            `blocklist:${token}`
        );

        if (blockedToken) {
            return res.status(401).json({
                message: "Please login again"
            });
        }

        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const existingUser = await User.findById(payload.id);

        if (!existingUser) {
            return res.status(401).json({
                message: "User doesn't exist"
            });
        }

        req.user = existingUser;
        req.token = token;
        req.tokenPayload = payload;

        next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        console.log(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export default authUserMiddleware;