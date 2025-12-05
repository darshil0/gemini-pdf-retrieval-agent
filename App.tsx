import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, BookOpen, Trash2, X, FileText, RotateCw, RotateCcw, ChevronLeft, ChevronRight, History, Download } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { SearchResultCard } from './components/SearchResultCard';
import { searchInDocuments } from './services/geminiService';
import { UploadedFile, AppStatus, SearchResponse } from './types';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure worker for react-pdf
// Using esm.sh to match the version in importmap
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

export default function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewingResult, setViewingResult] = useState<{ file: UploadedFile, page: number } | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // PDF Viewer State
  const [rotation, setRotation] = useState(0);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfScale, setPdfScale] = useState(1.0);

  // Use a ref to keep track of files for cleanup on unmount
  const filesRef = useRef(files);
  filesRef.current = files;

  // Cleanup object URLs ONLY when component unmounts to avoid memory leaks
  useEffect(() => {
    return () => {
      filesRef.current.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, []);

  // Load recent searches from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('docuSearch_recent');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Invalid JSON in localStorage, ignore and start fresh
        localStorage.removeItem('docuSearch_recent');
      }
    }
  }, []);

  // Initialize viewer state when opening a file
  useEffect(() => {
    if (viewingResult) {
      setCurrentPage(viewingResult.page);
      setRotation(0);
      setNumPages(null); // Reset page count until loaded
      setPdfScale(1.0);
    }
  }, [viewingResult]);

  // Add keyboard accessibility for the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setViewingResult(null);
      }
    };

    if (viewingResult) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewingResult]);

  const updateRecentSearches = (term: string) => {
    setRecentSearches(prev => {
      // Remove duplicates (case-insensitive check) and add to front
      const filtered = prev.filter(t => t.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, 5); // Keep top 5
      localStorage.setItem('docuSearch_recent', JSON.stringify(updated));
      return updated;
    });
  };

  const executeSearch = async (term: string) => {
    if (files.length === 0 || !term.trim()) return;

    // Update input to reflect what is being searched
    setKeyword(term);

    // Add to history
    updateRecentSearches(term);

    setStatus(AppStatus.ANALYZING);
    setError(null);
    setData(null);

    try {
      const fileObjects = files.map(f => f.file);
      const response = await searchInDocuments(fileObjects, term);
      setData(response);
      setStatus(AppStatus.COMPLETE);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while analyzing the documents.";
      setError(errorMessage);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(keyword);
  };

  const handleReset = () => {
    // Revoke object URLs to prevent memory leaks
    files.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });

    setData(null);
    setStatus(AppStatus.IDLE);
    setKeyword('');
    setViewingResult(null);
    setFiles([]);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setCurrentPage(prev => {
      const newPage = prev + offset;
      if (numPages && (newPage < 1 || newPage > numPages)) return prev;
      return newPage;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-200">
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              DocuSearch Agent
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {status === AppStatus.COMPLETE && (
              <button
                onClick={handleReset}
                className="text-sm text-slate-400 hover:text-white flex items-center space-x-2 transition-colors"
              >
                <Trash2 size={16} />
                <span>Clear Results</span>
              </button>
            )}
            <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400">
              Gemini 2.5 Flash
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Input Section */}
        <section className="space-y-6">
          <div className="bg-slate-800/50 rounded-2xl p-1 border border-slate-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
              {/* File Upload Column */}
              <div className="lg:col-span-5 space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs mr-2">1</span>
                  Upload Documents
                </h2>
                <FileUpload
                  files={files}
                  setFiles={setFiles}
                  disabled={status === AppStatus.ANALYZING}
                />
              </div>

              {/* Vertical Divider */}
              <div className="hidden lg:block w-px bg-slate-700/50 mx-auto h-full"></div>

              {/* Search Column */}
              <div className="lg:col-span-6 space-y-4 flex flex-col">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs mr-2">2</span>
                  Define Search Criteria
                </h2>

                <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div>
                    <label htmlFor="keyword" className="block text-sm font-medium text-slate-400 mb-2">
                      Target Keyword or Phrase
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="keyword"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="e.g., 'Financial Q3 results', 'Safety Protocols', 'Project Alpha'"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-4 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={status === AppStatus.ANALYZING}
                      />
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    </div>
                  </div>

                  <button
                    onClick={handleSearch}
                    disabled={status === AppStatus.ANALYZING || files.length === 0 || !keyword.trim()}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95
                      ${status === AppStatus.ANALYZING || files.length === 0 || !keyword.trim()
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/20'
                      }`}
                  >
                    {status === AppStatus.ANALYZING ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        <span>Analyzing Documents...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Find Occurrences</span>
                      </>
                    )}
                  </button>

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="pt-2 animate-fade-in">
                      <div className="flex items-center text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                        <History className="w-3 h-3 mr-1.5" />
                        Recent Searches
                      </div>
                      <ul className="flex flex-wrap gap-2">
                        {recentSearches.map((term, i) => (
                          <li key={i}>
                            <button
                              onClick={() => executeSearch(term)}
                              disabled={status === AppStatus.ANALYZING || files.length === 0}
                              title={files.length === 0 ? "Upload files first" : "Run search"}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700 text-sm text-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center group"
                            >
                              <span>{term}</span>
                              <Search className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-center animate-fade-in">
            <p className="font-medium">Error Encountered</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {status === AppStatus.COMPLETE && data && (
          <section className="space-y-6 animate-fade-in-up pb-12">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Search Results</h3>
              <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                {data.results.length} matches found
              </span>
            </div>

            {/* AI Summary */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 p-6 rounded-xl border border-blue-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>
              <h4 className="text-blue-400 font-semibold mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Analysis Summary
              </h4>
              <p className="text-slate-300 leading-relaxed">
                {data.summary}
              </p>
            </div>

            {/* Results Grid */}
            {data.results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.results.map((result, idx) => {
                  const file = files[result.docIndex];
                  if (!file) return null;
                  return (
                    <SearchResultCard
                      key={idx}
                      result={result}
                      fileName={file.file.name}
                      keyword={keyword}
                      onView={() => setViewingResult({ file, page: result.pageNumber })}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 bg-slate-800/30 rounded-xl border border-slate-700 border-dashed">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No exact matches found for "{keyword}".</p>
                <p className="text-sm">Try broadening your search term.</p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* PDF Viewer Modal */}
      {viewingResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setViewingResult(null)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setViewingResult(null)}
            role="button"
            tabIndex={0}
            aria-label="Close Viewer"
          ></div>

          {/* Modal Content */}
          <div className="relative w-full h-full max-w-6xl bg-slate-900 rounded-2xl shadow-2xl flex flex-col border border-slate-700 overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/90 z-10">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="flex-shrink-0 p-2 bg-red-500/10 rounded-lg text-red-500">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-white truncate">{viewingResult.file.file.name}</h3>
                  <p className="text-sm text-slate-400">
                    Page {currentPage} of {numPages || '--'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Page Navigation Controls */}
                <div className="flex items-center space-x-1 bg-slate-900/50 rounded-lg p-1 border border-slate-700 mr-2">
                  <button
                    onClick={() => changePage(-1)}
                    disabled={currentPage <= 1}
                    className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Previous Page"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="px-2 text-xs font-mono text-slate-400 w-12 text-center">
                    {currentPage} / {numPages || '-'}
                  </span>
                  <button
                    onClick={() => changePage(1)}
                    disabled={numPages ? currentPage >= numPages : true}
                    className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Next Page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Rotation Controls */}
                <div className="flex items-center space-x-1 bg-slate-900/50 rounded-lg p-1 border border-slate-700">
                  <button
                    onClick={() => setRotation(prev => (prev - 90 + 360) % 360)}
                    className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"
                    title="Rotate Counter-Clockwise"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"
                    title="Rotate Clockwise"
                  >
                    <RotateCw size={18} />
                  </button>
                </div>

                {/* Download Button */}
                <a
                  href={viewingResult.file.previewUrl}
                  download={viewingResult.file.file.name}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center justify-center border border-transparent hover:border-slate-600"
                  title="Download Document"
                >
                  <Download size={20} />
                </a>

                <div className="w-px h-6 bg-slate-700 mx-2"></div>

                <button
                  onClick={() => setViewingResult(null)}
                  className="flex-shrink-0 p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors focus:outline-none"
                  aria-label="Close Viewer"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* PDF Canvas Viewer */}
            <div className="flex-1 bg-slate-800 relative overflow-auto flex justify-center p-8">
              <Document
                file={viewingResult.file.file}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full animate-fade-in">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-slate-600" />
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">Loading Document</h4>
                    <p className="text-slate-400">Rendering page {viewingResult.page}...</p>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-full text-red-400">
                    <p>Failed to load PDF document.</p>
                  </div>
                }
                className="shadow-2xl"
              >
                <Page
                  pageNumber={currentPage}
                  rotate={rotation}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  scale={pdfScale}
                  height={window.innerHeight * 0.75}
                  className="border border-slate-600 shadow-xl"
                />
              </Document>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}