import Chat from "../models/chat.model.js";
import Journal from "../models/journal.model.js";
import User from "../models/user.model.js";
import { query, queryStream } from "../utils/query.js";
import redisClient from "../utils/redis.js";

export const createChat = async (req, res) => {
  try {
    const userId = req.user.userId;
    const newChat = new Chat({ userId });
    newChat.nonTitleUpdatedAt = new Date();
    await newChat.save();
    newChat.createdAt = new Date(newChat.createdAt).getTime();
    newChat.updatedAt = new Date().getTime();
    newChat.nonTitleUpdatedAt = new Date(newChat.nonTitleUpdatedAt).getTime();
    // Add the new chat ID to the user's chatIds array
    await User.findByIdAndUpdate(userId, {
      $push: { chatIds: newChat._id },
    });
    res.status(201).json(newChat);
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: error.message });
  }
};

export const getChatById = async (req, res) => {
  try {
    console.log("Fetching chat by ID");
    const userId = req.user.userId;
    const { id } = req.params;
    const chat = await Chat.findById(id).populate("messages");
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (chat.userId.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.status(200).json({
      ...chat.toObject(),
      createdAt: new Date(chat.createdAt).getTime(),
      updatedAt: new Date(chat.updatedAt).getTime(),
      nonTitleUpdatedAt: new Date(chat.nonTitleUpdatedAt).getTime(),
      messages: chat.messages.map(message => ({
        ...message,
        timestamp: new Date(message.timestamp).getTime(),
      })),
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    console.log("Fetching chat history");
    const userId = req.user.userId;
    console.log("User ID:", userId);
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    const chats = await Chat.find({ userId })
      .select("-messages")
      .sort({ nonTitleUpdatedAt: -1 })
      .skip(skip)
      .limit(limit);
    if (!chats || chats.length === 0) {
      return res.status(404).json({ message: "No chats found" });
    }
    chats.forEach(chat => {
      chat.createdAt = new Date(chat.createdAt).getTime();
      chat.updatedAt = new Date(chat.updatedAt).getTime();
      chat.nonTitleUpdatedAt = new Date(chat.nonTitleUpdatedAt).getTime();
    });
    res.status(200).json(chats);
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateChat = async (req, res) => {
  try {

    res.setHeader('Content-Type', 'text/event-stream');  // 声明这是SSE流
    res.setHeader('Cache-Control', 'no-cache');         // 禁用缓存
    res.setHeader('Connection', 'keep-alive');          // 保持长连接
    
    const { id } = req.params;
    console.log(req.body);
    const { message, selected = "", journalIds = [] } =  req.body;
    let originalChat = await Chat.findById(id);
    if (!originalChat) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    }
    
    const key = req.user.userId + "_" + id;
    const data = await redisClient.get(key);
    let history = [];
    if (data) {
      history = JSON.parse(data);
    }
    else{
      history = originalChat.messages.map(msg => ({
        role: msg.sender,
        content: msg.content
      }));
    }

    originalChat.messages.push({
      sender: "user",
      content: message,
      timestamp: new Date(),
    });
    // await originalChat.save();
    let requestMessages = message;
    if (journalIds && journalIds.length > 0) {
      requestMessages += "\n\nfollowing is the Journal that I would like to reference: {\n";
      for (const journalId of journalIds) {
        const journal = await Journal.findById(journalId);
        if (journal) {
          requestMessages += `\nTitle: ${journal.title}\nContent: ${journal.content}\nTags: ${journal.tags.join(", ")}\nAudio IDs: ${journal.audioIds.join(", ")}`;
        }
      }
      requestMessages += "\n}";
    }
    if (selected) {
      requestMessages +=
        "\n\nfollowing is the selected context in the journal that I would like to reference (the selected context is what I would like to emphasize. If you need to read something, feel free to read anything I provided with you. But if you need to add, remove, or replace something, that should be inside my selected context.): {\n" +
        selected +
        "\n}";
    }


    let historyMessages = ""
    if(history){
      historyMessages += "\n\nHistory Conversation: " + JSON.stringify(history);
    }

    const response = await queryStream(historyMessages + requestMessages, res);

    history.push(
      {
        role: "user",
        content: requestMessages,
      },
      {
        role: "llm",
        content: response,
      }
    )

    await redisClient.set(key, JSON.stringify(history), {
      EX: 60 * 60 * 24 // Set expiration to 1 day
    });

    originalChat.messages.push({
      sender: "llm",
      content: response,
      timestamp: new Date(),
    });
    let ids = originalChat.messages[originalChat.messages.length - 1].journalId.filter(
      item => !journalIds.includes(item)
    );
    originalChat.messages[originalChat.messages.length - 1].journalId = [...ids, ...journalIds];
    await originalChat.save();

    if (!originalChat) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    }

    originalChat.createdAt = new Date(originalChat.createdAt).getTime();
    originalChat.updatedAt = new Date(originalChat.updatedAt).getTime();
    originalChat.messages.forEach(message => {
      message.timestamp = new Date(message.timestamp).getTime();
    });
    
    res.write(`event: end\ndata: ${JSON.stringify({ originalChat, response })}\n\n`);
  } catch (error) {
    console.error("error: ", error);
    res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
  } finally {
    res.end()
  }
};

export const updateChatName = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (chat.userId.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    chat.title = name;
    await chat.save();
    res.status(200).json("Chat title updated successfully");
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    console.log("id:", id);
    console.log("userId:", userId);
    const chat = await Chat.findById(id);
    console.log("chat:", chat);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    console.log("chat.userId:", chat.userId);
    if (chat.userId.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    await Chat.findByIdAndDelete(id);
    await User.findByIdAndUpdate(userId, {
      $pull: { chatIds: id },
    });
    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: error.message });
  }
};
