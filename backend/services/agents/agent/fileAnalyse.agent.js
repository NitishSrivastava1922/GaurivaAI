import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModel.js";
import { vectorStore } from "../config/vectorDb.js";

export const fileAnalyseAgent = async (state) => {
  const files = Array.isArray(state.files) ? state.files : [];
  const pdfParsers = [];

  try {
    if (!files.length) throw new Error("No files were uploaded");

    const pdfFiles = files.filter((file) => file.mimetype === "application/pdf");
    const imageFiles = files.filter((file) => file.mimetype?.startsWith("image/"));
    const pdfTexts = [];

    for (const file of pdfFiles) {
      const parser = new PDFParse({ data: await fs.readFile(file.path) });
      pdfParsers.push(parser);
      const result = await parser.getText();
      const text = String(result?.text ?? "").trim();
      if (text) pdfTexts.push(`Source: ${file.originalname}\n${text}`);
    }

    let pdfContext = "";
    if (pdfTexts.length) {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1_000,
        chunkOverlap: 200,
      });
      const documents = await splitter.createDocuments(pdfTexts);
      const store = await vectorStore(documents, `attachments-${Date.now()}`);
      const matches = await store.similaritySearch(state.prompt, 6);
      pdfContext = matches.map((match) => match.pageContent).join("\n\n");
    }

    const imageContent = await Promise.all(
      imageFiles.map(async (file) => ({
        type: "image_url",
        image_url: {
          url: `data:${file.mimetype};base64,${(await fs.readFile(file.path)).toString("base64")}`,
        },
      })),
    );

    if (!pdfContext && !imageContent.length) {
      throw new Error("The uploaded files do not contain readable content");
    }

    const llm = await getModel(imageContent.length ? "imageanalyser" : "pdf-rag");
    const sourceRules = pdfContext
      ? "For PDF claims, use only the supplied PDF context. If the answer is absent from the PDFs, say so clearly."
      : "Answer using only the supplied images.";
    const response = await llm.invoke([
      new SystemMessage(`You are NexusAI's attachment assistant. Analyze the uploaded PDFs and images accurately. ${sourceRules} Use concise Markdown when helpful.`),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: `Question: ${state.prompt}\n\nPDF context:\n${pdfContext || "No PDF was uploaded."}`,
          },
          ...imageContent,
        ],
      }),
    ]);
    return {
      ...state,
      aiResponse: String(response.content ?? ""),
      artifacts: [],
    };
  } catch (error) {
    console.error("Attachment analysis failed:", error.message);
    return {
      ...state,
      aiResponse: "I couldn't analyze those attachments. Please upload readable PDFs or images and try again.",
      artifacts: [],
    };
  } finally {
    await Promise.all(
      pdfParsers.map(async (parser) => {
        try {
          await parser.destroy?.();
        } catch {
          // Cleanup failure should not hide the response.
        }
      }),
    );
    await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => {})));
  }
};
