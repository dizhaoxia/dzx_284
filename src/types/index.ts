export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: string;
}

export type ModuleType = 'chart' | 'spelling' | 'listening' | 'drag';

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
