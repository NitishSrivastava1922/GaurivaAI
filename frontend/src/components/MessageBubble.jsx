import { Check, Copy, Download, ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MessageBubble({ role, content, images = [] }) {
  const isUser = role === "user";
  const [lightBox, setLightBox] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");
  const displayContent =
    content === "Here's your generated image:" ? "" : content;

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 2000);
    } catch {
      setCopiedCode("");
    }
  };

  const downloadImage = async (image, index) => {
    try {
      const response = await fetch(image);
      if (!response.ok) throw new Error("Unable to download image");

      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
    } catch {
      const link = document.createElement("a");
      link.href = image;
      link.download = `generated-image-${index + 1}.png`;
      link.target = "_blank";
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setLightBox(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mt-2`}>
      <div
        className={`w-fit max-w-[92vw] md:max-w-[72%]
    px-4 py-2.5 rounded-2xl
    wrap-break-word overflow-hidden
    leading-relaxed
    ${
      isUser
        ? "bg-linear-to-br from-indigo-500 to-violet-700 text-white rounded-tr-sm"
        : "text-slate-200 rounded-tl-sm"
    }`}
      >
        {Array.isArray(images) && images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {images.filter(Boolean).map((image, index) => (
              <div key={`${image}-${index}`} className="relative min-w-0">
                <button
                  type="button"
                  className="w-full aspect-video rounded-lg overflow-hidden bg-white/5 cursor-zoom-in"
                  onClick={() => setLightBox(image)}
                  aria-label="Open image preview"
                >
                  <img
                    src={image}
                    alt="Search result"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                      event.currentTarget.closest(".min-w-0").style.display = "none";
                    }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => downloadImage(image, index)}
                  className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white shadow-sm transition-colors hover:bg-black/80"
                  aria-label="Download image"
                >
                  <Download size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
        {displayContent && <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mt-5 mb-3">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mt-4 mb-2">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold mt-3 mb-2">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 whitespace-pre-wrap wrap-break-word">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-white/10">
                  {children}
                </table>
              </div>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 underline inline-flex items-center gap-1"
              >
                {children}
                <ExternalLink size={14} />
              </a>
            ),
            code: ({ className, children }) => {
              const value = String(children).replace(/\n$/, "");
              const language = className?.replace("language-", "") || "";

              if (!className) {
                return (
                  <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-indigo-400">
                    {children}
                  </code>
                );
              }

              return (
                <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#111318]">
                  <div className="flex items-center justify-between bg-[#1b1d24] border-b border-white/10 px-4 py-2">
                    <span className="uppercase text-xs text-slate-400">
                      {language || "code"}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCode(value)}
                      className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedCode === value ? (
                        <>
                          <Check size={16} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-slate-100">
                    <code className={className}>{value}</code>
                  </pre>
                </div>
              );
            },
          }}
        >
          {displayContent}
        </Markdown>}
      </div>
      {lightBox && (
        <div
          className="fixed inset-0 z-100 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setLightBox(null)}
        >
          <button
            type="button"
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 rounded-full p-2"
            onClick={() => setLightBox(null)}
            aria-label="Close image preview"
          >
            <X />
          </button>
          <img
            src={lightBox}
            alt="Search result preview"
            className="max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain"
            referrerPolicy="no-referrer"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
