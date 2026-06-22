import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speakPinyin } from '@/utils/speech';
import type { PinyinItem } from '@/types';

interface PinyinCardProps {
  item: PinyinItem;
  onClick?: () => void;
  showExample?: boolean;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-16 h-16 text-2xl',
  md: 'w-20 h-20 sm:w-24 sm:h-24 text-3xl sm:text-4xl',
  lg: 'w-28 h-28 text-5xl',
};

const gradientMap: Record<string, string> = {
  shengmu: 'from-pink-400 to-rose-500',
  yunmu: 'from-blue-400 to-cyan-500',
};

export default function PinyinCard({ item, onClick, showExample = true, selected = false, size = 'md' }: PinyinCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMouth, setShowMouth] = useState(false);

  const handleClick = async () => {
    setIsPlaying(true);
    setShowMouth(true);
    try {
      await speakPinyin(item.pinyin);
    } finally {
      setIsPlaying(false);
      setTimeout(() => setShowMouth(false), 500);
    }
    onClick?.();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center font-bold cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 select-none text-white relative overflow-hidden ${
          selected ? 'ring-4 ring-yellow-400 scale-110' : ''
        } bg-gradient-to-br ${gradientMap[item.type]} ${isPlaying ? 'animate-pulse-slow' : ''}`}
      >
        <span className="relative z-10">{item.pinyin}</span>
        {isPlaying && (
          <Volume2
            size={size === 'sm' ? 16 : 24}
            className="absolute top-1 right-1 text-white/80 animate-bounce"
          />
        )}
      </button>
      {showExample && (
        <div className="text-center">
          <div className="text-sm font-bold text-gray-600">{item.example}</div>
          {showMouth && (
            <div className="text-xs text-primary mt-1 animate-pop">{item.mouthShape}</div>
          )}
        </div>
      )}
    </div>
  );
}
