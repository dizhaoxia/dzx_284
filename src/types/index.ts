export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: string;
}

export type ModuleType = 'chart' | 'spelling' | 'listening' | 'drag' | 'tonguetwister' | 'writing';

export interface LearningProgress {
  id: string;
  userId: string;
  module: ModuleType;
  correctCount: number;
  totalCount: number;
  lastPractice: string;
}

export type PinyinType = 'shengmu' | 'yunmu';

export interface PinyinItem {
  pinyin: string;
  type: PinyinType;
  example: string;
  mouthShape: string;
}

export type ToneNumber = 0 | 1 | 2 | 3 | 4;

export interface ToneInfo {
  number: ToneNumber;
  mark: string;
  name: string;
  color: string;
}

export interface PinyinCombination {
  shengmu: string;
  yunmu: string;
  tone: ToneNumber;
}

export interface QuizOption {
  id: string;
  pinyin: string;
  displayPinyin: string;
  isCorrect: boolean;
}

export interface DragTarget {
  target: 'shengmu' | 'yunmu';
  value: string;
}

export type TwisterDifficulty = 'easy' | 'medium' | 'hard';

export interface TwisterItem {
  id: string;
  text: string;
  pinyin: string;
  highlightPinyins: string[];
  difficulty: TwisterDifficulty;
  title: string;
}

export interface TwisterProgress {
  id: string;
  completed: boolean;
  stars: number;
  bestTime?: number;
}

export interface UserTwisterData {
  userId: string;
  unlockedLevel: TwisterDifficulty;
  progress: Record<string, TwisterProgress>;
}

export type StrokePoint = { x: number; y: number };

export interface Stroke {
  points: StrokePoint[];
  direction: string;
}

export interface WritingStrokeData {
  pinyin: string;
  strokes: Stroke[];
  boundingBox: { width: number; height: number };
}

export interface UserWritingData {
  userId: string;
  masteredPinyins: string[];
  writingRecords: Record<string, { correct: number; total: number; lastPractice: string }>;
}

export interface PinyinMastery {
  pinyin: string;
  type: PinyinType;
  status: 'mastered' | 'learning' | 'not_started';
  correctRate: number;
}

export interface DailyStat {
  date: string;
  practiceCount: number;
  correctCount: number;
  streakCorrect: number;
  maxStreak: number;
}

export interface WeakPoint {
  pinyin: string;
  type: PinyinType;
  errorCount: number;
  totalCount: number;
  modules: ModuleType[];
}

export interface UserReportData {
  userId: string;
  masteryMap: Record<string, { type: PinyinType; correct: number; total: number }>;
  errorRecords: Record<string, { type: PinyinType; count: number; modules: ModuleType[] }>;
  dailyStats: Record<string, DailyStat>;
  currentStreak: number;
  maxStreak: number;
  lastPracticeDate: string;
}
