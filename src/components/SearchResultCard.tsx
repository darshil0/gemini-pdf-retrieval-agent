import React from 'react';
import { FileText, Bookmark, Eye } from 'lucide-react';
import { SearchResult } from '../types';

interface SearchResultCardProps {
  result: SearchResult;
  fileName: string;
  keyword: string;
  onView: () => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ result, fileName, keyword, onView }) => {
  // Determine what to highlight: prefer the exact term found by AI, fallback to search keyword
  const termToHighlight = result.matchedTerm || keyword;

  // Highlight logic with regex escaping for special characters
  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }

    // Escape special characters to ensure they are treated as literals in RegExp
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');

    // Split includes the captured groups (the matches)
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-yellow-500/30 text-yellow-200 border-b border-yellow-500 px-1 rounded-sm font-medium">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="glass-panel rounded-xl p-5 hover:bg-slate-800/80 transition-all border-l-4 border-l-blue-500 group flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2 text-blue-400">
          <FileText size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">Doc #{result.docIndex + 1}</span>
          <span className="text-sm text-slate-300 font-medium truncate max-w-[200px]" title={fileName}>
            {fileName}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-emerald-400 bg-emerald-900/20 px-2 py-1 rounded text-xs font-medium border border-emerald-500/20">
          <Bookmark size={12} />
          <span>Page {result.pageNumber}</span>
        </div>
      </div>

      <div className="mb-4 text-slate-300 leading-relaxed text-sm bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex-grow">
        <span className="text-slate-500 mr-1">&quot;...</span>
        {getHighlightedText(result.contextSnippet, termToHighlight)}
        <span className="text-slate-500 ml-1">...&quot;</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 mt-auto">
        <span className="text-xs text-slate-500 italic truncate pr-2" title={result.relevanceExplanation}>
          {result.relevanceExplanation}
        </span>
        <button
          onClick={onView}
          className="flex-shrink-0 flex items-center space-x-2 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded transition-colors border border-blue-500/20"
        >
          <Eye size={14} />
          <span>View Page {result.pageNumber}</span>
        </button>
      </div>
    </div>
  );
};