// src/components/KeywordHighlighter.tsx
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { KeywordMatch } from '../services/keywordSearch';

interface KeywordHighlighterProps {
  matches: KeywordMatch[];
  currentMatchIndex: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
  onJumpToMatch: (match: KeywordMatch) => void;
}

export const KeywordHighlighter: React.FC<KeywordHighlighterProps> = ({
  matches,
  currentMatchIndex,
  onNavigate,
  onClose,
  onJumpToMatch
}) => {
  const [filterDocument, setFilterDocument] = useState<string>('all');
  const [filteredMatches, setFilteredMatches] = useState<KeywordMatch[]>(matches);

  useEffect(() => {
    if (filterDocument === 'all') {
      setFilteredMatches(matches);
    } else {
      setFilteredMatches(matches.filter(m => m.documentName === filterDocument));
    }
  }, [filterDocument, matches]);

  const uniqueDocuments = Array.from(
    new Set(matches.map(m => m.documentName))
  ).sort();

  const currentMatch = filteredMatches[currentMatchIndex];

  const handlePrevious = () => {
    if (currentMatchIndex > 0) {
      onNavigate(currentMatchIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentMatchIndex < filteredMatches.length - 1) {
      onNavigate(currentMatchIndex + 1);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white shadow-2xl rounded-lg border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Search Results</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-100 rounded transition-colors"
          aria-label="Close search results"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Statistics */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <span className="font-semibold">{matches.length}</span> match(es) found
          </p>
          <p>
            Across <span className="font-semibold">{uniqueDocuments.length}</span> document(s)
          </p>
        </div>
      </div>

      {/* Filter */}
      {uniqueDocuments.length > 1 && (
        <div className="p-4 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Document
          </label>
          <select
            value={filterDocument}
            onChange={(e) => setFilterDocument(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Documents ({matches.length})</option>
            {uniqueDocuments.map(doc => {
              const count = matches.filter(m => m.documentName === doc).length;
              return (
                <option key={doc} value={doc}>
                  {doc} ({count})
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Navigation */}
      {filteredMatches.length > 0 && (
        <>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">
                Match {currentMatchIndex + 1} of {filteredMatches.length}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={handlePrevious}
                  disabled={currentMatchIndex === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous match"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentMatchIndex === filteredMatches.length - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next match"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Current Match Details */}
            {currentMatch && (
              <div className="space-y-3">
                <div className="text-xs text-gray-500 space-y-1">
                  <p className="font-medium truncate" title={currentMatch.documentName}>
                    📄 {currentMatch.documentName}
                  </p>
                  <p>
                    📍 Page {currentMatch.pageNumber}, Line {currentMatch.lineNumber}
                  </p>
                  <p>
                    📏 Column {currentMatch.columnStart} - {currentMatch.columnEnd}
                  </p>
                </div>

                {/* Context Preview */}
                <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                  <div className="font-mono text-xs leading-relaxed">
                    <span className="text-gray-500">{currentMatch.contextBefore}</span>
                    <mark className="bg-yellow-200 px-1 rounded">
                      {currentMatch.matchedText}
                    </mark>
                    <span className="text-gray-500">{currentMatch.contextAfter}</span>
                  </div>
                </div>

                {/* Jump Button */}
                <button
                  onClick={() => onJumpToMatch(currentMatch)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Jump to Location in PDF
                </button>
              </div>
            )}
          </div>

          {/* Match List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredMatches.map((match, index) => (
              <button
                key={`${match.documentName}-${match.pageNumber}-${match.lineNumber}-${match.columnStart}`}
                onClick={() => {
                  onNavigate(index);
                  onJumpToMatch(match);
                }}
                className={`w-full p-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  index === currentMatchIndex ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="text-xs space-y-1">
                  <p className="font-medium text-gray-900 truncate">
                    {match.documentName}
                  </p>
                  <p className="text-gray-600">
                    Page {match.pageNumber} • Line {match.lineNumber}
                  </p>
                  <p className="font-mono text-gray-500 truncate">
                    ...{match.contextBefore}
                    <span className="font-bold text-blue-600">{match.matchedText}</span>
                    {match.contextAfter}...
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* No Results */}
      {filteredMatches.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No matches found in selected documents</p>
        </div>
      )}
    </div>
  );
};

export default KeywordHighlighter;
