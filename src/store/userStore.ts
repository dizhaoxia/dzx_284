import { create } from 'zustand';
import type { UserProfile, ModuleType, LearningProgress } from '@/types';
import {
  getUsers,
  addUser as storageAddUser,
  deleteUser as storageDeleteUser,
  getCurrentUserId,
  setCurrentUserId,
  clearCurrentUser,
  getUserProgress,
  updateModuleProgress,
  generateId,
} from '@/utils/storage';

interface UserState {
  users: UserProfile[];
  currentUserId: string | null;
  progress: LearningProgress[];
  loadUsers: () => void;
  setCurrentUser: (userId: string) => void;
  addUser: (name: string, avatar: string) => UserProfile;
  removeUser: (userId: string) => void;
  getCurrentUser: () => UserProfile | undefined;
  loadProgress: () => void;
  recordProgress: (module: ModuleType, isCorrect: boolean) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  currentUserId: null,
  progress: [],

  loadUsers: () => {
    const users = getUsers();
    const currentUserId = getCurrentUserId();
    set({ users, currentUserId });
    if (currentUserId) {
      const progress = getUserProgress(currentUserId);
      set({ progress });
    }
  },

  setCurrentUser: (userId: string) => {
    setCurrentUserId(userId);
    const progress = getUserProgress(userId);
    set({ currentUserId: userId, progress });
  },

  addUser: (name: string, avatar: string) => {
    const newUser: UserProfile = {
      id: generateId(),
      name,
      avatar,
      createdAt: new Date().toISOString(),
    };
    storageAddUser(newUser);
    const users = getUsers();
    set({ users });
    return newUser;
  },

  removeUser: (userId: string) => {
    storageDeleteUser(userId);
    const users = getUsers();
    const currentUserId = getCurrentUserId();
    const progress = currentUserId ? getUserProgress(currentUserId) : [];
    set({ users, currentUserId, progress });
  },

  getCurrentUser: () => {
    const { users, currentUserId } = get();
    return users.find(u => u.id === currentUserId);
  },

  loadProgress: () => {
    const { currentUserId } = get();
    if (currentUserId) {
      const progress = getUserProgress(currentUserId);
      set({ progress });
    }
  },

  recordProgress: (module: ModuleType, isCorrect: boolean) => {
    const { currentUserId } = get();
    if (!currentUserId) return;
    updateModuleProgress(currentUserId, module, isCorrect);
    const progress = getUserProgress(currentUserId);
    set({ progress });
  },
}));
