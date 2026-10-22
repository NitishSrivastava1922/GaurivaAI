import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorStore } from "../config/vectorDb.js";
import { getModel } from "../config/llmModel.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export const pdfRagAgent = async (state) => {
  let pdf;

  try {
    if (!state.file?.path) {
      throw new Error("A PDF file is required");
    }

    const buffer = await fs.readFile(state.file.path);
    pdf = new PDFParse({ data: buffer });
    const result = await pdf.getText();
    const text = String(result?.text ?? "").trim();

    if (!text) {
      throw new Error("The PDF does not contain readable text");
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1_000,
      chunkOverlap: 200,
    });
    const docs = await splitter.createDocuments([text]);
    const store = await vectorStore(docs, `pdf-${Date.now()}`);
    const relevantDocs = await store.similaritySearch(state.prompt, 5);
    const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

    if (!context) {
      throw new Error("No relevant content was found in the PDF");
    }

    const llm = await getModel("pdf-rag");
    const response = await llm.invoke([
      new SystemMessage(`You are NexusAI's PDF assistant.
Answer only using the supplied PDF context. Never invent facts.
If the answer is absent, reply exactly: "I couldn't find this information in the uploaded PDF."
Use concise Markdown when helpful.`),
      new HumanMessage(`PDF context:\n${context}\n\nQuestion:\n${state.prompt}`),
    ]);
    return {
      ...state,
      aiResponse: String(response.content ?? ""),
      artifacts: [],
    };
  } catch (error) {
    console.error("PDF RAG failed:", error.message);
    return {
      ...state,
      aiResponse: "I couldn't analyze that PDF. Please upload a text-based PDF and try again.",
      artifacts: [],
    };
  } finally {
    try {
      await pdf?.destroy?.();
    } catch {
      // Cleanup failure should not hide the PDF analysis result.
    }
    if (state.file?.path) {
      await fs.unlink(state.file.path).catch(() => {});
    }
  }
};
