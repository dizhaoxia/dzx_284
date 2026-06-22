import type { PinyinItem, ToneInfo, ToneNumber } from '@/types';

export const SHENGMU_LIST: PinyinItem[] = [
  { pinyin: 'b', type: 'shengmu', example: '爸爸', mouthShape: '👄 双唇紧闭' },
  { pinyin: 'p', type: 'shengmu', example: '爬山', mouthShape: '👄 双唇紧闭送气' },
  { pinyin: 'm', type: 'shengmu', example: '妈妈', mouthShape: '👄 双唇紧闭鼻音' },
  { pinyin: 'f', type: 'shengmu', example: '花朵', mouthShape: '👄 上齿轻触下唇' },
  { pinyin: 'd', type: 'shengmu', example: '大家', mouthShape: '👅 舌尖抵住上颚' },
  { pinyin: 't', type: 'shengmu', example: '天空', mouthShape: '👅 舌尖抵住上颚送气' },
  { pinyin: 'n', type: 'shengmu', example: '牛奶', mouthShape: '👅 鼻音，舌尖抵住上颚' },
  { pinyin: 'l', type: 'shengmu', example: '老师', mouthShape: '👅 舌尖抵住上颚边音' },
  { pinyin: 'g', type: 'shengmu', example: '哥哥', mouthShape: '👅 舌根抵住软腭' },
  { pinyin: 'k', type: 'shengmu', example: '看书', mouthShape: '👅 舌根抵住软腭送气' },
  { pinyin: 'h', type: 'shengmu', example: '河马', mouthShape: '👅 舌根靠近软腭' },
  { pinyin: 'j', type: 'shengmu', example: '鸡', mouthShape: '👅 舌面抵住硬腭' },
  { pinyin: 'q', type: 'shengmu', example: '气球', mouthShape: '👅 舌面抵住硬腭送气' },
  { pinyin: 'x', type: 'shengmu', example: '西瓜', mouthShape: '👅 舌面靠近硬腭' },
  { pinyin: 'zh', type: 'shengmu', example: '知道', mouthShape: '👅 舌尖上翘' },
  { pinyin: 'ch', type: 'shengmu', example: '吃饭', mouthShape: '👅 舌尖上翘送气' },
  { pinyin: 'sh', type: 'shengmu', example: '狮子', mouthShape: '👅 舌尖上翘靠近' },
  { pinyin: 'r', type: 'shengmu', example: '生日', mouthShape: '👅 舌尖上翘浊音' },
  { pinyin: 'z', type: 'shengmu', example: '写字', mouthShape: '👅 舌尖抵住齿背' },
  { pinyin: 'c', type: 'shengmu', example: '刺', mouthShape: '👅 舌尖抵住齿背送气' },
  { pinyin: 's', type: 'shengmu', example: '丝', mouthShape: '👅 舌尖靠近齿背' },
  { pinyin: 'y', type: 'shengmu', example: '衣服', mouthShape: '👄 双唇微开' },
  { pinyin: 'w', type: 'shengmu', example: '乌鸦', mouthShape: '👄 双唇圆拢' },
];

