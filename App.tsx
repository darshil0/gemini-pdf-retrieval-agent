import React, { useState } from 'react';
import { Search, Loader2, Sparkles, BookOpen, Trash2, X, FileText } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { SearchResultCard } from './components/SearchResultCard';
import { searchInDocuments } from './services/geminiService';
import { UploadedFile, AppStatus, SearchResponse } from './types';

export default function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewingResult, setViewingResult] = useState<{ file: UploadedFile, page: number } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 || !keyword.trim()) return;

    setStatus(AppStatus.ANALYZING);
    setError(null);
    setData(null);

    try {
      const fileObjects = files.map(f => f.file);
      const response = await searchInDocuments(fileObjects, keyword);
      setData(response);
      setStatus(AppStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while analyzing the documents.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setData(null);
    setStatus(AppStatus.IDLE);
    setKeyword('');
    setViewingResult(null);
    // Optionally clear files: setFiles([]);
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setViewingResult(null)}
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
                  <p className="text-sm text-slate-400">Viewing Page {viewingResult.page}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingResult(null)}
                className="flex-shrink-0 p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors focus:outline-none"
                aria-label="Close Viewer"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Iframe Viewer */}
            <div className="flex-1 bg-slate-800 relative">
              <iframe
                key={`${viewingResult.file.id}-${viewingResult.page}`}
                src={`${viewingResult.file.previewUrl}#page=${viewingResult.page}`}
                className="w-full h-full border-none"
                title={`PDF viewer for ${viewingResult.file.file.name}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}