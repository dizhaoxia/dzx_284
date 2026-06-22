import type { UserProfile, LearningProgress, ModuleType, TwisterDifficulty, TwisterProgress, UserTwisterData, UserWritingData, UserReportData, PinyinType, DailyStat } from '@/types';

const USER_KEY = 'pinyin_learning_users';
const PROGRESS_KEY = 'pinyin_learning_progress';
const CURRENT_USER_KEY = 'pinyin_current_user';
const TWISTER_KEY = 'pinyin_twister_data';
const WRITING_KEY = 'pinyin_writing_data';
const REPORT_KEY = 'pinyin_report_data';

function safeParse<T>(value: string | null, defaultValue: T): T {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

export function getUsers(): UserProfile[] {
  return safeParse<UserProfile[]>(localStorage.getItem(USER_KEY), []);
}

export function saveUsers(users: UserProfile[]): void {
  localStorage.setItem(USER_KEY, JSON.stringify(users));
}

export function addUser(user: UserProfile): void {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

export function deleteUser(userId: string): void {
  const users = getUsers().filter(u => u.id !== userId);
  saveUsers(users);
  const progresses = getProgress().filter(p => p.userId !== userId);
  saveProgress(progresses);
  const twisters = getAllTwisterData().filter(t => t.userId !== userId);
  saveAllTwisterData(twisters);
  const writings = getAllWritingData().filter(w => w.userId !== userId);
  saveAllWritingData(writings);
  const reports = getAllReportData().filter(r => r.userId !== userId);
  saveAllReportData(reports);
  if (getCurrentUserId() === userId) {
    clearCurrentUser();
  }
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setCurrentUserId(userId: string): void {
  localStorage.setItem(CURRENT_USER_KEY, userId);
}

export function clearCurrentUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getProgress(): LearningProgress[] {
  return safeParse<LearningProgress[]>(localStorage.getItem(PROGRESS_KEY), []);
}

export function saveProgress(progresses: LearningProgress[]): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progresses));
}

export function getUserProgress(userId: string): LearningProgress[] {
  return getProgress().filter(p => p.userId === userId);
}

