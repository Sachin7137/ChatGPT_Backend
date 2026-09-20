import dotenv from "dotenv/config"
import express from "express";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRouter.js"
import chatRouter from "./routes/chatRouter.js";
import messageRouter from "./routes/messageRouter.js";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use("/user", userRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);


const startServer = async () => {
  try {
    await connectDB();

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
};

startServer();
