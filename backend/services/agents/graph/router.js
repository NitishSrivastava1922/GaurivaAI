import { getModel } from "../config/llmModel.js";

export const router = async (state) => {
  if (Array.isArray(state.files) && state.files.length > 0) {
    return {
      ...state,
      agent: "fileAnalyse",
    };
  }

  if (state.agent && state.agent !== "auto") {
    const requestedAgent = String(state.agent).trim().toLowerCase();

    return {
      ...state,
      // The graph node is named "imageGen". Accept either casing from the
      // client and normalize it before conditional routing.
      agent:
        requestedAgent === "image" || requestedAgent === "imagegen"
          ? "imageGen"
          : requestedAgent,
    };
  }

  const llm = await getModel("router");
  const prompt = `You are a agent router.
    Available Agents:
    -chat
    -search
    -coding
    -pdf
    -ppt
    -imageGen
    
    Rules :
    chat:General Conversation,explanations,learning,questions.
    search:Current Events,Latest Information,news,recent developments,interxnet lookUp,factCheck
    coding:generate code,logic ,solve problem,build projects,architecture design,API Design
    pdf:questions about generate pdfs or document context,
    ppt:questions about generate ppts or document context
    ImageGen:if user explicitly ask for image generation

    return only one word:
    chat,
    search,
    pdf,
    ppt,
    imageGen,
    coding

    User Query:
    ${state.prompt}
    `;

  const response = await llm.invoke(prompt);
  return {
    ...state,
    agent:
      String(response.content ?? "")
        .trim()
        .toLowerCase() === "imagegen"
        ? "imageGen"
        : String(response.content ?? "")
            .trim()
            .toLowerCase(),
    content: response.content,
  };
};