export function updateModuleProgress(userId: string, module: ModuleType, isCorrect: boolean): void {
  const progresses = getProgress();
  let progress = progresses.find(p => p.userId === userId && p.module === module);
  
  if (!progress) {
    progress = {
      id: `${userId}_${module}`,
      userId,
      module,
      correctCount: 0,
      totalCount: 0,
      lastPractice: new Date().toISOString(),
    };
    progresses.push(progress);
  }
  
  progress.totalCount += 1;
  if (isCorrect) {
    progress.correctCount += 1;
  }
  progress.lastPractice = new Date().toISOString();
  
  saveProgress(progresses);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getAllTwisterData(): UserTwisterData[] {
  return safeParse<UserTwisterData[]>(localStorage.getItem(TWISTER_KEY), []);
}

function saveAllTwisterData(data: UserTwisterData[]): void {
  localStorage.setItem(TWISTER_KEY, JSON.stringify(data));
}

export function getUserTwisterData(userId: string): UserTwisterData {
  const all = getAllTwisterData();
  return all.find(d => d.userId === userId) || {
    userId,
    unlockedLevel: 'easy' as TwisterDifficulty,
    progress: {},
  };
}

export function saveUserTwisterData(data: UserTwisterData): void {
  const all = getAllTwisterData();
  const idx = all.findIndex(d => d.userId === data.userId);
  if (idx >= 0) {
    all[idx] = data;
  } else {
    all.push(data);
  }
  saveAllTwisterData(all);
}

export function updateTwisterProgress(userId: string, twisterId: string, stars: number): void {
  const data = getUserTwisterData(userId);
  const existing = data.progress[twisterId];
  if (!existing || existing.stars < stars) {
    data.progress[twisterId] = {
      id: twisterId,
      completed: stars >= 1,
      stars: Math.max(existing?.stars || 0, stars),
    };
  }
  saveUserTwisterData(data);
}

export function checkAndUnlockLevel(userId: string, currentLevel: TwisterDifficulty, allTwistersInLevel: { id: string }[]): TwisterDifficulty {
  const data = getUserTwisterData(userId);
  const levelOrder: TwisterDifficulty[] = ['easy', 'medium', 'hard'];
  const currentIdx = levelOrder.indexOf(currentLevel);
  
  const allCompleted = allTwistersInLevel.every(t => {
    const p = data.progress[t.id];
    return p && p.completed && p.stars >= 2;
  });
  
  if (allCompleted && currentIdx < levelOrder.length - 1) {
    const nextLevel = levelOrder[currentIdx + 1];
    if (data.unlockedLevel !== nextLevel) {
      data.unlockedLevel = nextLevel;
      saveUserTwisterData(data);
    }
    return nextLevel;
  }
  return data.unlockedLevel;
}

function getAllWritingData(): UserWritingData[] {
  return safeParse<UserWritingData[]>(localStorage.getItem(WRITING_KEY), []);
}

function saveAllWritingData(data: UserWritingData[]): void {
  localStorage.setItem(WRITING_KEY, JSON.stringify(data));
}

export function getUserWritingData(userId: string): UserWritingData {
  const all = getAllWritingData();
  return all.find(d => d.userId === userId) || {
    userId,
    masteredPinyins: [],
    writingRecords: {},
  };
}

export function saveUserWritingData(data: UserWritingData): void {
  const all = getAllWritingData();
  const idx = all.findIndex(d => d.userId === data.userId);
  if (idx >= 0) {
    all[idx] = data;
  } else {
    all.push(data);
  }
  saveAllWritingData(all);
}

export function updateWritingRecord(userId: string, pinyin: string, isCorrect: boolean): void {
  const data = getUserWritingData(userId);
  const now = new Date().toISOString();
  const existing = data.writingRecords[pinyin] || { correct: 0, total: 0, lastPractice: now };
  
  existing.total += 1;
  if (isCorrect) {
    existing.correct += 1;
  }
  existing.lastPractice = now;
  data.writingRecords[pinyin] = existing;
  
  const correctRate = existing.correct / existing.total;
  if (existing.total >= 3 && correctRate >= 0.8 && !data.masteredPinyins.includes(pinyin)) {
    data.masteredPinyins.push(pinyin);
  }
  
  saveUserWritingData(data);
}

function getAllReportData(): UserReportData[] {
  return safeParse<UserReportData[]>(localStorage.getItem(REPORT_KEY), []);
}

function saveAllReportData(data: UserReportData[]): void {
  localStorage.setItem(REPORT_KEY, JSON.stringify(data));
}

export function getUserReportData(userId: string): UserReportData {
  const all = getAllReportData();
  return all.find(d => d.userId === userId) || {
    userId,
    masteryMap: {},
    errorRecords: {},
    dailyStats: {},
    currentStreak: 0,
    maxStreak: 0,
    lastPracticeDate: '',
  };
}

export function saveUserReportData(data: UserReportData): void {
  const all = getAllReportData();
  const idx = all.findIndex(d => d.userId === data.userId);
  if (idx >= 0) {
    all[idx] = data;
  } else {
    all.push(data);
  }
  saveAllReportData(all);
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function recordReportPractice(userId: string, pinyin: string, type: PinyinType, module: ModuleType, isCorrect: boolean): void {
  const data = getUserReportData(userId);
  const today = getTodayStr();
  
  const masteryKey = pinyin;
  if (!data.masteryMap[masteryKey]) {
    data.masteryMap[masteryKey] = { type, correct: 0, total: 0 };
  }
  data.masteryMap[masteryKey].total += 1;
  if (isCorrect) {
    data.masteryMap[masteryKey].correct += 1;
  }
  
  if (!isCorrect) {
    if (!data.errorRecords[pinyin]) {
      data.errorRecords[pinyin] = { type, count: 0, modules: [] };
    }
    data.errorRecords[pinyin].count += 1;
    if (!data.errorRecords[pinyin].modules.includes(module)) {
      data.errorRecords[pinyin].modules.push(module);
    }
  }
  
  if (!data.dailyStats[today]) {
    data.dailyStats[today] = {
      date: today,
      practiceCount: 0,
      correctCount: 0,
      streakCorrect: 0,
      maxStreak: 0,
    };
  }
  const stat = data.dailyStats[today];
  stat.practiceCount += 1;
  if (isCorrect) {
    stat.correctCount += 1;
    stat.streakCorrect += 1;
    stat.maxStreak = Math.max(stat.maxStreak, stat.streakCorrect);
  } else {
    stat.streakCorrect = 0;
  }
  
  if (data.lastPracticeDate !== today) {
    if (data.lastPracticeDate) {
      const lastDate = new Date(data.lastPracticeDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        data.currentStreak = 0;
      }
    }
    data.currentStreak += 1;
    data.maxStreak = Math.max(data.maxStreak, data.currentStreak);
  }
  data.lastPracticeDate = today;
  
  saveUserReportData(data);
}

export function getTodayStats(userId: string): DailyStat | null {
  const data = getUserReportData(userId);
  const today = getTodayStr();
  return data.dailyStats[today] || null;
}
