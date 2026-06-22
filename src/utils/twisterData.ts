import type { TwisterItem, TwisterDifficulty } from '@/types';

export const TWISTER_LIST: TwisterItem[] = [
  {
    id: 'easy_1',
    title: '坡上立着一只鹅',
    text: '坡上立着一只鹅，坡下就是一条河。宽宽的河，肥肥的鹅，鹅要过河，河要渡鹅。',
    pinyin: 'pō shàng lì zhe yī zhī é，pō xià jiù shì yī tiáo hé。kuān kuān de hé，féi féi de é，é yào guò hé，hé yào dù é。',
    highlightPinyins: ['pō', 'é', 'hé', 'kuān', 'féi', 'guò', 'dù'],
    difficulty: 'easy',
  },
  {
    id: 'easy_2',
    title: '八百标兵',
    text: '八百标兵奔北坡，炮兵并排北边跑。炮兵怕把标兵碰，标兵怕碰炮兵炮。',
    pinyin: 'bā bǎi biāo bīng bēn běi pō，pào bīng bìng pái běi biān pǎo。pào bīng pà bǎ biāo bīng pèng，biāo bīng pà pèng pào bīng pào。',
    highlightPinyins: ['bā', 'bǎi', 'biāo', 'bīng', 'bēn', 'běi', 'pō', 'pào', 'bìng', 'pái', 'pǎo', 'pà', 'pèng'],
    difficulty: 'easy',
  },
  {
    id: 'easy_3',
    title: '大兔和小兔',
    text: '大兔肚子大，小兔肚子小。大兔比小兔肚子大，小兔比大兔肚子小。',
    pinyin: 'dà tù dù zi dà，xiǎo tù dù zi xiǎo。dà tù bǐ xiǎo tù dù zi dà，xiǎo tù bǐ dà tù dù zi xiǎo。',
    highlightPinyins: ['dà', 'tù', 'dù', 'xiǎo', 'bǐ'],
    difficulty: 'easy',
  },
  {
    id: 'medium_1',
    title: '四是四，十是十',
    text: '四是四，十是十，十四是十四，四十是四十。莫把四字说成十，休将十字说成四。若要分清四十和十四，经常练说十和四。',
    pinyin: 'sì shì sì，shí shì shí，shí sì shì shí sì，sì shí shì sì shí。mò bǎ sì zì shuō chéng shí，xiū jiāng shí zì shuō chéng sì。ruò yào fēn qīng sì shí hé shí sì，jīng cháng liàn shuō shí hé sì。',
    highlightPinyins: ['sì', 'shí', 'shì', 'shí sì', 'sì shí', 'fēn', 'qīng', 'liàn'],
    difficulty: 'medium',
  },
  {
    id: 'medium_2',
    title: '施氏食狮史',
    text: '石室诗士施氏，嗜狮，誓食十狮。氏时时适市视狮。十时，适十狮适市。',
    pinyin: 'shí shì shī shì shī shì，shì shī，shì shí shí shī。shì shí shí shì shì shì shī。shí shí，shì shí shī shì shì。',
    highlightPinyins: ['shí', 'shì', 'shī', 'shì', 'shí'],
    difficulty: 'medium',
  },
  {
    id: 'medium_3',
    title: '牛郎恋刘娘',
    text: '牛郎恋刘娘，刘娘念牛郎。牛郎年年恋刘娘，刘娘年年念牛郎。郎恋娘来娘念郎，念娘恋郎念恋娘。',
    pinyin: 'niú láng liàn liú niáng，liú niáng niàn niú láng。niú láng nián nián liàn liú niáng，liú niáng nián nián niàn niú láng。láng liàn niáng lái niáng niàn láng，niàn niáng liàn láng niàn liàn niáng。',
    highlightPinyins: ['niú', 'láng', 'liàn', 'liú', 'niáng', 'niàn', 'nián'],
    difficulty: 'medium',
  },
  {
    id: 'hard_1',
    title: '黑化肥',
    text: '黑化肥发灰会挥发，灰化肥挥发会发黑。黑化肥挥发发灰会花飞，灰化肥挥发发黑会飞花。',
    pinyin: 'hēi huà féi fā huī huì huī fā，huī huà féi huī fā huì fā hēi。hēi huà féi huī fā fā huī huì huā fēi，huī huà féi huī fā fā hēi huì fēi huā。',
    highlightPinyins: ['hēi', 'huà', 'féi', 'fā', 'huī', 'huì', 'huī fā', 'huā', 'fēi'],
    difficulty: 'hard',
  },
  {
    id: 'hard_2',
    title: '红凤凰黄凤凰',
    text: '红凤凰，黄凤凰，粉红凤凰花凤凰。红凤凰飞，黄凤凰飞，粉红凤凰花凤凰飞。',
    pinyin: 'hóng fèng huáng，huáng fèng huáng，fěn hóng fèng huáng huā fèng huáng。hóng fèng huáng fēi，huáng fèng huáng fēi，fěn hóng fèng huáng huā fèng huáng fēi。',
    highlightPinyins: ['hóng', 'fèng', 'huáng', 'huáng', 'fěn', 'huā', 'fēi'],
    difficulty: 'hard',
  },
  {
    id: 'hard_3',
    title: '司小四史小世',
    text: '司小四和史小世，四月十四日十四时四十上集市，司小四买了四十四斤四两西红柿，史小世买了十四斤四两细蚕丝。',
    pinyin: 'sī xiǎo sì hé shǐ xiǎo shì，sì yuè shí sì rì shí sì shí sì shí shàng jí shì，sī xiǎo sì mǎi le sì shí sì jīn sì liǎng xī hóng shì，shǐ xiǎo shì mǎi le shí sì jīn sì liǎng xì cán sī。',
    highlightPinyins: ['sī', 'xiǎo', 'sì', 'shǐ', 'shì', 'shí', 'rì', 'jí', 'shì', 'mǎi', 'jīn', 'liǎng', 'xī', 'hóng', 'xì', 'cán'],
    difficulty: 'hard',
  },
];

