import React from "react";
import { Check, Copy } from "lucide-react";

interface CodeSnippetProps {
  code: string;
  language?: string;
  fileName?: string;
  highlightLine?: number;
}

export function CodeSnippet({
  code,
  language = "typescript",
  fileName,
  highlightLine,
}: CodeSnippetProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split("\n");

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-[#06080C] text-xs">
      <div className="flex items-center justify-between border-b border-line/70 bg-panel/70 px-4 py-2">
        <span className="font-mono text-[11px] text-muted">
          {fileName ?? `snippet.${language}`}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-[11px] text-muted hover:bg-panel-raised hover:text-ink transition-colors"
          title="Copy code"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <div className="no-scrollbar overflow-x-auto p-4 font-mono text-[12px] leading-6">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isHighlighted = lineNum === highlightLine;
              return (
                <tr
                  key={idx}
                  className={isHighlighted ? "bg-accent/[0.12] text-accent" : "text-ink/90"}
                >
                  <td className="w-8 select-none pr-4 text-right text-muted/40 font-mono text-[11px]">
                    {lineNum}
                  </td>
                  <td className="whitespace-pre font-mono">{line}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

