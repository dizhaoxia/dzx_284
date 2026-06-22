import { useState, useEffect } from 'react';
import { Volume2, RotateCcw } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Celebration from '@/components/Celebration';
import {
  SHENGMU_LIST,
  YUNMU_LIST,
  TONE_LIST,
  combinePinyin,
  shuffle,
  getRandomItem,
} from '@/utils/pinyinData';
import { speakPinyin } from '@/utils/speech';
import { useUserStore } from '@/store/userStore';
import type { ToneNumber, QuizOption } from '@/types';

function generateQuiz(): { correctPinyin: string; displayPinyin: string; options: QuizOption[] } {
  const shengmu = getRandomItem(SHENGMU_LIST).pinyin;
  const yunmu = getRandomItem(YUNMU_LIST).pinyin;
  const tone = getRandomItem(TONE_LIST).number as ToneNumber;
  
  const correctDisplay = combinePinyin(shengmu, yunmu, tone);
  const correctRaw = `${shengmu}${yunmu}${tone}`;

  const wrongOptions: QuizOption[] = [];
  const usedDisplays = new Set([correctDisplay]);

  while (wrongOptions.length < 3) {
    const useWrongShengmu = Math.random() > 0.5;
    const useWrongTone = Math.random() > 0.3;

    let ws = shengmu;
    let wy = yunmu;
    let wt = tone;

    if (useWrongShengmu) {
      ws = getRandomItem(SHENGMU_LIST.filter(s => s.pinyin !== shengmu)).pinyin;
    } else {
      wy = getRandomItem(YUNMU_LIST.filter(y => y.pinyin !== yunmu)).pinyin;
    }

    if (useWrongTone) {
      wt = getRandomItem(TONE_LIST.filter(t => t.number !== tone)).number as ToneNumber;
    }

    const wrongDisplay = combinePinyin(ws, wy, wt);
    const wrongRaw = `${ws}${wy}${wt}`;

    if (!usedDisplays.has(wrongDisplay)) {
      usedDisplays.add(wrongDisplay);
      wrongOptions.push({
        id: wrongRaw,
        pinyin: wrongRaw,
        displayPinyin: wrongDisplay,
        isCorrect: false,
      });
    }
  }

  const correctOption: QuizOption = {
    id: correctRaw,
    pinyin: correctRaw,
    displayPinyin: correctDisplay,
    isCorrect: true,
  };

  const allOptions = shuffle([correctOption, ...wrongOptions]);

  return {
    correctPinyin: correctRaw,
    displayPinyin: correctDisplay,
    options: allOptions,
  };
}

export default function ListeningQuiz() {
  const { currentUserId, recordProgress } = useUserStore();
  const [quiz, setQuiz] = useState(() => generateQuiz());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shakeId, setShakeId] = useState<string | null>(null);

  const handlePlay = async () => {
    setIsSpeaking(true);
    try {
      await speakPinyin(quiz.displayPinyin, 0.6);
    } finally {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handlePlay();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz]);

  const handleSelect = (option: QuizOption) => {
    if (showResult) return;

    setSelectedId(option.id);
    setShowResult(true);

    const correct = option.isCorrect;
    setIsCorrect(correct);

    if (currentUserId) {
      recordProgress('listening', correct);
    }

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 3) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
      setTimeout(() => {
        handleNext();
      }, 1500);
    } else {
      setStreak(0);
      setShakeId(option.id);
      setTimeout(() => setShakeId(null), 500);
    }
  };

  const handleNext = () => {
    setQuiz(generateQuiz());
    setSelectedId(null);
    setShowResult(false);
    setIsCorrect(false);
  };

  const handleReset = () => {
    setStreak(0);
    handleNext();
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      <Celebration trigger={showCelebration} />
      
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">🎧 听音选字</h1>
          <p className="text-gray-600">听发音，选出正确的拼音</p>
        </div>

        <div className="flex justify-center items-center gap-4 mb-6">
          {streak > 0 && (
            <div className="card-cute !py-2 !px-4 flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50">
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-orange-600">连续答对 {streak} 题</span>
              {streak >= 3 && <span className="text-2xl animate-bounce">⭐</span>}
              {streak >= 5 && <span className="text-2xl animate-bounce">🎉</span>}
            </div>
          )}
          <button
            onClick={handleReset}
            className="p-2 rounded-full bg-white shadow hover:shadow-md hover:scale-105 transition-all text-gray-500"
            title="重置"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        <div className="card-cute mb-8">
          <div className="flex flex-col items-center py-8">
            <button
              onClick={handlePlay}
              disabled={isSpeaking}
              className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-xl flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-70 ${
                isSpeaking ? 'animate-pulse-slow ring-4 ring-yellow-300' : ''
              }`}
            >
              <Volume2 size={48} className={isSpeaking ? 'animate-bounce' : ''} />
              <span className="font-bold text-lg mt-2">点我听</span>
            </button>
            <p className="mt-4 text-gray-500">点击按钮听发音</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {quiz.options.map((option) => {
            const isSelected = selectedId === option.id;
            const showCorrect = showResult && option.isCorrect;
            const showWrong = isSelected && !option.isCorrect;
            const isShaking = shakeId === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                disabled={showResult}
                className={`p-6 sm:p-8 rounded-3xl text-4xl sm:text-5xl font-bold transition-all shadow-lg ${
                  showCorrect
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white ring-4 ring-yellow-400 animate-pop scale-105'
                    : showWrong
                    ? `bg-gradient-to-br from-red-400 to-rose-500 text-white ${isShaking ? 'animate-shake' : ''}`
                    : isSelected
                    ? 'bg-gradient-to-br from-purple-400 to-violet-500 text-white scale-105 ring-2 ring-yellow-400'
                    : 'bg-white text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 hover:scale-105'
                }`}
              >
                {option.displayPinyin}
                {showCorrect && <span className="block text-2xl mt-2">✅ 正确！</span>}
                {showWrong && <span className="block text-2xl mt-2">❌ 再试试</span>}
              </button>
            );
          })}
        </div>

        {showResult && !isCorrect && (
          <div className="text-center mt-6">
            <p className="text-lg text-gray-600 mb-4">
              正确答案是：<span className="font-bold text-green-500 text-2xl">{quiz.displayPinyin}</span>
            </p>
            <button
              onClick={handleNext}
              className="btn-cute bg-gradient-to-r from-primary to-orange-400 text-lg"
            >
              下一题 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