export function getTwistersByDifficulty(difficulty: TwisterDifficulty): TwisterItem[] {
  return TWISTER_LIST.filter(t => t.difficulty === difficulty);
}

export function getTwisterById(id: string): TwisterItem | undefined {
  return TWISTER_LIST.find(t => t.id === id);
}

export const DIFFICULTY_CONFIG: Record<TwisterDifficulty, { label: string; color: string; icon: string; starsRequired: number }> = {
  easy: { label: '初级', color: 'from-green-400 to-emerald-500', icon: '🌱', starsRequired: 1 },
  medium: { label: '中级', color: 'from-blue-400 to-cyan-500', icon: '🌿', starsRequired: 2 },
  hard: { label: '高级', color: 'from-red-400 to-rose-500', icon: '🌳', starsRequired: 3 },
};

export function evaluateTwisterPerformance(
  recognizedText: string,
  targetText: string,
  highlightPinyins: string[]
): { stars: number; matchRate: number; highlightMatches: number } {
  const cleanTarget = targetText.replace(/[，。！？、；：""''（）\s]/g, '');
  const cleanRecognized = recognizedText.replace(/[，。！？、；：""''（）\s]/g, '');

  if (cleanRecognized.length === 0) {
    return { stars: 0, matchRate: 0, highlightMatches: 0 };
  }

  let matches = 0;
  const minLen = Math.min(cleanTarget.length, cleanRecognized.length);
  const maxLen = Math.max(cleanTarget.length, cleanRecognized.length);

  for (let i = 0; i < minLen; i++) {
    if (cleanTarget[i] === cleanRecognized[i]) {
      matches++;
    }
  }

  const baseMatchRate = matches / maxLen;

  let longerMatchRate = 0;
  for (let offset = 0; offset <= Math.abs(cleanTarget.length - cleanRecognized.length); offset++) {
    let offsetMatches = 0;
    const shorter = cleanTarget.length < cleanRecognized.length ? cleanTarget : cleanRecognized;
    const longer = cleanTarget.length < cleanRecognized.length ? cleanRecognized : cleanTarget;
    for (let i = 0; i < shorter.length; i++) {
      if (longer[i + offset] === shorter[i]) {
        offsetMatches++;
      }
    }
    longerMatchRate = Math.max(longerMatchRate, offsetMatches / longer.length);
  }

  const matchRate = Math.max(baseMatchRate, longerMatchRate);

  const highlightSet = new Set(highlightPinyins);
  const targetChars = [...cleanTarget];
  let highlightMatches = 0;
  let highlightTotal = highlightSet.size || 1;

  for (const char of targetChars) {
    if (highlightSet.has(char) && cleanRecognized.includes(char)) {
      highlightMatches++;
    }
  }

  if (highlightMatches > highlightTotal) {
    highlightMatches = highlightTotal;
  }

  let stars = 0;
  if (matchRate >= 0.9) {
    stars = 3;
  } else if (matchRate >= 0.7) {
    stars = 2;
  } else if (matchRate >= 0.5) {
    stars = 1;
  }

  if (stars < 3 && highlightMatches >= highlightTotal * 0.9 && matchRate >= 0.6) {
    stars = Math.min(stars + 1, 3);
  }

  return { stars, matchRate, highlightMatches };
}
