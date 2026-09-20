import User from "../model/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { signupSchema, loginSchema } from "../validators/userValidators.js";
import Message from "../model/messageSchema.js";
import Chat from "../model/chatSchema.js";

const createToken = (id, email) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT Secret key is missing!");
  }
  const token = jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};

const cookiesOptions = {
  httpOnly: true,
  secure: false,
  maxAge: 60 * 60 * 1000,
};

export const signup = async (req, res) => {
  try {
    const result = signupSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0].message,
      });
    }

    const { name, email, password, age } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Email, password, or name some fileds are missing!",
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
        message: "Email ID already exist!",
      });
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const userCreated = await User.create({
      name,
      email,
      age,
      password: hashPassword,
    });

    const token = createToken(userCreated._id, email);

    res.cookie("token", token, cookiesOptions);

    res.status(200).json({
      message: "User created successfully!",
      name,
      age,
      email,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Invalid Server Error!",
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0].message,
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.staus(400).json({
        message: "Email , password or some filed are missing",
      });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({ message: "Invalide Credentials" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalide Credentials" });
    }

    const token = createToken(existingUser._id, email);

    res.cookie("token", token, cookiesOptions);

    res.status(200).json({
      message: "User Logged in SuccessFully",
      name: existingUser.name,
      age: existingUser.age,
      email: existingUser.email,
      usage: existingUser.usage,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
  });

  res.status(200).json({
    message: "User Logged Out Successfully!",
  });
};

export const profile = async (req, res) => {
  try {
    res.status(200).json({
      name: req.user.name,
      age: req.user.age,
      usage: req.user.usage,
      email: req.user.email,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal Server error",
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    await Message.deleteMany({
      userId,
    });

    await Chat.deleteMany({
      userId,
    });

    await User.deleteOne({
      _id: userId,
    });

    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
    });

    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      messages: "Internal Server Error",
    });
  }
};
