import { StateGraph } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { router } from "./router.js";
import chatAgent from "../agent/chat.agent.js";
import codingAgent from "../agent/coding.agent.js";
import pptAgent from "../agent/ppt.agent.js";
import pdfAgent from "../agent/pdf.agent.js";
import searchAgent from "../agent/search.agent.js"
import imageGenAgent from "../agent/imageGen.agent.js"
import { pdfRagAgent } from "../agent/pdfRag.agent.js";
import { imageAnalyserAgent } from "../agent/imageAnalyser.agent.js";
import { fileAnalyseAgent } from "../agent/fileAnalyse.agent.js";

const workflow=new StateGraph(agentState);

workflow.addNode("router",router);
workflow.addNode("chat",chatAgent);
workflow.addNode("coding",codingAgent);
workflow.addNode("ppt",pptAgent);
workflow.addNode("search",searchAgent);
workflow.addNode("pdf",pdfAgent);
workflow.addNode("imageGen",imageGenAgent);
workflow.addNode("pdfRag",pdfRagAgent);
workflow.addNode("imageAnalyse",imageAnalyserAgent);
workflow.addNode("fileAnalyse", fileAnalyseAgent);

workflow.addEdge("__start__","router");
workflow.addConditionalEdges("router", (state) => {
    switch (state.agent) {
        case "chat":
            return "chat";
        case "coding":
            return "coding";
        case "ppt":
            return "ppt";
        case "pdf":
            return "pdf";
        case "search":
            return "search";
        case "pdfRag":
            return "pdfRag";
        case "imageAnalyse":
            return "imageAnalyse";
        case "fileAnalyse":
            return "fileAnalyse";
        case "imageGen":
            return "imageGen";
        default:
            return "chat";
    }
},{
    chat:"chat",
    search:"search",
    coding:"coding",
    ppt:"ppt",
    pdf:"pdf",
    imageGen:"imageGen",
    pdfRag:"pdfRag",
    imageAnalyse:"imageAnalyse"
    ,fileAnalyse:"fileAnalyse"
});


workflow.addEdge("search","chat");
workflow.addEdge("coding","__end__");
workflow.addEdge("pdf","__end__");
workflow.addEdge("ppt","__end__");
workflow.addEdge("imageGen","__end__");
workflow.addEdge("chat","__end__");
workflow.addEdge("imageAnalyse","__end__");
workflow.addEdge("fileAnalyse", "__end__");
workflow.addEdge("pdfRag","__end__");

export const graph=workflow.compile();
