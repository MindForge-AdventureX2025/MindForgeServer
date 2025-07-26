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
    const { message, selected = "", journalIds = [] } = req.body;
    
    // Validate journalIds array - ensure all are valid ObjectIds
    const validJournalIds = journalIds.filter(id => {
      try {
        return id && id.toString().match(/^[0-9a-fA-F]{24}$/);
      } catch (e) {
        return false;
      }
    });
    
    if (journalIds.length !== validJournalIds.length) {
      console.warn(`Some invalid journal IDs were filtered out. Original: ${journalIds.length}, Valid: ${validJournalIds.length}`);
    }
    
    let originalChat = await Chat.findById(id);
    if (!originalChat) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: "Chat not found" })}\n\n`);
      return;
    }
    
    // Verify chat ownership
    if (originalChat.userId.toString() !== req.user.userId) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: "Access denied" })}\n\n`);
      return;
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
      journalId: validJournalIds || [] // Track which journals this user message references
    });
    // await originalChat.save();
    let requestMessages = message;
    
    // Retrieve and append journal contents if journalIds are provided
    if (validJournalIds && validJournalIds.length > 0) {
      requestMessages += "\n\nfollowing is the Journal that I would like to reference: {\n";
      
      for (const journalId of validJournalIds) {
        try {
          const journal = await Journal.findById(journalId);
          if (journal && journal.userId.toString() === req.user.userId) {
            requestMessages += `\n--- Journal Entry ---\n`;
            requestMessages += `Title: ${journal.title}\n`;
            requestMessages += `Content: ${journal.content || 'No content'}\n`;
            requestMessages += `Tags: ${journal.tags && journal.tags.length > 0 ? journal.tags.join(", ") : 'No tags'}\n`;
            requestMessages += `Audio IDs: ${journal.audioIds && journal.audioIds.length > 0 ? journal.audioIds.join(", ") : 'No audio files'}\n`;
            requestMessages += `Created: ${new Date(journal.createdAt).toLocaleString()}\n`;
            requestMessages += `Updated: ${new Date(journal.updatedAt).toLocaleString()}\n`;
            requestMessages += `--- End Journal Entry ---\n`;
          } else if (!journal) {
            console.warn(`Journal with ID ${journalId} not found`);
          } else {
            console.warn(`Access denied to journal with ID ${journalId} for user ${req.user.userId}`);
          }
        } catch (journalError) {
          console.error(`Error retrieving journal ${journalId}:`, journalError);
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
    console.log("historyMessages: ", historyMessages);
    console.log("requestMessages: ", requestMessages);
    const response = await queryStream(historyMessages + requestMessages, res, {
      userId: req.user.userId,
      authToken: req.headers.authorization || null
    });

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
      journalId: [] // Initialize journalId array
    });
    
    // Update the journalId array for the last message (LLM response)
    const lastMessageIndex = originalChat.messages.length - 1;
    const existingJournalIds = originalChat.messages[lastMessageIndex].journalId || [];
    
    // Filter out journalIds that already exist to avoid duplicates
    const newJournalIds = validJournalIds.filter(id => !existingJournalIds.some(existingId => existingId.toString() === id.toString()));
    
    // Add new journalIds to the existing ones
    originalChat.messages[lastMessageIndex].journalId = [...existingJournalIds, ...newJournalIds];
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