export const YUNMU_LIST: PinyinItem[] = [
  { pinyin: 'a', type: 'yunmu', example: '啊', mouthShape: '👄 嘴巴张大' },
  { pinyin: 'o', type: 'yunmu', example: '哦', mouthShape: '👄 双唇圆拢' },
  { pinyin: 'e', type: 'yunmu', example: '鹅', mouthShape: '👄 嘴角向两边展开' },
  { pinyin: 'i', type: 'yunmu', example: '衣服', mouthShape: '👄 嘴角向两边展开' },
  { pinyin: 'u', type: 'yunmu', example: '乌鸦', mouthShape: '👄 双唇向前突出' },
  { pinyin: 'ü', type: 'yunmu', example: '鱼', mouthShape: '👄 双唇扁圆向前' },
  { pinyin: 'ai', type: 'yunmu', example: '爱', mouthShape: '👄 a 滑向 i' },
  { pinyin: 'ei', type: 'yunmu', example: '杯子', mouthShape: '👄 e 滑向 i' },
  { pinyin: 'ui', type: 'yunmu', example: '围巾', mouthShape: '👄 u 滑向 i' },
  { pinyin: 'ao', type: 'yunmu', example: '棉袄', mouthShape: '👄 a 滑向 o' },
  { pinyin: 'ou', type: 'yunmu', example: '欧洲', mouthShape: '👄 o 滑向 u' },
  { pinyin: 'iu', type: 'yunmu', example: '优秀', mouthShape: '👄 i 滑向 u' },
  { pinyin: 'ie', type: 'yunmu', example: '椰子', mouthShape: '👄 i 滑向 e' },
  { pinyin: 'üe', type: 'yunmu', example: '月亮', mouthShape: '👄 ü 滑向 e' },
  { pinyin: 'er', type: 'yunmu', example: '耳朵', mouthShape: '👅 舌尖卷起' },
  { pinyin: 'an', type: 'yunmu', example: '安全', mouthShape: '👅 a 加鼻音 n' },
  { pinyin: 'en', type: 'yunmu', example: '恩人', mouthShape: '👅 e 加鼻音 n' },
  { pinyin: 'in', type: 'yunmu', example: '音乐', mouthShape: '👅 i 加鼻音 n' },
  { pinyin: 'un', type: 'yunmu', example: '温暖', mouthShape: '👅 u 加鼻音 n' },
  { pinyin: 'ün', type: 'yunmu', example: '白云', mouthShape: '👅 ü 加鼻音 n' },
  { pinyin: 'ang', type: 'yunmu', example: '昂首', mouthShape: '👅 a 加后鼻音 ng' },
  { pinyin: 'eng', type: 'yunmu', example: '灯光', mouthShape: '👅 e 加后鼻音 ng' },
  { pinyin: 'ing', type: 'yunmu', example: '星星', mouthShape: '👅 i 加后鼻音 ng' },
  { pinyin: 'ong', type: 'yunmu', example: '中国', mouthShape: '👅 o 加后鼻音 ng' },
];

export const TONE_LIST: ToneInfo[] = [
  { number: 1, mark: 'ˉ', name: '一声', color: 'bg-blue-400' },
  { number: 2, mark: 'ˊ', name: '二声', color: 'bg-green-400' },
  { number: 3, mark: 'ˇ', name: '三声', color: 'bg-yellow-400' },
  { number: 4, mark: 'ˋ', name: '四声', color: 'bg-red-400' },
];

const TONE_MAP: Record<string, string[]> = {
  'a': ['ā', 'á', 'ǎ', 'à'],
  'o': ['ō', 'ó', 'ǒ', 'ò'],
  'e': ['ē', 'é', 'ě', 'è'],
  'i': ['ī', 'í', 'ǐ', 'ì'],
  'u': ['ū', 'ú', 'ǔ', 'ù'],
  'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
  'A': ['Ā', 'Á', 'Ǎ', 'À'],
  'O': ['Ō', 'Ó', 'Ǒ', 'Ò'],
  'E': ['Ē', 'É', 'Ě', 'È'],
  'I': ['Ī', 'Í', 'Ǐ', 'Ì'],
  'U': ['Ū', 'Ú', 'Ǔ', 'Ù'],
};

export function applyTone(yunmu: string, tone: ToneNumber): string {
  if (tone === 0) return yunmu;
  
  const vowels = ['a', 'o', 'e', 'i', 'u', 'ü'];
  const priorityOrder = ['a', 'o', 'e', 'i', 'u', 'ü'];
  
  let targetVowel = '';
  for (const v of priorityOrder) {
    if (yunmu.includes(v)) {
      targetVowel = v;
      break;
    }
  }
  
  if (!targetVowel) {
    for (const v of vowels) {
      if (yunmu.includes(v)) {
        targetVowel = v;
        break;
      }
    }
  }
  
  if (!targetVowel) return yunmu;
  
  const toneIndex = tone - 1;
  const tonedVowel = TONE_MAP[targetVowel]?.[toneIndex] || targetVowel;
  
  return yunmu.replace(targetVowel, tonedVowel);
}

export function combinePinyin(shengmu: string, yunmu: string, tone: ToneNumber): string {
  const tonedYunmu = applyTone(yunmu, tone);
  return shengmu + tonedYunmu;
}

export function getPinyinExample(pinyin: string): string {
  const all = [...SHENGMU_LIST, ...YUNMU_LIST];
  return all.find(item => item.pinyin === pinyin)?.example || '';
}

const AVATAR_OPTIONS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
  '🐧', '🐦', '🐤', '🦄', '🐝', '🦋', '🐢', '🐙',
];

export function getAvatarOptions(): string[] {
  return AVATAR_OPTIONS;
}

export function getRandomAvatar(): string {
  return AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
