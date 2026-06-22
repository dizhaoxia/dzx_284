import { useState } from 'react';
import { Volume2, RotateCcw } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { SHENGMU_LIST, YUNMU_LIST, TONE_LIST, combinePinyin, applyTone } from '@/utils/pinyinData';
import { speakCombination, speakPinyin } from '@/utils/speech';
import { useUserStore } from '@/store/userStore';
import type { ToneNumber } from '@/types';

export default function SpellingPractice() {
  const { currentUserId, recordProgress } = useUserStore();
  const [selectedShengmu, setSelectedShengmu] = useState('');
  const [selectedYunmu, setSelectedYunmu] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneNumber>(0);
  const [isCombined, setIsCombined] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const canCombine = selectedShengmu && selectedYunmu;

  const combinedPinyin = canCombine
    ? combinePinyin(selectedShengmu, selectedYunmu, selectedTone)
    : '';

  const displayYunmu = selectedYunmu ? applyTone(selectedYunmu, selectedTone) : '';

  const handleCombine = () => {
    if (!canCombine) return;
    setIsCombined(true);
    if (currentUserId) {
      recordProgress('spelling', true);
    }
  };

  const handlePlayCombined = async () => {
    if (!combinedPinyin) return;
    setIsSpeaking(true);
    try {
      await speakCombination(selectedShengmu, selectedYunmu, selectedTone);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleReset = () => {
    setSelectedShengmu('');
    setSelectedYunmu('');
    setSelectedTone(0);
    setIsCombined(false);
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">✏️ 拼读练习</h1>
          <p className="text-gray-600">选择声母、韵母和声调，组合出完整的拼音</p>
        </div>

        <div className="card-cute mb-8">
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            {isCombined && combinedPinyin ? (
              <div className="text-center animate-pop">
                <div className="text-6xl sm:text-8xl font-bold text-primary mb-4">
                  {combinedPinyin}
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handlePlayCombined}
                    disabled={isSpeaking}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Volume2 size={24} className={isSpeaking ? 'animate-bounce' : ''} />
                    <span>听发音</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-200 text-gray-700 font-bold text-lg shadow hover:bg-gray-300 hover:scale-105 active:scale-95 transition-all"
                  >
                    <RotateCcw size={24} />
                    <span>重新开始</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center text-5xl sm:text-6xl font-bold text-pink-500 border-4 border-dashed border-pink-300">
                  {selectedShengmu || '?'}
                </div>
                <span className="text-4xl font-bold text-gray-400">+</span>
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-blue-100 to-cyan-200 flex items-center justify-center text-5xl sm:text-6xl font-bold text-blue-500 border-4 border-dashed border-blue-300">
                  {displayYunmu || '?'}
                </div>
                <span className="text-4xl font-bold text-gray-400">=</span>
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-5xl sm:text-6xl font-bold text-gray-400 border-4 border-dashed border-gray-300">
                  ?
                </div>
              </div>
            )}

            {!isCombined && (
              <div className="mt-6">
                <div className="text-sm font-bold text-gray-500 mb-2 text-center">选择声调</div>
                <div className="flex gap-3 justify-center">
                  {TONE_LIST.map((tone) => (
                    <button
                      key={tone.number}
                      onClick={() => setSelectedTone(tone.number)}
                      className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold transition-all ${
                        selectedTone === tone.number
                          ? `${tone.color} text-white shadow-lg scale-110 ring-2 ring-yellow-400`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                      }`}
                    >
                      <span className="text-2xl">{tone.mark}</span>
                      <span className="text-xs">{tone.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {canCombine && !isCombined && (
              <button
                onClick={handleCombine}
                className="mt-6 px-10 py-4 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all animate-bounce-slow"
              >
                🎯 组合拼音
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-cute">
            <h3 className="text-xl font-bold text-pink-500 mb-4 text-center">🗣️ 选择声母</h3>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
              {SHENGMU_LIST.map((item) => (
                <button
                  key={item.pinyin}
                  onClick={() => {
                    setSelectedShengmu(item.pinyin);
                    speakPinyin(item.pinyin, 0.8);
                  }}
                  className={`w-full aspect-square rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold cursor-pointer transition-all duration-200 ${
                    selectedShengmu === item.pinyin
                      ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg scale-110 ring-2 ring-yellow-400'
                      : 'bg-gradient-to-br from-pink-50 to-rose-100 text-pink-600 shadow hover:shadow-md hover:scale-105 active:scale-95'
                  }`}
                >
                  {item.pinyin}
                </button>
              ))}
            </div>
          </div>

          <div className="card-cute">
            <h3 className="text-xl font-bold text-blue-500 mb-4 text-center">🎵 选择韵母</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {YUNMU_LIST.map((item) => (
                <button
                  key={item.pinyin}
                  onClick={() => {
                    setSelectedYunmu(item.pinyin);
                    speakPinyin(item.pinyin, 0.8);
                  }}
                  className={`w-full aspect-square rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold cursor-pointer transition-all duration-200 ${
                    selectedYunmu === item.pinyin
                      ? 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg scale-110 ring-2 ring-yellow-400'
                      : 'bg-gradient-to-br from-blue-50 to-cyan-100 text-blue-600 shadow hover:shadow-md hover:scale-105 active:scale-95'
                  }`}
                >
                  {item.pinyin}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
