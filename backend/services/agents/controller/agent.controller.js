import axios from "axios";
import { graph } from "../graph/graph.js";
import { deductCredits } from "../utils/deductCredits.js";
import {
  clearMemory,
  getRelevantUserMemory,
  saveUserMemory,
} from "../config/memory.js";

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId, agent } = req.body;
    const files = Array.isArray(req.files) ? req.files : [];
    const userId = req.headers["x-user-id"];

    if (!prompt?.trim() || !conversationId) {
      return res
        .status(400)
        .json({ message: "prompt and conversationId are required" });
    }
    if (!userId) {
      return res.status(400).json({ message: "User ID header is missing" });
    }
    const chatRequest = { headers: { "x-user-id": userId } };
    await axios.post(
      `${process.env.CHAT_SERVICE}/save-message`,
      {
        conversationId,
        role: "user",
        content: prompt.trim(),
      },
      chatRequest,
    );
    await clearMemory(conversationId);

    const crossChatMemory = await getRelevantUserMemory({
      userId,
      conversationId,
      prompt: prompt.trim(),
    });

    const result = await graph.invoke({
      prompt: prompt.trim(),
      conversationId,
      userId,
      crossChatMemory,
      agent,
      files,
    });
    const response = result.aiResponse;

    if (!response) {
      throw new Error("The selected agent did not return a response");
    }

    const deduction = await deductCredits(userId, result.agent);

    await axios.post(
      `${process.env.CHAT_SERVICE}/save-message`,
      {
        conversationId,
        role: "assistant",
        content: response,
        images:result?.images,
        artifacts:result?.artifacts
      },
      chatRequest,
    );
    await clearMemory(conversationId);
    await saveUserMemory({
      userId,
      conversationId,
      prompt: prompt.trim(),
      response,
    });

    return res.status(200).json({
      role: "assistant", content: response,
      images:result.images,
      artifacts:result.artifacts,
      user: deduction.user,
    });
  } catch (e) {
    const downstreamMessage = e.response?.data?.message;
    console.error("Agent request failed:", downstreamMessage || e.message);
    return res.status(500).json({
      message:
        downstreamMessage ||
        "Unable to process the message right now. Please try again.",
    });
  }
};
