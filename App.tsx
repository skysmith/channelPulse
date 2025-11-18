import React, { useState } from 'react';
import { SlackMessage, AppState, AnalysisResult, DeepDiveSection } from './types';
import { generateMockConversation } from './utils/mockData';
import { generateSummary, generateDeepDive, generatePodcastAudio } from './services/geminiService';
import { fetchSlackHistory } from './services/slackService';
import AnalysisDashboard from './components/AnalysisDashboard';
import { Spinner } from './components/Spinner';

// Icons
const SlackIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
     <path d="M5.042 15.123a2.52 2.52 0 0 1-2.52-2.52 2.52 2.52 0 0 1 2.52-2.52h2.52v5.04zm5.04-5.04a2.52 2.52 0 0 1 2.52-2.52 2.52 2.52 0 0 1 2.52 2.52v2.52h-5.04v-2.52zm0 7.56a2.52 2.52 0 0 1 2.52 2.52 2.52 2.52 0 0 1-2.52 2.52 2.52 2.52 0 0 1-2.52-2.52v-2.52h2.52zm5.04-5.04a2.52 2.52 0 0 1-2.52-2.52 2.52 2.52 0 0 1 2.52-2.52h2.52v5.04zm2.52 5.04a2.52 2.52 0 0 1 2.52 2.52 2.52 2.52 0 0 1-2.52 2.52v-2.52h2.52v2.52zM5.042 8.823a2.52 2.52 0 0 1 0-5.04 2.52 2.52 0 0 1 0 5.04h-2.52v-2.52h2.52zm5.04 5.04a2.52 2.52 0 0 1 0 5.04 2.52 2.52 0 0 1 0-5.04h2.52v2.52h-2.52zm5.04-10.08a2.52 2.52 0 0 1 0 5.04 2.52 2.52 0 0 1 0-5.04h-2.52V6.3h2.52zm2.52 5.04a2.52 2.52 0 0 1 5.04 0 2.52 2.52 0 0 1-5.04 0V8.82h2.52v2.52z" />
  </svg>
);

type DataSource = 'DEMO' | 'PASTE' | 'API';

