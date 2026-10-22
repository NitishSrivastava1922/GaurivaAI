import { getModel } from "../config/llmModel.js";

const codingAgent = async (state) => {
  try {
    const intentLLm=await getModel("intent")
    const llm=await getModel("coding")
    const intentRes = await intentLLm.invoke(`
You are an intent classifier.

Return ONLY one of these values.

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

User Request:
${state.prompt}
`);

const intent = String(intentRes.content ?? "").trim().toUpperCase();
if(intent==="CODE_GENERATION"){
  const prompt=`
  You are NexusAI Coding Agent.

Generate the requested project.

Default stack:
- HTML
- CSS
- JavaScript

Use React / Next.js / Vue ONLY if explicitly requested.

Rules:
- Responsive
- Modern UI
- CSS Variables
- Flexbox/Grid
- Smooth Scroll
- Hover Effects
- Beautiful spacing
- Single page unless user asks otherwise.

Images
=========================================
always use real unsplash images.
Never Use Placeholders
Return ONLY valid JSON.

Schema:

{
  "files": [
    {
      "name": "index.html",
      "content": "..."
    },
    {
      "name": "style.css",
      "content": "..."
    },
    {
      "name": "script.js",
      "content": "..."
    }
  ]
}
  Rules:

- Output must start with {
- Output must end with }
- No markdown
- No explanation
- No extra text
- No \`\`\`
- Never mention intent

User Request:
${state.prompt}
  `
  const res=await llm.invoke(prompt);
  const data=JSON.parse(res.content)
  return{
    ...state,
    aiResponse:"Code Generated Successfully!!",
    artifacts:[
      {
        id:Date.now(),
        type:"Project",
        files:data.files || [],
        title:state.prompt
      }
    ]
  }
}

const res = await llm.invoke(`
The user's request is:

${intent}

Return Markdown only.

Never generate project files.

Use headings like:

# Overview

## Explanation

## Problems

## Improvements

## Best Practices

## Optimized Code (if needed)

User Request:

${state.prompt}
`);
const data = res.content;
return {
  ...state,
  aiResponse: data,
  artifacts: []
}
  } catch (error) {
    console.log(error)
    return {
      ...state,
      aiResponse: "I couldn't generate the code right now. Please try again.",
      artifacts: [],
    };
  }
};

export default codingAgent;
