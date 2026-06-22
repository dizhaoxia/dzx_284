import type { UserProfile, LearningProgress, ModuleType } from '@/types';

const USER_KEY = 'pinyin_learning_users';
const PROGRESS_KEY = 'pinyin_learning_progress';
const CURRENT_USER_KEY = 'pinyin_current_user';

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