export default function App() {
  const [messages, setMessages] = useState<SlackMessage[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  
  // Configuration
  const [dataSource, setDataSource] = useState<DataSource>('DEMO');
  const [timeRange, setTimeRange] = useState('3'); // hours
  
  // API Inputs
  const [slackToken, setSlackToken] = useState('');
  const [channelId, setChannelId] = useState('');
  
  // Manual Input
  const [customText, setCustomText] = useState('');

  // Results
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [deepDive, setDeepDive] = useState<DeepDiveSection[] | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScan = async () => {
    setAppState(AppState.SCANNING);
    setMessages([]);
    setAnalysis(null);
    setDeepDive(null);
    setAudioBuffer(null);
    setErrorMsg(null);

    try {
      let convoData: SlackMessage[] = [];

      if (dataSource === 'DEMO') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        convoData = generateMockConversation();
      } 
      else if (dataSource === 'PASTE') {
        if (!customText.trim()) throw new Error("Please paste a transcript first.");
        // Simple parser for manual text
        convoData = [{
          id: 'manual-' + Date.now(),
          user: 'Imported Context',
          avatar: '',
          timestamp: new Date().toLocaleTimeString(),
          text: customText
        }];
      } 
      else if (dataSource === 'API') {
        if (!slackToken || !channelId) throw new Error("Please provide both a User Token and Channel ID.");
        convoData = await fetchSlackHistory(slackToken, channelId, parseInt(timeRange));
        if (convoData.length === 0) throw new Error("No messages found in this channel for the selected time range.");
      }

      setMessages(convoData);
      
      // Phase 2: Analyze
      setAppState(AppState.ANALYZING);
      
      const [summaryResult, deepDiveResult] = await Promise.all([
        generateSummary(convoData),
        generateDeepDive(convoData)
      ]);

      setAnalysis(summaryResult);
      setDeepDive(deepDiveResult);

      // Phase 3: Audio
      setAppState(AppState.GENERATING_AUDIO);
      const audio = await generatePodcastAudio(convoData);
      setAudioBuffer(audio);

      setAppState(AppState.COMPLETE);

    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "An unexpected error occurred.");
      setAppState(AppState.IDLE);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
               <SlackIcon />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              ChannelPulse
            </span>
          </div>
          <div className="text-sm text-slate-500 hidden md:block">
            Powered by Gemini 2.5 Flash & TTS
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Scanner Configuration Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-6 w-fit">
            {(['DEMO', 'PASTE', 'API'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setDataSource(mode)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  dataSource === mode 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {mode === 'DEMO' ? 'Demo Data' : mode === 'PASTE' ? 'Paste Transcript' : 'Connect Slack API'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
            
            {/* Inputs based on Source */}
            <div className="md:col-span-8 space-y-4">
              
              {dataSource === 'DEMO' && (
                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p>This mode uses a pre-generated conversation about a "staging latency incident" to demonstrate the capabilities of Gemini 2.5 without needing an API key.</p>
                </div>
              )}

              {dataSource === 'PASTE' && (
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Conversation Transcript</label>
                    <textarea
                      rows={4}
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                      placeholder="Paste copied messages from Slack here..."
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                    />
                 </div>
              )}

              {dataSource === 'API' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">User OAuth Token (xoxp-)</label>
                      <input 
                        type="password" 
                        value={slackToken}
                        onChange={(e) => setSlackToken(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="xoxp-..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Channel ID</label>
                      <input 
                        type="text" 
                        value={channelId}
                        onChange={(e) => setChannelId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="C012345678"
                      />
                    </div>
                    <div className="md:col-span-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                      <strong>Warning:</strong> Connecting directly from the browser often fails due to CORS (Cross-Origin Resource Sharing) restrictions enforced by Slack. If this fails, please use the <strong>Paste Transcript</strong> tab.
                    </div>
                 </div>
              )}
            </div>

            {/* Time Range & Scan Button */}
            <div className="md:col-span-4 space-y-4 flex flex-col justify-end">
               {dataSource !== 'PASTE' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Time Range</label>
                    <select 
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="1">Last 1 Hour</option>
                      <option value="3">Last 3 Hours</option>
                      <option value="6">Last 6 Hours</option>
                      <option value="24">Last 24 Hours</option>
                    </select>
                  </div>
               )}

               <button
                onClick={handleScan}
                disabled={appState !== AppState.IDLE && appState !== AppState.COMPLETE}
                className={`w-full py-3 px-4 rounded-lg font-semibold shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2
                  ${appState === AppState.IDLE || appState === AppState.COMPLETE 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700' 
                    : 'bg-slate-100 text-slate-400 cursor-wait'}`}
               >
                 {appState === AppState.SCANNING && <Spinner />}
                 {appState === AppState.SCANNING ? 'Scanning...' : 
                  appState === AppState.ANALYZING ? 'Analyzing...' :
                  appState === AppState.GENERATING_AUDIO ? 'Creating Audio...' :
                  'Generate Report'}
               </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {errorMsg}
            </div>
          )}

        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Message Feed (Visual Context) */}
            {messages.length > 0 && (
                 <div className="lg:col-span-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col max-h-[600px]">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-700">Scanned Messages</h3>
                            <span className="text-xs text-slate-400">{messages.length} items</span>
                        </div>
                        <div className="overflow-y-auto flex-1 p-4 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className="flex gap-3 group">
                                    {msg.avatar ? (
                                        <img src={msg.avatar} alt={msg.user} className="w-8 h-8 rounded-md bg-slate-200 object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {msg.user.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2 flex-wrap">
                                            <span className="text-sm font-bold text-slate-800 truncate">{msg.user}</span>
                                            <span className="text-xs text-slate-400">{msg.timestamp}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-0.5 leading-relaxed break-words">{msg.text}</p>
                                        {msg.reactions && (
                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                {msg.reactions.map((rx, i) => (
                                                    <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
                                                        {rx.emoji} {rx.count}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Right: Analysis Dashboard */}
            <div className={messages.length > 0 ? "lg:col-span-8" : "lg:col-span-12"}>
                {(appState === AppState.ANALYZING || appState === AppState.GENERATING_AUDIO) && (
                    <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4 bg-white rounded-2xl border border-slate-100 border-dashed">
                         <Spinner />
                         <p className="animate-pulse font-medium text-indigo-600">
                            {appState === AppState.ANALYZING ? "Analyzing conversation & identifying decisions..." : "Generating podcast audio with Gemini TTS..."}
                         </p>
                    </div>
                )}
                
                {appState === AppState.COMPLETE && analysis && deepDive && (
                    <AnalysisDashboard 
                        analysis={analysis}
                        deepDive={deepDive}
                        audioBuffer={audioBuffer}
                    />
                )}

                {appState === AppState.IDLE && (
                    <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-slate-200 border-dashed">
                         <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                             <SlackIcon />
                         </div>
                         <h3 className="text-lg font-medium text-slate-600">Ready to Scan</h3>
                         <p className="text-sm max-w-md text-center mt-2 text-slate-500">
                             Select a data source above to generate a comprehensive summary, deep dive report, and podcast-style audio overview.
                         </p>
                    </div>
                )}
            </div>

        </div>
      </main>
    </div>
  );
}