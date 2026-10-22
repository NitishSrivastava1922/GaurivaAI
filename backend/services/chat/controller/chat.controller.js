import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

const getUserId = (req) => req.headers["x-user-id"];

const findOwnedConversation = (conversationId, userId) =>
  Conversation.findOne({ _id: conversationId, userId });

export const createConversation = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        message: "User ID header is missing",
      });
    }

    const conversation = await Conversation.create({
      userId:userId,
    });

    return res.status(201).json(conversation);
  } catch (error) {
    return res.status(500).json({
      message: `Create Conversation Error: ${error.message}`,
    });
  }
};

export const getConversation = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({ message: "User ID header is missing" });
    }

    const conversations = await Conversation.find({
      userId,
    }).sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({
      message: `Get Conversation Error: ${error.message}`,
    });
  }
};

export const updateConversation = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id, title } = req.body;
    if (!userId || !id || !title?.trim()) {
      return res.status(400).json({ message: "id and title are required" });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId },
      { title: title.trim().slice(0, 120) },
      { new: true },
    );
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: `Update conversation error: ${error.message}` });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(400).json({ message: "Conversation ID is required" });
    }

    const conversation = await Conversation.findOneAndDelete({ _id: id, userId });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    await Message.deleteMany({ conversationId: conversation._id });
    return res.status(200).json({ id: String(conversation._id) });
  } catch (error) {
    return res.status(500).json({
      message: `Delete conversation error: ${error.message}`,
    });
  }
};


export const saveMessage = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { conversationId, role, content, images ,artifacts} = req.body;
    if (!userId || !conversationId || !["user", "assistant"].includes(role) || !content?.trim()) {
      return res.status(400).json({ message: "conversationId, role, and content are required" });
    }
    if (!(await findOwnedConversation(conversationId, userId))) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const message = await Message.create({
      conversationId,
      content: content.trim(),
      role,
      images: Array.isArray(images) ? images : [],
      artifacts
    });
    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ message: `Save message error: ${error.message}` });
  }
};
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = getUserId(req);
    if (!userId || !(await findOwnedConversation(conversationId, userId))) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({
      conversationId: conversationId,
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (e) {
    return res.status(500).json({
      message: `Get message Error: ${e.message}`,
    });
  }
};

export const getUserMessages = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({ message: "User ID header is missing" });
    }

    const conversationIds = await Conversation.find({ userId }).distinct("_id");
    const messages = await Message.find({ conversationId: { $in: conversationIds } })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.status(200).json(messages.reverse());
  } catch (error) {
    return res.status(500).json({ message: `Get user messages Error: ${error.message}` });
  }
};
