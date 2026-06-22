import { useState, useEffect, useRef } from 'react';
import { Volume2, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Celebration from '@/components/Celebration';
import {
  SHENGMU_LIST,
  YUNMU_LIST,
  TONE_LIST,
  combinePinyin,
  getRandomItem,
  shuffle,
  getPinyinExample,
} from '@/utils/pinyinData';
import { speakPinyin } from '@/utils/speech';
import { useUserStore } from '@/store/userStore';
import type { ToneNumber } from '@/types';

interface DragQuestion {
  shengmu: string;
  yunmu: string;
  tone: ToneNumber;
  displayPinyin: string;
  example: string;
}

function generateQuestion(): DragQuestion {
  const shengmu = getRandomItem(SHENGMU_LIST).pinyin;
  const yunmu = getRandomItem(YUNMU_LIST).pinyin;
  const tone = getRandomItem(TONE_LIST).number as ToneNumber;
  const displayPinyin = combinePinyin(shengmu, yunmu, tone);
  const example = getPinyinExample(yunmu) || getPinyinExample(shengmu) || '拼音';

  return { shengmu, yunmu, tone, displayPinyin, example };
}

export default function DragSpelling() {
  const { currentUserId, recordProgress } = useUserStore();
  const [question, setQuestion] = useState<DragQuestion>(() => generateQuestion());
  const [droppedShengmu, setDroppedShengmu] = useState<string>('');
  const [droppedYunmu, setDroppedYunmu] = useState<string>('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shengmuOptions, setShengmuOptions] = useState<string[]>([]);
  const [yunmuOptions, setYunmuOptions] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState<'shengmu' | 'yunmu' | null>(null);
  const [draggingItem, setDraggingItem] = useState<{ value: string; type: 'shengmu' | 'yunmu' } | null>(null);
  const touchDragRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    resetQuestion();
  }, []);

  const resetQuestion = () => {
    const q = generateQuestion();
    setQuestion(q);
    setDroppedShengmu('');
    setDroppedYunmu('');
    setFeedback(null);

    const wrongShengmuses = SHENGMU_LIST
      .filter(s => s.pinyin !== q.shengmu)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .map(s => s.pinyin);
    setShengmuOptions(shuffle([q.shengmu, ...wrongShengmuses]));

    const wrongYunmus = YUNMU_LIST
      .filter(y => y.pinyin !== q.yunmu)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .map(y => y.pinyin);
    setYunmuOptions(shuffle([q.yunmu, ...wrongYunmus]));

    setTimeout(() => {
      handlePlayTarget(q.displayPinyin);
    }, 500);
  };

  const handlePlayTarget = async (pinyin: string) => {
    setIsSpeaking(true);
    try {
      await speakPinyin(pinyin, 0.6);
    } finally {
      setIsSpeaking(false);
    }
  };

  const checkAnswer = (sm: string, ym: string) => {
    const isCorrect = sm === question.shengmu && ym === question.yunmu;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (currentUserId) {
      recordProgress('drag', isCorrect);
    }

    if (isCorrect) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
      setTimeout(() => {
        resetQuestion();
      }, 2000);
    }
  };

  useEffect(() => {
    if (droppedShengmu && droppedYunmu && !feedback) {
      checkAnswer(droppedShengmu, droppedYunmu);
    }
  }, [droppedShengmu, droppedYunmu]);

  const handleDragStart = (e: React.DragEvent, value: string, type: 'shengmu' | 'yunmu') => {
    setDraggingItem({ value, type });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ value, type }));
  };

  const handleDragOver = (e: React.DragEvent, targetType: 'shengmu' | 'yunmu') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(targetType);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, targetType: 'shengmu' | 'yunmu') => {
    e.preventDefault();
    setDragOver(null);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === targetType) {
        if (targetType === 'shengmu') {
          setDroppedShengmu(data.value);
        } else {
          setDroppedYunmu(data.value);
        }
      }
    } catch {}
    setDraggingItem(null);
  };

  const handleCardClick = (value: string, type: 'shengmu' | 'yunmu') => {
    if (feedback) return;
    if (type === 'shengmu') {
      setDroppedShengmu(value);
    } else {
      setDroppedYunmu(value);
    }
  };

  const isShengmuUsed = (value: string) => droppedShengmu === value;
  const isYunmuUsed = (value: string) => droppedYunmu === value;

  return (
    <div className="min-h-screen">
      <NavBar />
      <Celebration trigger={showCelebration} />

      <div className="max-w-5xl mx-auto p-4 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">🧩 拼写练习</h1>
          <p className="text-gray-600">拖拽或点击声母和韵母，拼出正确的拼音</p>
        </div>

        <div className="card-cute mb-8 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handlePlayTarget(question.displayPinyin)}
                disabled={isSpeaking}
                className={`w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-70 ${
                  isSpeaking ? 'animate-pulse-slow ring-4 ring-yellow-300' : ''
                }`}
              >
                <Volume2 size={32} className={isSpeaking ? 'animate-bounce' : ''} />
              </button>
              <div className="text-center">
                <div className="text-5xl sm:text-7xl font-bold text-purple-600 mb-1">
                  {question.displayPinyin}
                </div>
                <div className="text-xl text-gray-500">{question.example}</div>
              </div>
            </div>
            <p className="text-sm text-gray-500">👆 点击喇叭听发音，然后拼出这个拼音</p>
          </div>
        </div>

        <div className="card-cute mb-8">
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="text-lg font-bold text-gray-600 mb-2">👇 把拼音拖到这里</div>
            <div className="flex items-center gap-4 sm:gap-8">
              <div
                className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border-4 border-dashed flex items-center justify-center text-4xl sm:text-5xl font-bold transition-all ${
                  dragOver === 'shengmu'
                    ? 'border-pink-500 bg-pink-50 scale-105'
                    : feedback === 'correct' && droppedShengmu
                    ? 'border-green-500 bg-green-50'
                    : feedback === 'wrong' && droppedShengmu
                    ? 'border-red-500 bg-red-50 animate-shake'
                    : 'border-pink-300 bg-pink-50/50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'shengmu')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'shengmu')}
              >
                {droppedShengmu ? (
                  <span className="text-pink-500">{droppedShengmu}</span>
                ) : (
                  <span className="text-pink-300 text-3xl">声</span>
                )}
              </div>

              <span className="text-4xl font-bold text-gray-400">+</span>

              <div
                className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border-4 border-dashed flex items-center justify-center text-4xl sm:text-5xl font-bold transition-all ${
                  dragOver === 'yunmu'
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : feedback === 'correct' && droppedYunmu
                    ? 'border-green-500 bg-green-50'
                    : feedback === 'wrong' && droppedYunmu
                    ? 'border-red-500 bg-red-50 animate-shake'
                    : 'border-blue-300 bg-blue-50/50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'yunmu')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'yunmu')}
              >
                {droppedYunmu ? (
                  <span className="text-blue-500">{droppedYunmu}</span>
                ) : (
                  <span className="text-blue-300 text-3xl">韵</span>
                )}
              </div>

              <span className="text-4xl font-bold text-gray-400">=</span>

              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {feedback && (
                  feedback === 'correct' ? (
                    <CheckCircle size={48} className="text-green-500 animate-pop" />
                  ) : (
                    <XCircle size={48} className="text-red-500 animate-shake" />
                  )
                )}
                {!feedback && droppedShengmu && droppedYunmu && (
                  <span className="text-gray-400 text-3xl">?</span>
                )}
              </div>
            </div>

            {feedback && (
              <div
                className={`text-xl font-bold mt-2 animate-pop ${
                  feedback === 'correct' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {feedback === 'correct' ? '🎉 太棒了！拼对啦！' : '❌ 再试一次吧！'}
              </div>
            )}

            {(droppedShengmu || droppedYunmu) && (
              <button
                onClick={resetQuestion}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all"
              >
                <RotateCcw size={18} />
                <span>清空重新拼</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-cute">
            <h3 className="text-xl font-bold text-pink-500 mb-4 text-center">🗣️ 声母（拖拽或点击）</h3>
            <div className="grid grid-cols-5 gap-3">
              {shengmuOptions.map((sm) => {
                const used = isShengmuUsed(sm);
                const isDragging = draggingItem?.value === sm && draggingItem?.type === 'shengmu';
                return (
                  <div
                    key={sm}
                    draggable={!used && !feedback}
                    onDragStart={(e) => handleDragStart(e, sm, 'shengmu')}
                    onDragEnd={() => setDraggingItem(null)}
                    onClick={() => handleCardClick(sm, 'shengmu')}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all ${
                      used
                        ? 'bg-gray-200 text-gray-400 opacity-50'
                        : isDragging
                        ? 'bg-gradient-to-br from-pink-300 to-rose-400 text-white scale-110 opacity-50'
                        : 'bg-gradient-to-br from-pink-100 to-rose-200 text-pink-600 shadow hover:shadow-md hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing'
                    }`}
                    ref={isDragging ? touchDragRef : null}
                  >
                    {sm}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card-cute">
            <h3 className="text-xl font-bold text-blue-500 mb-4 text-center">🎵 韵母（拖拽或点击）</h3>
            <div className="grid grid-cols-5 gap-3">
              {yunmuOptions.map((ym) => {
                const used = isYunmuUsed(ym);
                const isDragging = draggingItem?.value === ym && draggingItem?.type === 'yunmu';
                return (
                  <div
                    key={ym}
                    draggable={!used && !feedback}
                    onDragStart={(e) => handleDragStart(e, ym, 'yunmu')}
                    onDragEnd={() => setDraggingItem(null)}
                    onClick={() => handleCardClick(ym, 'yunmu')}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold transition-all ${
                      used
                        ? 'bg-gray-200 text-gray-400 opacity-50'
                        : isDragging
                        ? 'bg-gradient-to-br from-blue-300 to-cyan-400 text-white scale-110 opacity-50'
                        : 'bg-gradient-to-br from-blue-100 to-cyan-200 text-blue-600 shadow hover:shadow-md hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    {ym}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={resetQuestion}
            className="btn-cute bg-gradient-to-r from-purple-400 to-pink-500 text-lg"
          >
            🎲 换一题
          </button>
        </div>
      </div>
    </div>
  );
}
