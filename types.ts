export interface SlackMessage {
  id: string;
  user: string;
  avatar: string;
  timestamp: string;
  text: string;
  reactions?: { emoji: string; count: number }[];
}

export interface AnalysisResult {
  summary: string;
  keyDecisions: string[];
  actionItems: string[];
  topicIntensity: { topic: string; intensity: number }[];
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  COMPLETE = 'COMPLETE',
}

export interface DeepDiveSection {
  title: string;
  content: string;
}
