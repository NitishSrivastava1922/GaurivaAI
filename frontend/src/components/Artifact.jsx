import {
  Check,
  Code2,
  Copy,
  Eye,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { easeInOut, motion } from "motion/react";
import Editor from "@monaco-editor/react"

function Artifact() {
  const [collapsed, setCollapsed] = useState(false);
  const { artifactsByConversation, messages, activeConversationId } = useSelector(
    (state) => state.message,
  );
  const [tab, setTab] = useState("code");
  const [activeFile, setActiveFile] = useState(0);
  const [selectedArtifactId, setSelectedArtifactId] = useState(null);
  const [copied,setCopied]=useState("");

  const messageArtifacts = [...messages]
    .reverse()
    .flatMap((message) => message.artifacts || []);
  const storedArtifacts = artifactsByConversation[activeConversationId] || [];
  const knownArtifactIds = new Set(messageArtifacts.map((artifact) => artifact.id));
  const artifacts = [
    ...messageArtifacts,
    ...storedArtifacts.filter((artifact) => !knownArtifactIds.has(artifact.id)),
  ];

  
  const projectArtifacts = artifacts.filter(
    (artifact) => Array.isArray(artifact.files) && artifact.files.length > 0,
  );
  const latestArtifactId = projectArtifacts[0]
  ? String(projectArtifacts[0].id)
  : null;
  
  useEffect(() => {
    if (latestArtifactId) {
      setSelectedArtifactId(latestArtifactId);
      setActiveFile(0);
      setTab("code");
      setCollapsed(false);
    }
  }, [latestArtifactId]);
  
  if (projectArtifacts.length === 0) return null;
  
  const selectedArtifact =
  projectArtifacts.find(
    (artifact) => String(artifact.id) === selectedArtifactId,
  ) ||
  projectArtifacts[0];
  const files = selectedArtifact.files;
  const file = files[activeFile] || files[0];
  
  const htmlFile = files.find((f) => f.name === "index.html");
  
  const cssFile = files.find((f) => f.name === "style.css");
  
  const jsFile = files.find((f) => f.name === "script.js");
  
  const canPreview = Boolean(htmlFile);
  
  const previewDoc = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
  ${cssFile?.content || ""}
  </style>
  </head>
  <body>
  ${htmlFile?.content || ""}
  
  <script>
  ${jsFile?.content || ""}
  </script>
  </body>
  </html>
  `;
  const detectLanguage = (fileName = "") => {
    const name = fileName.toLowerCase();
    
    if (name.endsWith(".html") || name.endsWith(".htm"))
      return "html";
    
    if (name.endsWith(".css"))
      return "css";
    
    if (name.endsWith(".js"))
      return "javascript";
    
    if (name.endsWith(".jsx"))
      return "javascript";
    
    if (name.endsWith(".ts"))
      return "typescript";
    
    if (name.endsWith(".tsx"))
      return "typescript";
    
    if (name.endsWith(".json"))
      return "json";
    
    if (name.endsWith(".py"))
      return "python";
    
    if (name.endsWith(".java"))
      return "java";
    
    if (name.endsWith(".cpp") || name.endsWith(".cc") || name.endsWith(".cxx"))
      return "cpp";
    
    if (name.endsWith(".c"))
      return "c";
    
    if (name.endsWith(".cs"))
      return "csharp";
    
    if (name.endsWith(".php"))
      return "php";
    
    if (name.endsWith(".go"))
      return "go";
    
    if (name.endsWith(".rs"))
      return "rust";
    
    if (name.endsWith(".rb"))
      return "ruby";
    
    if (name.endsWith(".swift"))
      return "swift";
    
    if (name.endsWith(".kt") || name.endsWith(".kts"))
      return "kotlin";
    
    if (name.endsWith(".sql"))
      return "sql";
    
    if (name.endsWith(".xml"))
      return "xml";
    
    if (name.endsWith(".yaml") || name.endsWith(".yml"))
      return "yaml";
    
    if (name.endsWith(".md"))
      return "markdown";
    
    if (name.endsWith(".sh"))
      return "shell";
    
    if (name.endsWith(".txt"))
      return "plaintext";
    
    return "plaintext";
  };
  const handleCopy=async()=>{
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(file.content);
      window.setTimeout(() => setCopied(""), 2000);
    } catch {
      setCopied("");
    }
  }
  return (
    <motion.div
    initial={{ width: 350 }}
    animate={{ width: collapsed ? 48 : 350 }}
    transition={{
        duration: 0.25,
        ease: easeInOut,
      }}
      className="hidden lg:flex h-full border-l border-white/6 flex-col overflow-hidden shrink-0"
    >
      {!collapsed ? (
        <div className="flex flex-col h-full bg-[#0d0f14]">
          <div className="h-14 px-4 border-b border-white/6 flex items-center gap-3 shrink-0">
            <button
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              <PanelRightClose size={16} />
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                <Code2 className="text-indigo-400" size={12} />
              </div>

              <div className="text-[13px] font-medium text-slate-200 truncate">
                {selectedArtifact.title || "Generated project"}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors duration-150 bg-transparent border-none cursor-pointer">
                {copied?<Check size={15}/>:<Copy size={15} />}
              </button>
            </div>
          </div>

          {projectArtifacts.length > 1 && (
            <div className="px-4 pt-3">
              <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                Generated projects
              </label>
              <select
                value={String(selectedArtifact.id)}
                onChange={(event) => {
                  setSelectedArtifactId(event.target.value);
                  setActiveFile(0);
                  setTab("code");
                }}
                className="w-full rounded-lg border border-white/8 bg-white/4 px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
              >
                {projectArtifacts.map((artifact, index) => (
                  <option key={artifact.id} value={artifact.id}>
                    {index === 0 ? "Latest — " : ""}
                    {artifact.title || "Generated project"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {canPreview && (
            <div className="flex items-center gap-1 bg-white/4 border border-white/6 p-1 rounded-lg">
              <button
                onClick={() => setTab("code")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150 ${
                  tab === "code"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-500 hover:text-slate-200"
                }`}
              >
                <Code2 size={11} /> Code
              </button>

              <button
                onClick={() => setTab("preview")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150 ${
                  tab === "preview"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-500 hover:text-slate-200"
                }`}
              >
                <Eye size={11} /> Preview
              </button>
            </div>
          )}

          {tab == "code" && (
            <div className="flex h-auto border-b border-white/6 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden shrink-0">
              {files.map((f, index) => (
                <button
                  key={f.name}
                  onClick={() => setActiveFile(index)}
                  className={`px-4 py-2.5 text-[11px] font-medium whitespace-nowrap transition-colors duration-150 border-r border-white/5] relative cursor-pointer bg-transparent ${
                    activeFile === index
                      ? "text-indigo-400"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {f?.name}

                  {activeFile === index && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            {tab === "preview" && canPreview ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <iframe
                  title="preview"
                  srcDoc={previewDoc}
                  sandbox='allow-scripts'
                  className="w-full h-full bg-white"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                  <Editor theme="vs-dark" language={detectLanguage(file?.name)} value={file?.content} options={{readOnly:true,minimap:{enabled:false},fontSize:13 ,wordWrap:"on",automaticLayout:true,scrollBeyondLastLine:false,padding:{top:16},lineNumbers:"on",renderLineHighlight:"none"}}/>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex h-full border-l border-white/6 bg-[#0d0f14] flex-col items-center py-4 gap-4 shrink-0">
          <button
            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
            onClick={() => setCollapsed((prev) => !prev)}
          >
            <PanelRightOpen size={16} />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="text-[10px] font-medium text-slate-600 tracking-widest uppercase whitespace-nowrap"
              style={{
                writingMode: "vertical-lr",
                transform: "rotate(180deg)",
              }}
            >
              Artifact
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Artifact;
