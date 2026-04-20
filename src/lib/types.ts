// Database Types for Toastmasters Meeting Management

export interface Club {
  id: string;
  name: string;
  description: string;
  location: string;
  meetingDay: string;
  meetingTime: string;
  createdAt: string;
}

export interface Member {
  id: string;
  clubId: string;
  name: string;
  email: string;
  role: 'member' | 'officer' | 'guest';
  joinedAt: string;
}

export interface Meeting {
  id: string;
  clubId: string;
  date: string;
  theme: string;
  wordOfTheDay: {
    word: string;
    definition: string;
    partOfSpeech: string;
    exampleSentence: string;
  };
  idiomOfTheDay: {
    idiom: string;
    meaning: string;
    exampleSentence: string;
  };
  roles: MeetingRoles;
  status: 'scheduled' | 'in-progress' | 'completed';
  createdAt: string;
}

export interface MeetingRoles {
  toastmaster?: string; // Member ID
  generalEvaluator?: string;
  timer?: string;
  ahCounter?: string;
  grammarian?: string;
  topicsmaster?: string; // Table Topics Master
  speakers: SpeakerSlot[];
  evaluators: EvaluatorSlot[];
  tableTopicsSpeakers: TableTopicsSpeakerSlot[];
}

export interface SpeakerSlot {
  id: string;
  memberId: string;
  speechTitle: string;
  speechProject?: string; // e.g., "Ice Breaker", "CC1", etc.
  pathway?: string; // e.g., "Dynamic Leadership", "Innovative Planning"
  level?: string; // e.g., "Level 1", "Level 2"
  duration?: number; // planned duration in minutes
  greenTime?: number; // seconds
  yellowTime?: number; // seconds
  redTime?: number; // seconds
  maxTime?: number; // seconds
}

export interface TableTopicsSpeakerSlot {
  id: string;
  memberId: string;
  topic?: string;
  type?: 'impromptu' | 'word-based' | 'scenario' | 'story';
}

export interface EvaluatorSlot {
  id: string;
  memberId?: string; // Member who evaluates
  evaluatorId?: string; // Alternative field name
  speakerId?: string; // Links to SpeakerSlot id
  speakerSlotId?: string; // Alternative field name
}

// Grammarian Tool Types
export interface GrammarianSession {
  id: string;
  meetingId: string;
  wordOfTheDay: string;
  entries: GrammarianEntry[];
  createdAt: string;
}

export interface GrammarianEntry {
  id: string;
  memberId: string;
  memberName: string;
  type: 'grammar-error' | 'good-usage' | 'word-of-day-usage' | 'notable-phrase';
  content: string;
  context?: string;
  timestamp: string;
}

// Ah Counter Tool Types
export interface AhCounterSession {
  id: string;
  meetingId: string;
  entries: AhCounterEntry[];
  createdAt: string;
}

export interface AhCounterEntry {
  id: string;
  memberId: string;
  memberName: string;
  fillerWords: FillerWordCount[];
  totalCount: number;
}

export interface FillerWordCount {
  word: string;
  count: number;
}

// Timer Tool Types
export interface TimerSession {
  id: string;
  meetingId: string;
  entries: TimerEntry[];
  createdAt: string;
}

export interface TimerEntry {
  id: string;
  memberId: string;
  memberName: string;
  role: 'speaker' | 'evaluator' | 'table-topics' | 'other';
  speechType: string;
  greenTime: number; // seconds
  yellowTime: number; // seconds
  redTime: number; // seconds
  maxTime: number; // seconds
  actualTime?: number; // seconds
  status: 'pending' | 'timing' | 'completed';
}

// Evaluation Tool Types (Toastmasters Method)
export interface EvaluationSession {
  id: string;
  meetingId: string;
  evaluations: Evaluation[];
  createdAt: string;
}

