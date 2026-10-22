import { getModel } from "../config/llmModel.js";
import { generatePpt } from "../utils/generatePpt.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { uploadToS3 } from "../utils/uploadToS3.js";

const pptAgent = async (state) => {
  try {
    const llm = await getModel("ppt");

    const prompt = `You are a professional presentation designer.

Return ONLY valid JSON.

Format:

{
  "title": "",
  "subtitle": "",
  "slides": [
    {
      "title": "",
      "points": [
        "",
        "",
        "",
        ""
      ]
    }
  ]
}

Rules:

- Generate exactly 6 content slides.
- Each slide should have 4-6 concise bullet points.
- No markdown.
- No explanation.
- No code block.
- Return ONLY JSON.

Topic:

${state.prompt}`;

    const res = await llm.invoke(prompt);
    const data=JSON.parse(res.content);
    const ppt=await generatePpt(data)
    const buffer=await ppt.write({
      outputType:"nodebuffer"
    }) 
    const filename=`ppt-${Date.now()}.pptx`
    await uploadToS3(filename,buffer,"application/vnd.openxmlformats-officedocument.presentationml.presentation")
    const downloadUrl=await getFromS3(filename,24*60*60)
    return {
      ...state,
      aiResponse: `#PPT Generate **${data.title}**,
      [Download ppt](${downloadUrl})
      _Link will expire in 10 minutes`,
      artifacts: [],
    };
  } catch (error) {
    console.log("ppt agent error:", error);
    return {
      ...state,
      aiResponse: "I couldn't generate the PPT content right now. Please try again.",
      artifacts: [],
    };
  }
};
export default pptAgent;
