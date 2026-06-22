import type { ToneNumber } from '@/types';
import { applyTone } from './pinyinData';

let chineseVoice: SpeechSynthesisVoice | null = null;

function initVoices(): Promise<void> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      findChineseVoice(voices);
      resolve();
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      const newVoices = window.speechSynthesis.getVoices();
      findChineseVoice(newVoices);
      resolve();
    };

    setTimeout(resolve, 1000);
  });
}

function findChineseVoice(voices: SpeechSynthesisVoice[]): void {
  chineseVoice = voices.find(voice => 
    voice.lang.startsWith('zh') || voice.lang.includes('CN') || voice.lang.includes('Chinese')
  ) || voices.find(voice => voice.default) || voices[0] || null;
}

export async function speakPinyin(pinyin: string, rate: number = 0.7): Promise<void> {
  if (!('speechSynthesis' in window)) {
    console.warn('Web Speech API is not supported');
    return;
  }

  if (!chineseVoice) {
    await initVoices();
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(pinyin);
  
  if (chineseVoice) {
    utterance.voice = chineseVoice;
  }
  
  utterance.lang = 'zh-CN';
  utterance.rate = rate;
  utterance.pitch = 1.1;
  utterance.volume = 1;

  return new Promise((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);
    window.speechSynthesis.speak(utterance);
  });
}

export function speakCombination(shengmu: string, yunmu: string, tone: ToneNumber): Promise<void> {
  const tonedYunmu = applyTone(yunmu, tone);
  const fullPinyin = shengmu + tonedYunmu;
  return speakPinyin(fullPinyin, 0.6);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
