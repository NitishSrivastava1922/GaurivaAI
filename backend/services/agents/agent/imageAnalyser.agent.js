import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModel.js";
import fs from "node:fs/promises";

export const imageAnalyserAgent = async (state) => {
  try {
    const llm = await getModel("imageanalyser");
    const imageBuffer = await fs.readFile(state.file.path);
    const base64Image = imageBuffer.toString("base64");

    const messages = [
      new SystemMessage(`
You are NexusAi image analyzer Agent.

Rules:

- Analyze only the uploaded image.
- Answer the user's question accurately.
- If text exists in the image, extract it.
- If charts or tables exist, explain them.
- If something is unclear, say so.
- Use Markdown when helpful.
- Do not hallucinate.
`),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: state.prompt || "analyze the image",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${state.file.mimetype};base64,${base64Image}`,
            },
          },
        ],
      }),
    ];
    const response = await llm.invoke(messages);
    return {
      ...state,
      aiResponse: response.content,
    };
  } catch (error) {
    console.log(error);

    return {
      ...state,
      aiResponse: "Failed to analyze file",
    };
  } finally {
    if (state.file?.path) {
      await fs.unlink(state.file.path).catch(() => {});
    }
  }
};
