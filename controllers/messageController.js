import mongoose from "mongoose";
import Chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";
import {
  addUserTokenUsage,
  hasTokenLimitReached,
  resetUsageIfNeeded,
} from "../utils/userUsage.js";
import { buildMessageForAI } from "../utils/chatContext.js";
import { generateAIResponse } from "../service/openRouterService.js";
import { addChatTokenUsage } from "../utils/tokenUsage.js";
import { updateSummaryIfNNeeded } from "../service/summaryService.js";

export const getMessage = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });

    if (!chat) {
      return res.status(404).json({
        messages: "Chat Not found",
      });
    }

    const messages = await Message.find({
      chatId: chatId,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      messages: "Your are all messages are here",
      msg: messages,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      messages: "Internal server error",
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, model } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "You didn't send any message",
      });
    }

    await resetUsageIfNeeded(req.user);

    if (hasTokenLimitReached(req.user)) {
      return res.status(429).json({
        message: "Token limit reached. Please try after some time.",
        usage: req.user.usage,
      });
    }

    let chat;

    if (chatId) {
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({
          message: "Invalid chat id",
        });
      }

      chat = await Chat.findOne({
        _id: chatId,
        userId: req.user._id,
      });

      if (!chat) {
        return res.status(404).json({
          messages: "Chat not found",
        });
      }
    } else {
      if (!model) {
        return res.status(400).json({
          message: "Model is required for new chat",
        });
      }

      chat = await Chat.create({
        userId: req.user._id,
        model,
        topic: content.trim().slice(0, 40),
      });
    }

    // Without AI Integration
    // const userMessage = await Message.create({
    //   userId: req.user._id,
    //   chatId: chat._id,
    //   role: "user",
    //   content: content,
    // });

    // const dummyAIReply = "Hello, I'm doing great";

    // const assistantMessage = await Message.create({
    //   userId: req.user._id,
    //   chatId: chat._id,
    //   role: "assistant",
    //   content: dummyAIReply,
    // });

    // chat.messageCount += 2;

    // if (chat.topic === "New Chat") {
    //   chat.topic = content.trim().slice(0, 40);
    // }

    // await chat.save();

    // res.status(201).json({
    //   message: "Message sent successfully",
    //   chatId: chat._id,
    //   userMessage,
    //   assistantMessage,
    // });

    // With AI Integration
    const oldMessages = await Message.find({
      chatId: chat._id,
    })
      .sort({ createdAt: 1 })
      .skip(chat.summarizedTillMessageNumber);

    const messagesForAI = buildMessageForAI({
      chat,
      oldMessages,
      currentMessage: content.trim(),
    });

    const { aiReply, usage } = await generateAIResponse({
      model: chat.model,
      messages: messagesForAI,
    });

    const userMessage = await Message.create({
      chatId: chat._id,
      role: "user",
      content: content.trim(),
      userId: req.user._id,
    });

    const assistantMessage = await Message.create({
      chatId: chat._id,
      role: "assistant",
      content: aiReply,
      userId: req.user._id,
      usage,
    });

    chat.messageCount += 2;

    if (chat.topic === "New Chat") {
      chat.topic = content.trim().slice(0, 40);
    }

    await addChatTokenUsage(chat, usage);
    await addUserTokenUsage(req.user, usage.totalTokens);

    res.status(201).json({
      message: "Message sent successfully",
      chatId: chat._id,
      reply: aiReply,
      usage,
      userMessage,
      assistantMessage,
    });

    updateSummaryIfNNeeded(chat._id);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      messages: "Internal server error",
    });
  }
};
