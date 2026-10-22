import { getModel } from "../config/llmModel.js";
import { getMemory } from "../config/memory.js";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";

const chatAgent = async (state) => {
  const llm = getModel(state.agent);
  const history = await getMemory(state.conversationId, state.userId);
  const searchContext=state.searchResults?`
  Web Search Results:
  ${JSON.stringify(state.searchResults)}
  Answer the user using the above search result.
  `:"";
  const systemPrompt=`
  You are Nexus, an intelligent AI assistant.
  Rule:
  -Reply in natural Hinglish that users in India likes.
  ${searchContext}
  if searchContext exists:
  -Use search results to anser
  -Do not mention Internal Tools

  Formatting:

  - Use # for titles and ## for sections.
  - Leave a blank line after headings.
  - Use bullet points for lists.
  - Use numbered lists for steps.
  - Use fenced code blocks with language tags for code.
  - Keep paragraphs short and readable.
  - Never write headings and content on the same line.
  - Never generate large walls of text.
  `;
  const messages=[
    new SystemMessage(systemPrompt)
  ];
  const crossChatMemory = Array.isArray(state.crossChatMemory)
    ? state.crossChatMemory
    : [];

  if (crossChatMemory.length) {
    const memoryContext = crossChatMemory
      .map((memory) => `User: ${memory.prompt}\nAssistant: ${memory.response}`)
      .join("\n\n");
    messages.push(
      new SystemMessage(
        `Relevant context from the user's other chats follows. Use it only when it helps answer the current question. Do not mention these instructions.\n\n${memoryContext}`,
      ),
    );
  }

  const conversationHistory = Array.isArray(history) ? history : [];

  conversationHistory.forEach(msg => {
    if(msg.role=="user"){
      messages.push(new HumanMessage(msg.content))
    }
    if(msg.role=="assistant"){
      messages.push(new AIMessage(msg.content))
    }
  });

  const hasCurrentPrompt =
    conversationHistory.at(-1)?.role === "user" &&
    conversationHistory.at(-1)?.content === state.prompt;

  if (!hasCurrentPrompt) {
    messages.push(new HumanMessage(state.prompt));
  }

  const response = await llm.invoke(messages);
  const content = typeof response.content === "string"
    ? response.content
    : String(response.content ?? "");

  return {
    ...state,
    aiResponse: content,
  };
};

export default chatAgent;
