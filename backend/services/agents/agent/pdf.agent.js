import { getModel } from "../config/llmModel.js";
import generatePdf from "../utils/generatePdf.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { uploadToS3 } from "../utils/uploadToS3.js";

const pdfAgent = async (state) => {
  try {
    const llm = await getModel("pdf");
    const prompt = `
You are an expert document writer.

Return ONLY valid JSON.

Do NOT return markdown.

Do NOT return explanations.

Structure:

{
  "title": "",
  "subtitle": "",
  "sections": [
    {
      "heading": "",
      "points": []
    }
  ]
}

Generate 4-8 sections.

Each section should have 3-6 concise bullet points.

Topic:

${state.prompt}
`;
    const res = await llm.invoke(prompt);
    const data=JSON.parse(res.content);
    const pdfbuffer=await generatePdf(data);
    const filename = `pdf-${Date.now()}.pdf`;

    await uploadToS3(filename,pdfbuffer,"application/pdf")
    const downloadUrl=await getFromS3(filename,24*60)
    return {
      ...state,
      aiResponse: `#PDF Generate **${data.title}**,
      [Download pdf](${downloadUrl})
      _Link will expire in 10 minutes`,
      artifacts: [],
    };
  } catch (error) {
    console.log("pdfAgent error:", error);
    return {
      ...state,
      aiResponse: "I couldn't generate the PDF content right now. Please try again.",
      artifacts: [],
    };
  }
};

export default pdfAgent;
