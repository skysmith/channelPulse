import React from 'react';
import { AnalysisResult, DeepDiveSection } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';

interface AnalysisDashboardProps {
  analysis: AnalysisResult | null;
  deepDive: DeepDiveSection[] | null;
  audioBuffer: AudioBuffer | null;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis, deepDive, audioBuffer }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const sourceRef = React.useRef<AudioBufferSourceNode | null>(null);

  const playAudio = () => {
    if (!audioBuffer) return;
    
    if (isPlaying) {
        sourceRef.current?.stop();
        setIsPlaying(false);
        return;
    }

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.onended = () => setIsPlaying(false);
    source.start();
    sourceRef.current = source;
    setIsPlaying(true);
  };

  if (!analysis || !deepDive) return null;

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header / Podcast Player */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Channel Pulse Report</h2>
          <p className="text-slate-500">Generated from recent conversation history</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl w-full md:w-auto border border-slate-100">
          <button 
            onClick={playAudio}
            disabled={!audioBuffer}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
              !audioBuffer ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
              isPlaying ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
            }`}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 pl-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800">Audio Overview</span>
            <span className="text-xs text-slate-500">{audioBuffer ? "Ready to play" : "Generating..."}</span>
          </div>
          {/* Simple Visualizer Bars */}
          {isPlaying && (
             <div className="flex items-end gap-1 h-6">
                <div className="w-1 bg-rose-400 animate-[bounce_1s_infinite] h-full"></div>
                <div className="w-1 bg-rose-400 animate-[bounce_1.2s_infinite] h-3/4"></div>
                <div className="w-1 bg-rose-400 animate-[bounce_0.8s_infinite] h-1/2"></div>
                <div className="w-1 bg-rose-400 animate-[bounce_1.1s_infinite] h-4/5"></div>
             </div>
          )}
        </div>
      </div>

      {/* Top Row: Summary & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executive Summary */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Executive Summary</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">{analysis.summary}</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Key Decisions</h4>
                    <ul className="space-y-2">
                        {analysis.keyDecisions.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Action Items</h4>
                    <ul className="space-y-2">
                        {analysis.actionItems.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        {/* Topic Intensity Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
             <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Topic Intensity</h3>
            </div>
            <div className="flex-grow min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis.topicIntensity} layout="vertical" margin={{ left: 0, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="topic" type="category" width={100} tick={{fontSize: 11, fill: '#64748b'}} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="intensity" radius={[0, 4, 4, 0]} barSize={24}>
                            {analysis.topicIntensity.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Deep Dive Notebook Section */}
      <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-slate-800">NotebookLM Deep Dive</h3>
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">Generated</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deepDive.map((section, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
                      <h4 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">{section.title}</h4>
                      <div className="prose prose-sm prose-slate max-w-none">
                          <ReactMarkdown>{section.content}</ReactMarkdown>
                      </div>
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
};

export default AnalysisDashboard;