export interface Evaluation {
  id: string;
  evaluatorId: string;
  evaluatorName: string;
  speakerId: string;
  speakerName: string;
  speechTitle: string;
  // Commend - Recommend - Commend structure
  strengths: EvaluationPoint[];
  improvements: EvaluationPoint[];
  overallComments: string;
  // Ratings (1-5)
  ratings: {
    clarity: number;
    vocalVariety: number;
    eyeContact: number;
    gestures: number;
    bodyLanguage: number;
    enthusiasm: number;
    structure: number;
    content: number;
    audienceConnection: number;
    timeManagement: number;
  };
  createdAt: string;
}

export interface EvaluationPoint {
  id: string;
  category: string;
  description: string;
  example?: string;
}

// Timer Presets
export const TIMER_PRESETS = {
  'ice-breaker': { green: 240, yellow: 300, red: 360, max: 390, label: 'Ice Breaker (4-6 min)' },
  'standard-speech': { green: 300, yellow: 360, red: 420, max: 450, label: 'Standard Speech (5-7 min)' },
  'advanced-speech': { green: 420, yellow: 480, red: 540, max: 570, label: 'Advanced Speech (7-9 min)' },
  'evaluation': { green: 120, yellow: 150, red: 180, max: 210, label: 'Evaluation (2-3 min)' },
  'table-topics': { green: 60, yellow: 90, red: 120, max: 150, label: 'Table Topics (1-2 min)' },
  'general-evaluator': { green: 180, yellow: 240, red: 300, max: 330, label: 'General Evaluator (3-5 min)' },
} as const;

export type TimerPresetKey = keyof typeof TIMER_PRESETS;

// Default Filler Words
export const DEFAULT_FILLER_WORDS = [
  'um', 'uh', 'ah', 'er', 'like', 'so', 'you know', 
  'basically', 'actually', 'literally', 'right', 'okay'
];

// Member Performance Stats (computed from sessions)
export interface MemberPerformanceStats {
  memberId: string;
  memberName: string;
  clubId: string;
  totalSpeeches: number;
  totalTableTopics: number;
  totalEvaluations: number;
  averageFillerWords: number;
  fillerWordTrend: number[]; // Last 10 meetings
  averageSpeechTime: number;
  timingAccuracy: number; // Percentage of speeches within time
  grammarErrorsPerSpeech: number;
  wordOfDayUsageCount: number;
  goodPhrasesCount: number;
  meetingsAttended: number;
  // Evaluation stats (received from evaluators)
  evaluationsReceived: number;
  averageRating: number; // 1-5 scale average across all rating categories
  ratingBreakdown: {
    clarity: number;
    vocalVariety: number;
    eyeContact: number;
    gestures: number;
    bodyLanguage: number;
    enthusiasm: number;
    structure: number;
    content: number;
    audienceConnection: number;
    timeManagement: number;
  };
  topStrengths: string[]; // Most frequently mentioned strengths
  areasForImprovement: string[]; // Most frequently mentioned areas
}

// Speech Recording Types
export interface SpeechRecording {
  id: string;
  meetingId: string;
  memberId: string;
  memberName: string;
  speechTitle?: string;
  speechType: 'prepared-speech' | 'table-topics' | 'evaluation' | 'other';
  recordingType: 'video' | 'audio';
  duration: number; // seconds
  blobUrl?: string; // For local playback
  base64Data?: string; // For storage (smaller recordings)
  transcription?: string;
  aiFeedback?: AIFeedback;
  createdAt: string;
}

export interface AIFeedback {
  overallScore: number; // 1-10
  summary: string;
  strengths: string[];
  improvements: string[];
  detailedAnalysis: {
    clarity: { score: number; feedback: string };
    structure: { score: number; feedback: string };
    delivery: { score: number; feedback: string };
    content: { score: number; feedback: string };
    engagement: { score: number; feedback: string };
  };
  suggestedExercises: string[];
  createdAt: string;
}

// Database Structure
export interface Database {
  clubs: Club[];
  members: Member[];
  meetings: Meeting[];
  grammarianSessions: GrammarianSession[];
  ahCounterSessions: AhCounterSession[];
  timerSessions: TimerSession[];
  evaluationSessions: EvaluationSession[];
  speechRecordings: SpeechRecording[];
}
