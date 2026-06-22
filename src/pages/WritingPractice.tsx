import { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw, Volume2, ChevronLeft, ChevronRight, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { getStrokeData, scaleStrokePoints, calculateStrokeSimilarity } from '@/utils/writingStrokeData';
import { updateWritingRecord } from '@/utils/storage';
import { speakPinyin } from '@/utils/speech';
import { useUserStore } from '@/store/userStore';
import { SHENGMU_LIST, YUNMU_LIST } from '@/utils/pinyinData';
import type { PinyinType, StrokePoint, PinyinItem } from '@/types';

const CANVAS_SIZE = 400;
const SIMILARITY_THRESHOLD = 0.5;
const STROKE_COLORS = [
  '#ec4899', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ef4444',
];

const PRAISE_WORDS = [
  '太棒了！写得真好！',
  '真厉害！继续加油！',
  '完美！你是最棒的！',
  '好聪明！写得太漂亮了！',
  '真不错！再接再厉！',
];

export default function WritingPractice() {
  const { users, currentUserId } = useUserStore();
  const currentUser = users.find(u => u.id === currentUserId);

  const [activeTab, setActiveTab] = useState<PinyinType>('shengmu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [userStrokes, setUserStrokes] = useState<StrokePoint[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [masteredPinyins, setMasteredPinyins] = useState<string[]>([]);
  const [writingRecords, setWritingRecords] = useState<Record<string, { correct: number; total: number; lastPractice: string }>>({});

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const list = activeTab === 'shengmu' ? SHENGMU_LIST : YUNMU_LIST;
  const currentItem: PinyinItem = list[currentIndex] || list[0];
  const strokeData = getStrokeData(currentItem?.pinyin || '');

  useEffect(() => {
    if (currentUserId) {
      import('@/utils/storage').then(({ getUserWritingData }) => {
        const data = getUserWritingData(currentUserId);
        setMasteredPinyins(data.masteredPinyins);
        setWritingRecords(data.writingRecords);
      });
    }
  }, [currentUserId]);

  useEffect(() => {
    setCurrentIndex(0);
    setResult('idle');
    setFeedbackMessage('');
    setUserStrokes([]);
    setCurrentStroke([]);
  }, [activeTab]);

  useEffect(() => {
    setResult('idle');
    setFeedbackMessage('');
    setUserStrokes([]);
    setCurrentStroke([]);
    if (strokeData) {
      playStrokeAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentItem?.pinyin]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(0, CANVAS_SIZE / 2);
    ctx.lineTo(CANVAS_SIZE, CANVAS_SIZE / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(CANVAS_SIZE / 2, 0);
    ctx.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(CANVAS_SIZE, CANVAS_SIZE);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(CANVAS_SIZE, 0);
    ctx.lineTo(0, CANVAS_SIZE);
    ctx.stroke();

    ctx.setLineDash([]);

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }, []);

  const drawStrokePoints = useCallback((
    ctx: CanvasRenderingContext2D,
    points: StrokePoint[],
    color: string,
    lineWidth: number = 6,
    alpha: number = 1
  ) => {
    if (points.length < 2) return;

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, []);

  const drawArrow = useCallback((
    ctx: CanvasRenderingContext2D,
    from: StrokePoint,
    to: StrokePoint,
    color: string
  ) => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLen = 12;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLen * Math.cos(angle - Math.PI / 6),
      to.y - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      to.x - headLen * Math.cos(angle + Math.PI / 6),
      to.y - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !strokeData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawGrid(ctx);

    strokeData.strokes.forEach((stroke, idx) => {
      const scaledPoints = scaleStrokePoints(
        stroke.points,
        CANVAS_SIZE,
        CANVAS_SIZE,
        strokeData.boundingBox
      );
      const color = STROKE_COLORS[idx % STROKE_COLORS.length];
      drawStrokePoints(ctx, scaledPoints, color, 6, 0.15);

      if (scaledPoints.length >= 2) {
        const lastIdx = Math.min(2, scaledPoints.length - 1);
        drawArrow(
          ctx,
          scaledPoints[scaledPoints.length - 1 - lastIdx],
          scaledPoints[scaledPoints.length - 1],
          color
        );
      }
    });

    userStrokes.forEach((stroke, idx) => {
      drawStrokePoints(ctx, stroke, STROKE_COLORS[idx % STROKE_COLORS.length], 5);
    });

    if (currentStroke.length > 0) {
      const nextIdx = userStrokes.length;
      drawStrokePoints(ctx, currentStroke, STROKE_COLORS[nextIdx % STROKE_COLORS.length], 5);
    }
  }, [strokeData, userStrokes, currentStroke, drawGrid, drawStrokePoints, drawArrow]);

  useEffect(() => {
    if (!isAnimating) {
      redrawCanvas();
    }
  }, [redrawCanvas, isAnimating]);

  const playStrokeAnimation = useCallback(() => {
    if (!strokeData || animationRef.current) return;

    setIsAnimating(true);
    setAnimationStep(0);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let currentStrokeIdx = 0;
    let pointProgress = 0;

    const animate = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drawGrid(ctx);

      strokeData.strokes.forEach((stroke, idx) => {
        const scaledPoints = scaleStrokePoints(
          stroke.points,
          CANVAS_SIZE,
          CANVAS_SIZE,
          strokeData.boundingBox
        );
        const color = STROKE_COLORS[idx % STROKE_COLORS.length];

        if (idx < currentStrokeIdx) {
          drawStrokePoints(ctx, scaledPoints, color, 6, 0.25);
        } else if (idx === currentStrokeIdx) {
          const progressPoints = scaledPoints.slice(0, Math.ceil(pointProgress));
          drawStrokePoints(ctx, progressPoints, color, 6, 0.9);

          if (progressPoints.length >= 2) {
            const lastIdx = Math.min(2, progressPoints.length - 1);
            drawArrow(
              ctx,
              progressPoints[progressPoints.length - 1 - lastIdx],
              progressPoints[progressPoints.length - 1],
              color
            );
          }
        } else {
          drawStrokePoints(ctx, scaledPoints, color, 6, 0.1);
        }
      });

      const currentScaledStroke = scaleStrokePoints(
        strokeData.strokes[currentStrokeIdx].points,
        CANVAS_SIZE,
        CANVAS_SIZE,
        strokeData.boundingBox
      );

      const speed = Math.max(2, currentScaledStroke.length / 30);
      pointProgress += speed;

      if (pointProgress >= currentScaledStroke.length) {
        currentStrokeIdx++;
        pointProgress = 0;
        setAnimationStep(currentStrokeIdx);

        if (currentStrokeIdx >= strokeData.strokes.length) {
          setTimeout(() => {
            setIsAnimating(false);
            setAnimationStep(0);
            animationRef.current = null;
            redrawCanvas();
          }, 500);
          return;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [strokeData, drawGrid, drawStrokePoints, drawArrow, redrawCanvas]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent): StrokePoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleDrawStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isAnimating || result === 'correct') return;
    e.preventDefault();

    const point = getCanvasCoords(e);
    if (!point) return;

    setIsDrawing(true);
    setCurrentStroke([point]);
    setResult('idle');
    setFeedbackMessage('');
  };

  const handleDrawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isAnimating) return;
    e.preventDefault();

    const point = getCanvasCoords(e);
    if (!point) return;

    setCurrentStroke(prev => [...prev, point]);
  };

  const handleDrawEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 3) {
      setUserStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke([]);
  };

  const handleCheck = () => {
    if (!strokeData || userStrokes.length === 0 || !currentUserId) return;

    const scaledTargetStrokes = strokeData.strokes.map(s =>
      scaleStrokePoints(s.points, CANVAS_SIZE, CANVAS_SIZE, strokeData.boundingBox)
    );

    if (userStrokes.length !== scaledTargetStrokes.length) {
      setResult('wrong');
      setFeedbackMessage(`笔画数量不对哦！应该是 ${scaledTargetStrokes.length} 笔，你写了 ${userStrokes.length} 笔。再试一次！`);
      speakPinyin('再试一次', 0.9);
      setTimeout(() => {
        playStrokeAnimation();
        setUserStrokes([]);
        setCurrentStroke([]);
        setResult('idle');
        setFeedbackMessage('');
      }, 2000);
      return;
    }

    let totalSimilarity = 0;
    let allCorrect = true;

    for (let i = 0; i < scaledTargetStrokes.length; i++) {
      const sim = calculateStrokeSimilarity(userStrokes[i], scaledTargetStrokes[i], 40);
      totalSimilarity += sim;
      if (sim < SIMILARITY_THRESHOLD) {
        allCorrect = false;
      }
    }

    const avgSimilarity = totalSimilarity / scaledTargetStrokes.length;

    if (allCorrect || avgSimilarity >= 0.6) {
      setResult('correct');
      const praise = PRAISE_WORDS[Math.floor(Math.random() * PRAISE_WORDS.length)];
      setFeedbackMessage(praise);
      speakPinyin(praise, 0.9);
      updateWritingRecord(currentUserId, currentItem.pinyin, true);

      import('@/utils/storage').then(({ getUserWritingData }) => {
        const data = getUserWritingData(currentUserId!);
        setMasteredPinyins([...data.masteredPinyins]);
        setWritingRecords({ ...data.writingRecords });
      });
    } else {
      setResult('wrong');
      setFeedbackMessage('笔顺不太对哦，再试一次！');
      speakPinyin('再试一次', 0.9);
      updateWritingRecord(currentUserId, currentItem.pinyin, false);

      import('@/utils/storage').then(({ getUserWritingData }) => {
        const data = getUserWritingData(currentUserId!);
        setWritingRecords({ ...data.writingRecords });
      });

      setTimeout(() => {
        playStrokeAnimation();
        setUserStrokes([]);
        setCurrentStroke([]);
        setResult('idle');
        setFeedbackMessage('');
      }, 2000);
    }
  };

  const handleClear = () => {
    if (isAnimating) return;
    setUserStrokes([]);
    setCurrentStroke([]);
    setResult('idle');
    setFeedbackMessage('');
  };

  const handleReplay = () => {
    if (isAnimating) return;
    playStrokeAnimation();
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setCurrentIndex(prev => (prev - 1 + list.length) % list.length);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setCurrentIndex(prev => (prev + 1) % list.length);
  };

  const handlePlayPinyin = () => {
    speakPinyin(currentItem.pinyin, 0.8);
  };

  const isMastered = masteredPinyins.includes(currentItem?.pinyin || '');
  const record = writingRecords[currentItem?.pinyin || ''];
  const totalPracticed = Object.values(writingRecords).filter(r => r.total > 0).length;
  const totalMastered = masteredPinyins.filter(p => list.some(item => item.pinyin === p)).length;
  const progressPercent = Math.round((totalPracticed / list.length) * 100);
  const masteredPercent = Math.round((totalMastered / list.length) * 100);

  const gradientClass = activeTab === 'shengmu'
    ? 'from-pink-400 to-rose-500'
    : 'from-blue-400 to-cyan-500';

  const bgGradientClass = activeTab === 'shengmu'
    ? 'from-pink-50 to-rose-100'
    : 'from-blue-50 to-cyan-100';

  const textColorClass = activeTab === 'shengmu'
    ? 'text-pink-600'
    : 'text-blue-600';

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-5xl mx-auto p-4 sm:p-8">
        {currentUser && (
          <div className="text-center mb-6">
            <span className="text-3xl mr-2">{currentUser.avatar}</span>
            <span className="text-xl font-bold text-gray-700">{currentUser.name} 的书写练习</span>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">✍️ 书写练习</h1>
          <p className="text-gray-600">跟着笔顺动画，用手指或鼠标写出正确的拼音</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('shengmu')}
            className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${
              activeTab === 'shengmu'
                ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 shadow hover:shadow-md hover:scale-105'
            }`}
          >
            🗣️ 声母练习
          </button>
          <button
            onClick={() => setActiveTab('yunmu')}
            className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${
              activeTab === 'yunmu'
                ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 shadow hover:shadow-md hover:scale-105'
            }`}
          >
            🎵 韵母练习
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className={`card-cute bg-gradient-to-r ${bgGradientClass}`}>
            <div className="text-center">
              <div className="text-3xl mb-2">📚</div>
              <div className="text-sm font-bold text-gray-500 mb-1">练习进度</div>
              <div className={`text-2xl font-bold ${textColorClass}`}>{totalPracticed}/{list.length}</div>
              <div className="mt-2 h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${gradientClass} transition-all duration-500`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{progressPercent}%</div>
            </div>
          </div>

          <div className="card-cute bg-gradient-to-r from-green-50 to-emerald-100">
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-sm font-bold text-gray-500 mb-1">已掌握</div>
              <div className="text-2xl font-bold text-green-600">{totalMastered}/{list.length}</div>
              <div className="mt-2 h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                  style={{ width: `${masteredPercent}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{masteredPercent}%</div>
            </div>
          </div>

          <div className="card-cute bg-gradient-to-r from-yellow-50 to-orange-100">
            <div className="text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-sm font-bold text-gray-500 mb-1">当前正确率</div>
              <div className="text-2xl font-bold text-orange-600">
                {record && record.total > 0 ? `${Math.round((record.correct / record.total) * 100)}%` : '--'}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {record && record.total > 0 ? `共练习 ${record.total} 次` : '还没练习过哦'}
              </div>
              {isMastered && (
                <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold animate-pop">
                  <CheckCircle2 size={14} />
                  <span>已掌握</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card-cute">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrev}
                  disabled={isAnimating}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${gradientClass} text-white mb-2`}>
                    <span className="text-4xl sm:text-5xl font-bold">{currentItem?.pinyin}</span>
                    <button
                      onClick={handlePlayPinyin}
                      className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    例词：{currentItem?.example} · {currentItem?.mouthShape}
                  </div>
                  {strokeData && (
                    <div className="text-xs text-gray-400 mt-1">
                      共 {strokeData.strokes.length} 笔 · 已写 {userStrokes.length} 笔
                      {isAnimating && ` · 笔顺演示中...`}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  disabled={isAnimating}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="relative mx-auto" style={{ maxWidth: CANVAS_SIZE }}>
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  className="w-full aspect-square rounded-2xl bg-white shadow-inner touch-none cursor-crosshair"
                  onMouseDown={handleDrawStart}
                  onMouseMove={handleDrawMove}
                  onMouseUp={handleDrawEnd}
                  onMouseLeave={handleDrawEnd}
                  onTouchStart={handleDrawStart}
                  onTouchMove={handleDrawMove}
                  onTouchEnd={handleDrawEnd}
                />

                {result !== 'idle' && (
                  <div className={`absolute inset-0 rounded-2xl flex items-center justify-center ${
                    result === 'correct' ? 'bg-green-500/10' : 'bg-red-500/10'
                  } animate-pop`}>
                    <div className={`px-6 py-4 rounded-2xl shadow-xl ${
                      result === 'correct' ? 'bg-green-500' : 'bg-red-500'
                    } text-white text-center`}>
                      <div className="text-5xl mb-2">
                        {result === 'correct' ? <Sparkles className="inline animate-bounce" /> : <XCircle className="inline" />}
                      </div>
                      <div className="text-xl font-bold">{feedbackMessage}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <button
                  onClick={handleReplay}
                  disabled={isAnimating}
                  className="btn-cute flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-purple-400 to-violet-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Volume2 size={20} />
                  <span>看笔顺</span>
                </button>

                <button
                  onClick={handleClear}
                  disabled={isAnimating || userStrokes.length === 0}
                  className="btn-cute flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw size={20} />
                  <span>擦除重写</span>
                </button>

                <button
                  onClick={handleCheck}
                  disabled={isAnimating || userStrokes.length === 0 || result === 'correct'}
                  className="btn-cute flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-bounce-slow"
                >
                  <CheckCircle2 size={22} />
                  <span>检查一下</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-cute">
              <h3 className={`text-lg font-bold mb-4 ${textColorClass}`}>
                📝 {activeTab === 'shengmu' ? '声母列表' : '韵母列表'}
              </h3>
              <div className={`grid gap-2 ${activeTab === 'shengmu' ? 'grid-cols-4' : 'grid-cols-3'} max-h-80 overflow-y-auto pr-1`}>
                {list.map((item, idx) => {
                  const mastered = masteredPinyins.includes(item.pinyin);
                  const rec = writingRecords[item.pinyin];
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={item.pinyin}
                      onClick={() => !isAnimating && setCurrentIndex(idx)}
                      disabled={isAnimating}
                      className={`relative aspect-square rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl transition-all duration-200 ${
                        isCurrent
                          ? `bg-gradient-to-br ${gradientClass} text-white shadow-lg scale-105 ring-2 ring-yellow-400`
                          : mastered
                          ? 'bg-gradient-to-br from-green-100 to-emerald-200 text-green-700 shadow hover:shadow-md hover:scale-105'
                          : rec && rec.total > 0
                          ? 'bg-gradient-to-br from-yellow-50 to-orange-100 text-orange-600 shadow hover:shadow-md hover:scale-105'
                          : 'bg-gray-50 text-gray-600 shadow hover:bg-gray-100 hover:scale-105'
                      } disabled:cursor-not-allowed`}
                    >
                      {item.pinyin}
                      {mastered && (
                        <span className="absolute -top-1 -right-1 text-base">⭐</span>
                      )}
                      {rec && rec.total > 0 && !mastered && (
                        <span className="absolute bottom-0.5 right-0.5 text-[10px] font-bold">
                          {Math.round((rec.correct / rec.total) * 100)}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card-cute bg-gradient-to-r from-yellow-50 to-orange-50">
              <h3 className="text-xl font-bold text-gray-700 mb-4">💡 小提示</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start gap-2">
                  <span>1️⃣</span>
                  <span>先点击"看笔顺"按钮，观察正确的书写顺序</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>2️⃣</span>
                  <span>在格子里按笔顺写出拼音，一笔一笔来</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>3️⃣</span>
                  <span>写完后点击"检查一下"按钮验证</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>4️⃣</span>
                  <span>连续写对3次以上就能掌握哦！⭐</span>
                </li>
              </ul>
            </div>

            <div className="card-cute">
              <h3 className="text-lg font-bold text-gray-700 mb-3">🎨 颜色说明</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200" />
                  <span className="text-gray-600">未练习</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-50 to-orange-100" />
                  <span className="text-gray-600">练习中</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-green-100 to-emerald-200" />
                  <span className="text-gray-600">已掌握 ⭐</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded bg-gradient-to-br ${gradientClass}`} />
                  <span className="text-gray-600">当前正在练习</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
