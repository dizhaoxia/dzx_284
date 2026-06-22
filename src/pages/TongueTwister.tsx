import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Play, Star, Lock, CheckCircle, RotateCcw, Volume2, ChevronLeft } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import NavBar from '@/components/NavBar';
import type { TwisterDifficulty, TwisterItem } from '@/types';
import { TWISTER_LIST, getTwistersByDifficulty, DIFFICULTY_CONFIG, evaluateTwisterPerformance } from '@/utils/twisterData';
import { getUserTwisterData, updateTwisterProgress, checkAndUnlockLevel } from '@/utils/storage';
import { speakPinyin, stopSpeaking } from '@/utils/speech';

type ViewMode = 'levels' | 'practice' | 'result';

export default function TongueTwister() {
  const navigate = useNavigate();
  const { users, currentUserId } = useUserStore();
  const currentUser = users.find(u => u.id === currentUserId);

  const [view, setView] = useState<ViewMode>('levels');
  const [selectedDifficulty, setSelectedDifficulty] = useState<TwisterDifficulty>('easy');
  const [currentTwister, setCurrentTwister] = useState<TwisterItem | null>(null);
  const [userData, setUserData] = useState(() => currentUserId ? getUserTwisterData(currentUserId) : null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [resultStars, setResultStars] = useState(0);
  const [matchRate, setMatchRate] = useState(0);
  const [unlockedMessage, setUnlockedMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const recordingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentUserId) {
      setUserData(getUserTwisterData(currentUserId));
    } else {
      setUserData(null);
    }
  }, [currentUserId]);

  useEffect(() => {
    return () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      stopSpeaking();
    };
  }, []);

  const refreshUserData = () => {
    if (currentUserId) {
      setUserData(getUserTwisterData(currentUserId));
    }
  };

  const isLevelUnlocked = (difficulty: TwisterDifficulty): boolean => {
    if (!userData) return difficulty === 'easy';
    const levelOrder: TwisterDifficulty[] = ['easy', 'medium', 'hard'];
    const currentIdx = levelOrder.indexOf(difficulty);
    const unlockedIdx = levelOrder.indexOf(userData.unlockedLevel);
    return currentIdx <= unlockedIdx;
  };

  const handleStartPractice = (twister: TwisterItem) => {
    setCurrentTwister(twister);
    setRecognizedText('');
    setResultStars(0);
    setMatchRate(0);
    setView('practice');
  };

  const handlePlayAudio = async () => {
    if (!currentTwister || isSpeaking) return;
    try {
      setIsSpeaking(true);
      await speakPinyin(currentTwister.text, 0.6);
    } finally {
      setIsSpeaking(false);
    }
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别功能，请使用 Chrome 或 Edge 浏览器。');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('语音识别不可用');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    let finalText = '';

    recognition.onstart = () => {
      setIsRecording(true);
      setRecognizedText('');
    };

    recognition.onresult = (event: any) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }
      setRecognizedText(finalText + interimText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (finalText) {
        finishEvaluation(finalText);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      const text = finalText || recognizedText;
      if (text) {
        finishEvaluation(text);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      recordingTimeoutRef.current = window.setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 15000);
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
    setIsRecording(false);
  };

  const finishEvaluation = (text: string) => {
    if (!currentTwister || !currentUserId) return;

    const result = evaluateTwisterPerformance(
      text,
      currentTwister.text,
      currentTwister.highlightPinyins
    );

    setResultStars(result.stars);
    setMatchRate(Math.round(result.matchRate * 100));

    updateTwisterProgress(currentUserId, currentTwister.id, result.stars);

    const twistersInLevel = getTwistersByDifficulty(currentTwister.difficulty);
    const previousUnlocked = userData?.unlockedLevel || 'easy';
    const newUnlocked = checkAndUnlockLevel(currentUserId, currentTwister.difficulty, twistersInLevel);

    const levelOrder: TwisterDifficulty[] = ['easy', 'medium', 'hard'];
    if (levelOrder.indexOf(newUnlocked) > levelOrder.indexOf(previousUnlocked)) {
      setUnlockedMessage(`🎉 恭喜解锁【${DIFFICULTY_CONFIG[newUnlocked].label}】难度！`);
    }

    refreshUserData();
    setView('result');
  };

  const handleBackToLevels = () => {
    setView('levels');
    setCurrentTwister(null);
    setUnlockedMessage(null);
    stopSpeaking();
  };

  const handleRetry = () => {
    setRecognizedText('');
    setResultStars(0);
    setMatchRate(0);
    setView('practice');
  };

  const handleNextTwister = () => {
    if (!currentTwister) return;
    const twisters = getTwistersByDifficulty(currentTwister.difficulty);
    const currentIdx = twisters.findIndex(t => t.id === currentTwister.id);
    if (currentIdx < twisters.length - 1) {
      handleStartPractice(twisters[currentIdx + 1]);
    } else {
      handleBackToLevels();
    }
  };

  const renderStars = (count: number, size: number = 24) => (
    <div className="flex gap-1">
      {[1, 2, 3].map(i => (
        <Star
          key={i}
          size={size}
          className={`transition-all ${i <= count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  const renderHighlightedText = (text: string, highlights: string[]) => {
    const chars = [...text];
    const highlightSet = new Set(highlights);
    
    return chars.map((char, idx) => {
      if (/[，。！？、；：""''（）\s]/.test(char)) {
        return <span key={idx}>{char}</span>;
      }
      const shouldHighlight = highlights.some(h => h.includes(char)) || highlightSet.has(char);
      return (
        <span
          key={idx}
          className={shouldHighlight ? 'text-rose-500 font-bold bg-rose-50 px-0.5 rounded' : ''}
        >
          {char}
        </span>
      );
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          <div className="card-cute text-center py-16">
            <div className="text-6xl mb-4">👶</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">请先选择孩子档案</h2>
            <button
              onClick={() => navigate('/')}
              className="btn-cute bg-gradient-to-r from-primary to-orange-400"
            >
              返回首页选择
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'levels') {
    const difficulties: TwisterDifficulty[] = ['easy', 'medium', 'hard'];

    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2 animate-pop">🎤 绕口令闯关</h1>
            <p className="text-gray-600">挑战你的口才，看谁说得又快又准！</p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-full">
              <span className="text-2xl">{currentUser.avatar}</span>
              <span className="font-bold text-gray-700">{currentUser.name} 正在挑战</span>
            </div>
          </div>

          {unlockedMessage && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl text-center animate-pop">
              <span className="text-xl font-bold text-green-700">{unlockedMessage}</span>
            </div>
          )}

          <div className="space-y-8">
            {difficulties.map(diff => {
              const config = DIFFICULTY_CONFIG[diff];
              const unlocked = isLevelUnlocked(diff);
              const twisters = getTwistersByDifficulty(diff);
              const totalStars = twisters.reduce((sum, t) => {
                const progress = userData?.progress[t.id];
                return sum + (progress?.stars || 0);
              }, 0);
              const maxStars = twisters.length * 3;

              return (
                <div
                  key={diff}
                  className={`card-cute overflow-hidden ${!unlocked ? 'opacity-60' : ''}`}
                >
                  <div className={`bg-gradient-to-r ${config.color} p-6 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-5xl">{config.icon}</span>
                        <div>
                          <h2 className="text-3xl font-bold">{config.label}难度</h2>
                          <p className="opacity-90">
                            {unlocked
                              ? `共 ${twisters.length} 段绕口令，加油挑战！`
                              : (() => {
                                  const levelOrder: TwisterDifficulty[] = ['easy', 'medium', 'hard'];
                                  const idx = levelOrder.indexOf(diff);
                                  const prevLevel = levelOrder[Math.max(0, idx - 1)];
                                  return `通关【${DIFFICULTY_CONFIG[prevLevel].label}】全部关卡后解锁`;
                                })()
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-1 mb-1">
                          {renderStars(Math.min(3, Math.floor(totalStars / Math.max(1, twisters.length))), 20)}
                        </div>
                        <div className="text-sm opacity-90">{totalStars} / {maxStars} ⭐</div>
                      </div>
                    </div>
                    {!unlocked && (
                      <div className="mt-4 flex items-center justify-center gap-2 bg-white/20 rounded-xl py-2">
                        <Lock size={20} />
                        <span className="font-bold">关卡锁定中</span>
                      </div>
                    )}
                  </div>

                  {unlocked && (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {twisters.map((twister, idx) => {
                        const progress = userData?.progress[twister.id];
                        const stars = progress?.stars || 0;
                        return (
                          <button
                            key={twister.id}
                            onClick={() => handleStartPractice(twister)}
                            className="group relative p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border-2 border-transparent hover:border-orange-300 text-left"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-400 text-white font-bold text-sm">
                                {idx + 1}
                              </span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3].map(s => (
                                  <Star
                                    key={s}
                                    size={16}
                                    className={s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                                  />
                                ))}
                              </div>
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2 text-lg group-hover:text-primary transition-colors">
                              {twister.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-3">
                              {twister.text.slice(0, 30)}...
                            </p>
                            {progress?.completed && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle size={20} className="text-green-500" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'practice' && currentTwister) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          <button
            onClick={handleBackToLevels}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary transition-colors mb-4"
          >
            <ChevronLeft size={20} />
            <span>返回关卡列表</span>
          </button>

          <div className={`card-cute overflow-hidden`}>
            <div className={`bg-gradient-to-r ${DIFFICULTY_CONFIG[currentTwister.difficulty].color} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{DIFFICULTY_CONFIG[currentTwister.difficulty].icon}</span>
                  <div>
                    <div className="text-sm opacity-90">{DIFFICULTY_CONFIG[currentTwister.difficulty].label}难度</div>
                    <h2 className="text-2xl font-bold">{currentTwister.title}</h2>
                  </div>
                </div>
                <button
                  onClick={handlePlayAudio}
                  disabled={isSpeaking}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full font-bold transition-all disabled:opacity-50"
                >
                  <Volume2 size={20} className={isSpeaking ? 'animate-pulse' : ''} />
                  <span>{isSpeaking ? '播放中...' : '听示范'}</span>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-bold text-gray-700">📖 绕口令内容</h3>
                  <span className="text-xs text-gray-400">（红色为重点发音）</span>
                </div>
                <div className="p-6 bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl text-2xl sm:text-3xl leading-loose font-bold text-gray-800">
                  {renderHighlightedText(currentTwister.text, currentTwister.highlightPinyins)}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-700 mb-3">🔤 拼音标注</h3>
                <div className="p-4 bg-gray-50 rounded-2xl text-lg text-gray-600 leading-loose">
                  {currentTwister.pinyin}
                </div>
              </div>

              {recognizedText && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-700 mb-3">🎤 识别到的内容</h3>
                  <div className="p-4 bg-blue-50 rounded-2xl text-xl text-gray-800">
                    {recognizedText || '（未检测到语音）'}
                  </div>
                </div>
              )}

              <div className="text-center pt-6 border-t border-gray-100">
                <p className="text-gray-500 mb-4">
                  {isRecording ? '🎙️ 正在录音，请大声朗读...' : '准备好后点击下方按钮开始跟读！'}
                </p>
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <Mic size={28} className="group-hover:animate-bounce" />
                    <span>🎤 开始跟读</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full font-bold text-xl shadow-lg hover:shadow-xl transition-all animate-pulse"
                  >
                    <div className="w-6 h-6 bg-white rounded-sm animate-pulse" />
                    <span>⏹ 停止录音</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'result' && currentTwister) {
    const encouragement = resultStars >= 3 ? '太厉害了！绕口令大王！👑' 
      : resultStars >= 2 ? '非常棒！继续加油！💪'
      : resultStars >= 1 ? '不错哦！再练习会更好！🌟'
      : '加油！多练习几次就能成功！🌈';

    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="max-w-2xl mx-auto p-4 sm:p-8">
          <div className="card-cute overflow-hidden animate-pop">
            <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-8 text-white text-center">
              <div className="text-6xl mb-4">
                {resultStars >= 3 ? '🎉' : resultStars >= 2 ? '🎊' : resultStars >= 1 ? '👏' : '💪'}
              </div>
              <h2 className="text-3xl font-bold mb-2">挑战完成！</h2>
              <p className="text-xl opacity-90">{encouragement}</p>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-block p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl">
                  <div className="flex justify-center gap-3 mb-4">
                    {[1, 2, 3].map(i => (
                      <Star
                        key={i}
                        size={48}
                        className={`transition-all duration-500 ${
                          i <= resultStars
                            ? 'text-yellow-400 fill-yellow-400 animate-pop'
                            : 'text-gray-300'
                        }`}
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                    ))}
                  </div>
                  <div className="text-4xl font-bold text-gray-800">
                    {resultStars} / 3 ⭐
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl text-center">
                  <div className="text-sm text-gray-500 mb-1">匹配准确率</div>
                  <div className="text-3xl font-bold text-blue-600">{matchRate}%</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl text-center">
                  <div className="text-sm text-gray-500 mb-1">关卡</div>
                  <div className="text-xl font-bold text-green-600 pt-2">{currentTwister.title}</div>
                </div>
              </div>

              {recognizedText && (
                <div className="mb-8">
                  <h3 className="font-bold text-gray-700 mb-2">📝 你的朗读</h3>
                  <div className="p-4 bg-gray-50 rounded-2xl text-lg text-gray-700">
                    {recognizedText}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all"
                >
                  <RotateCcw size={22} />
                  <span>再挑战一次</span>
                </button>
                <button
                  onClick={handleNextTwister}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary to-orange-400 text-white rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all"
                >
                  <Play size={22} />
                  <span>继续下一关</span>
                </button>
              </div>

              <button
                onClick={handleBackToLevels}
                className="w-full mt-4 py-3 text-gray-500 hover:text-primary font-bold transition-colors"
              >
                返回关卡列表
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
