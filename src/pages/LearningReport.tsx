import { useState, useEffect, useMemo } from 'react';
import { useUserStore } from '@/store/userStore';
import NavBar from '@/components/NavBar';
import { SHENGMU_LIST, YUNMU_LIST } from '@/utils/pinyinData';
import { getUserReportData, getTodayStats, getUserWritingData, getUserTwisterData } from '@/utils/storage';
import type { PinyinMastery, UserReportData, DailyStat, UserWritingData, UserTwisterData, WeakPoint, PinyinType } from '@/types';
import { Trophy, Target, Zap, BookOpen, AlertTriangle, TrendingUp, Star, Clock, Award, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

type PinyinStatus = 'mastered' | 'learning' | 'not_started';

function getStatusColor(status: PinyinStatus): string {
  switch (status) {
    case 'mastered':
      return 'bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-300 shadow-green-200';
    case 'learning':
      return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white border-yellow-300 shadow-yellow-200';
    case 'not_started':
      return 'bg-gray-100 text-gray-400 border-gray-200';
  }
}

function getStatusBadge(status: PinyinStatus): { text: string; className: string } {
  switch (status) {
    case 'mastered':
      return { text: '✓ 已掌握', className: 'bg-green-100 text-green-700' };
    case 'learning':
      return { text: '⏳ 学习中', className: 'bg-yellow-100 text-yellow-700' };
    case 'not_started':
      return { text: '○ 未开始', className: 'bg-gray-100 text-gray-500' };
  }
}

export default function LearningReport() {
  const users = useUserStore((state) => state.users);
  const currentUserId = useUserStore((state) => state.currentUserId);
  const currentUser = users.find(u => u.id === currentUserId);
  const [activeTab, setActiveTab] = useState<PinyinType>('shengmu');
  const [reportData, setReportData] = useState<UserReportData | null>(null);
  const [todayStats, setTodayStats] = useState<DailyStat | null>(null);
  const [writingData, setWritingData] = useState<UserWritingData | null>(null);
  const [twisterData, setTwisterData] = useState<UserTwisterData | null>(null);

  useEffect(() => {
    if (currentUserId) {
      setReportData(getUserReportData(currentUserId));
      setTodayStats(getTodayStats(currentUserId));
      setWritingData(getUserWritingData(currentUserId));
      setTwisterData(getUserTwisterData(currentUserId));
    } else {
      setReportData(null);
      setTodayStats(null);
      setWritingData(null);
      setTwisterData(null);
    }
  }, [currentUserId]);

  const shengmuMastery = useMemo<PinyinMastery[]>(() => {
    if (!reportData) {
      return SHENGMU_LIST.map(item => ({
        pinyin: item.pinyin,
        type: 'shengmu',
        status: 'not_started',
        correctRate: 0,
      }));
    }
    return SHENGMU_LIST.map(item => {
      const record = reportData.masteryMap[item.pinyin];
      if (!record || record.total === 0) {
        return { pinyin: item.pinyin, type: 'shengmu', status: 'not_started', correctRate: 0 };
      }
      const rate = record.correct / record.total;
      return {
        pinyin: item.pinyin,
        type: 'shengmu',
        status: rate >= 0.8 ? 'mastered' : 'learning',
        correctRate: rate,
      };
    });
  }, [reportData]);

  const yunmuMastery = useMemo<PinyinMastery[]>(() => {
    if (!reportData) {
      return YUNMU_LIST.map(item => ({
        pinyin: item.pinyin,
        type: 'yunmu',
        status: 'not_started',
        correctRate: 0,
      }));
    }
    return YUNMU_LIST.map(item => {
      const record = reportData.masteryMap[item.pinyin];
      if (!record || record.total === 0) {
        return { pinyin: item.pinyin, type: 'yunmu', status: 'not_started', correctRate: 0 };
      }
      const rate = record.correct / record.total;
      return {
        pinyin: item.pinyin,
        type: 'yunmu',
        status: rate >= 0.8 ? 'mastered' : 'learning',
        correctRate: rate,
      };
    });
  }, [reportData]);

  const currentList = activeTab === 'shengmu' ? shengmuMastery : yunmuMastery;
  const currentPinyinList = activeTab === 'shengmu' ? SHENGMU_LIST : YUNMU_LIST;

  const overallStats = useMemo(() => {
    const total = SHENGMU_LIST.length + YUNMU_LIST.length;
    const allMastery = [...shengmuMastery, ...yunmuMastery];
    const mastered = allMastery.filter(m => m.status === 'mastered').length;
    const learning = allMastery.filter(m => m.status === 'learning').length;
    const notStarted = allMastery.filter(m => m.status === 'not_started').length;
    const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { total, mastered, learning, notStarted, percentage };
  }, [shengmuMastery, yunmuMastery]);

  const weakPoints = useMemo<WeakPoint[]>(() => {
    if (!reportData) return [];
    const result: WeakPoint[] = [];
    for (const [pinyin, errorRec] of Object.entries(reportData.errorRecords)) {
      const masteryRec = reportData.masteryMap[pinyin];
      result.push({
        pinyin,
        type: errorRec.type,
        errorCount: errorRec.count,
        totalCount: masteryRec?.total || 0,
        modules: errorRec.modules,
      });
    }
    result.sort((a, b) => b.errorCount - a.errorCount);
    return result.slice(0, 10);
  }, [reportData]);

  const shengmuStats = useMemo(() => {
    const total = SHENGMU_LIST.length;
    const mastered = shengmuMastery.filter(m => m.status === 'mastered').length;
    const learning = shengmuMastery.filter(m => m.status === 'learning').length;
    const notStarted = shengmuMastery.filter(m => m.status === 'not_started').length;
    return { total, mastered, learning, notStarted };
  }, [shengmuMastery]);

  const yunmuStats = useMemo(() => {
    const total = YUNMU_LIST.length;
    const mastered = yunmuMastery.filter(m => m.status === 'mastered').length;
    const learning = yunmuMastery.filter(m => m.status === 'learning').length;
    const notStarted = yunmuMastery.filter(m => m.status === 'not_started').length;
    return { total, mastered, learning, notStarted };
  }, [yunmuMastery]);

  const todayPracticeCount = todayStats?.practiceCount || 0;
  const todayCorrectCount = todayStats?.correctCount || 0;
  const todayAccuracy = todayPracticeCount > 0 ? Math.round((todayCorrectCount / todayPracticeCount) * 100) : 0;
  const todayMaxStreak = todayStats?.maxStreak || 0;

  const writingMasteredCount = writingData?.masteredPinyins.length || 0;
  const twisterCompletedCount = twisterData
    ? Object.values(twisterData.progress).filter(p => p.completed).length
    : 0;

  if (!currentUser) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          <div className="card-cute text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">请先选择孩子</h2>
            <p className="text-gray-500">选择一个孩子档案后即可查看学习报告</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        <div className="text-center mb-6 animate-pop">
          <span className="text-4xl mr-2">{currentUser.avatar}</span>
          <span className="text-2xl font-bold text-gray-700">{currentUser.name} 的学习报告</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">📊 学习报告</h1>
          <p className="text-gray-600">查看学习进度，发现薄弱环节，再接再厉！</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            className="card-cute bg-gradient-to-br from-orange-50 to-yellow-50 animate-pop"
            style={{ animationDelay: '0ms' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center shadow-lg">
                <Clock size={24} className="text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-bold">今日练习</div>
                <div className="text-xs text-gray-400">Today Practice</div>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-4xl font-bold text-orange-600">{todayPracticeCount}</span>
                <span className="text-gray-500 ml-1">次</span>
              </div>
              <div className="text-2xl">✏️</div>
            </div>
          </div>

          <div
            className="card-cute bg-gradient-to-br from-green-50 to-emerald-50 animate-pop"
            style={{ animationDelay: '80ms' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <Target size={24} className="text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-bold">今日正确率</div>
                <div className="text-xs text-gray-400">Accuracy</div>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-4xl font-bold text-green-600">{todayAccuracy}</span>
                <span className="text-gray-500 ml-1">%</span>
              </div>
              <div className="text-2xl">🎯</div>
            </div>
          </div>

          <div
            className="card-cute bg-gradient-to-br from-pink-50 to-rose-50 animate-pop"
            style={{ animationDelay: '160ms' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
                <Zap size={24} className="text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-bold">最长连对</div>
                <div className="text-xs text-gray-400">Max Streak</div>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-4xl font-bold text-pink-600">{todayMaxStreak}</span>
                <span className="text-gray-500 ml-1">次</span>
              </div>
              <div className="text-2xl">🔥</div>
            </div>
          </div>

          <div
            className="card-cute bg-gradient-to-br from-purple-50 to-violet-50 animate-pop"
            style={{ animationDelay: '240ms' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-bold">累计连续</div>
                <div className="text-xs text-gray-400">Days Streak</div>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-4xl font-bold text-purple-600">{reportData?.currentStreak || 0}</span>
                <span className="text-gray-500 ml-1">天</span>
              </div>
              <div className="text-2xl">🏆</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 card-cute animate-pop" style={{ animationDelay: '320ms' }}>
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={24} className="text-primary" />
              <h3 className="text-xl font-bold text-gray-700">掌握度总览</h3>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-600 flex items-center gap-2">
                  <Award size={18} className="text-primary" />
                  整体完成进度
                </span>
                <span className="text-2xl font-bold text-primary">{overallStats.percentage}%</span>
              </div>
              <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                  style={{ width: `${overallStats.percentage}%` }}
                >
                  {overallStats.percentage >= 15 && (
                    <span className="text-xs font-bold text-white drop-shadow">{overallStats.percentage}%</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>起点 0%</span>
                <span>目标 100%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-pink-600 flex items-center gap-1">
                    <span className="text-lg">🗣️</span>
                    声母
                  </span>
                  <span className="text-sm font-bold text-pink-500">
                    {shengmuStats.mastered}/{shengmuStats.total}
                  </span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-700"
                    style={{ width: `${(shengmuStats.mastered / shengmuStats.total) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-2 text-gray-500">
                  <span className="text-green-600">✓{shengmuStats.mastered}</span>
                  <span className="text-yellow-600">⏳{shengmuStats.learning}</span>
                  <span className="text-gray-400">○{shengmuStats.notStarted}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-600 flex items-center gap-1">
                    <span className="text-lg">🎵</span>
                    韵母
                  </span>
                  <span className="text-sm font-bold text-blue-500">
                    {yunmuStats.mastered}/{yunmuStats.total}
                  </span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-700"
                    style={{ width: `${(yunmuStats.mastered / yunmuStats.total) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-2 text-gray-500">
                  <span className="text-green-600">✓{yunmuStats.mastered}</span>
                  <span className="text-yellow-600">⏳{yunmuStats.learning}</span>
                  <span className="text-gray-400">○{yunmuStats.notStarted}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-xl bg-white shadow-sm">
                <div className="text-2xl mb-1">✅</div>
                <div className="text-2xl font-bold text-green-600">{overallStats.mastered}</div>
                <div className="text-xs text-gray-500">已掌握</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-white shadow-sm">
                <div className="text-2xl mb-1">📖</div>
                <div className="text-2xl font-bold text-yellow-600">{overallStats.learning}</div>
                <div className="text-xs text-gray-500">学习中</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-white shadow-sm">
                <div className="text-2xl mb-1">✏️</div>
                <div className="text-2xl font-bold text-purple-600">{writingMasteredCount}</div>
                <div className="text-xs text-gray-500">书写过关</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-white shadow-sm">
                <div className="text-2xl mb-1">🎭</div>
                <div className="text-2xl font-bold text-blue-600">{twisterCompletedCount}</div>
                <div className="text-xs text-gray-500">绕口令</div>
              </div>
            </div>
          </div>

          <div className="card-cute animate-pop bg-gradient-to-br from-red-50 to-orange-50" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={24} className="text-orange-500" />
              <h3 className="text-xl font-bold text-gray-700">薄弱点分析</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">以下是需要重点复习的拼音，按错误次数排序</p>

            {weakPoints.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🌟</div>
                <p className="text-gray-500 font-bold">太棒了！</p>
                <p className="text-gray-400 text-sm">暂无薄弱点，继续保持！</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {weakPoints.map((wp, idx) => {
                  const item = [...SHENGMU_LIST, ...YUNMU_LIST].find(i => i.pinyin === wp.pinyin);
                  const errorRate = wp.totalCount > 0 ? wp.errorCount / wp.totalCount : 0;
                  return (
                    <div
                      key={wp.pinyin}
                      className="p-3 rounded-xl bg-white shadow-sm border border-orange-100 hover:shadow-md hover:border-orange-200 transition-all animate-pop"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg ${
                            wp.type === 'shengmu' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {wp.pinyin}
                          </div>
                          <div>
                            <div className="font-bold text-gray-700 text-sm">
                              {item?.example || wp.pinyin}
                            </div>
                            <div className="text-xs text-gray-400">
                              {wp.type === 'shengmu' ? '声母' : '韵母'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-red-500 font-bold">
                            <XCircle size={14} />
                            <span>{wp.errorCount}</span>
                          </div>
                          <div className="text-xs text-gray-400">次错误</div>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                          style={{ width: `${Math.min(errorRate * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex gap-1 flex-wrap">
                          {wp.modules.map(m => (
                            <span
                              key={m}
                              className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-bold"
                            >
                              {m === 'chart' ? '📖表' : m === 'spelling' ? '✏️拼' : m === 'listening' ? '👂听' : m === 'drag' ? '🎯拖' : m === 'writing' ? '✍️写' : '🎭绕'}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-500">
                          共{wp.totalCount}次
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-400 to-emerald-500 shadow-md" />
            <span className="font-bold text-green-700 text-sm flex items-center gap-1">
              <CheckCircle size={14} /> 已掌握（正确率≥80%）
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-yellow-400 to-amber-500 shadow-md" />
            <span className="font-bold text-yellow-700 text-sm flex items-center gap-1">
              <TrendingUp size={14} /> 学习中（有练习记录）
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div className="w-6 h-6 rounded-md bg-gray-200 shadow-md" />
            <span className="font-bold text-gray-600 text-sm flex items-center gap-1">
              <BookOpen size={14} /> 未开始（暂无记录）
            </span>
          </div>
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
            🗣️ 声母 ({shengmuStats.mastered}/{shengmuStats.total})
          </button>
          <button
            onClick={() => setActiveTab('yunmu')}
            className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${
              activeTab === 'yunmu'
                ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 shadow hover:shadow-md hover:scale-105'
            }`}
          >
            🎵 韵母 ({yunmuStats.mastered}/{yunmuStats.total})
          </button>
        </div>

        <div className="card-cute mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Star size={24} className="text-primary" />
              <h3 className="text-xl font-bold text-gray-700">
                {activeTab === 'shengmu' ? '声母掌握详情' : '韵母掌握详情'}
              </h3>
            </div>
            <div className="text-sm text-gray-500 font-bold">
              共 {currentList.length} 个
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
            {currentList.map((item, index) => {
              const pinyinItem = currentPinyinList.find(p => p.pinyin === item.pinyin);
              const statusBadge = getStatusBadge(item.status);
              return (
                <div
                  key={item.pinyin}
                  className={`relative rounded-2xl p-3 sm:p-4 border-2 shadow-md transition-all hover:scale-105 hover:-translate-y-1 cursor-default animate-pop ${getStatusColor(item.status)}`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold mb-1">
                      {item.pinyin}
                    </div>
                    {item.status !== 'not_started' && (
                      <div className="text-xs font-bold drop-shadow">
                        {Math.round(item.correctRate * 100)}%
                      </div>
                    )}
                    {pinyinItem && item.status !== 'not_started' && (
                      <div className="text-[10px] mt-1 truncate drop-shadow opacity-90">
                        {pinyinItem.example}
                      </div>
                    )}
                  </div>
                  <div className={`absolute -top-2 -right-2 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md ${statusBadge.className}`}>
                    {statusBadge.text.split(' ')[0]}
                  </div>
                  {item.status === 'mastered' && (
                    <div className="absolute -top-1 -left-1 text-lg animate-pulse">⭐</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-cute bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
          <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Award size={24} className="text-purple-500" />
            🏆 学习成就
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl text-center transition-all ${
              overallStats.mastered >= 5
                ? 'bg-gradient-to-br from-yellow-100 to-amber-200 shadow-lg scale-105'
                : 'bg-gray-100 opacity-60'
            }`}>
              <div className="text-4xl mb-2">{overallStats.mastered >= 5 ? '🌟' : '⭐'}</div>
              <div className="font-bold text-gray-700">初学者</div>
              <div className="text-xs text-gray-500">掌握 5 个拼音</div>
              <div className="text-sm font-bold text-primary mt-1">
                {Math.min(overallStats.mastered, 5)}/5
              </div>
            </div>
            <div className={`p-4 rounded-2xl text-center transition-all ${
              overallStats.mastered >= 20
                ? 'bg-gradient-to-br from-blue-100 to-cyan-200 shadow-lg scale-105'
                : 'bg-gray-100 opacity-60'
            }`}>
              <div className="text-4xl mb-2">{overallStats.mastered >= 20 ? '💎' : '✨'}</div>
              <div className="font-bold text-gray-700">拼音达人</div>
              <div className="text-xs text-gray-500">掌握 20 个拼音</div>
              <div className="text-sm font-bold text-primary mt-1">
                {Math.min(overallStats.mastered, 20)}/20
              </div>
            </div>
            <div className={`p-4 rounded-2xl text-center transition-all ${
              overallStats.mastered >= 35
                ? 'bg-gradient-to-br from-purple-100 to-pink-200 shadow-lg scale-105'
                : 'bg-gray-100 opacity-60'
            }`}>
              <div className="text-4xl mb-2">{overallStats.mastered >= 35 ? '👑' : '🎖️'}</div>
              <div className="font-bold text-gray-700">拼音大师</div>
              <div className="text-xs text-gray-500">掌握 35 个拼音</div>
              <div className="text-sm font-bold text-primary mt-1">
                {Math.min(overallStats.mastered, 35)}/35
              </div>
            </div>
            <div className={`p-4 rounded-2xl text-center transition-all ${
              (reportData?.currentStreak || 0) >= 7
                ? 'bg-gradient-to-br from-green-100 to-emerald-200 shadow-lg scale-105'
                : 'bg-gray-100 opacity-60'
            }`}>
              <div className="text-4xl mb-2">{(reportData?.currentStreak || 0) >= 7 ? '🔥' : '💪'}</div>
              <div className="font-bold text-gray-700">坚持达人</div>
              <div className="text-xs text-gray-500">连续学习 7 天</div>
              <div className="text-sm font-bold text-primary mt-1">
                {Math.min(reportData?.currentStreak || 0, 7)}/7
              </div>
            </div>
          </div>

          {overallStats.percentage === 100 && (
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200 text-center animate-pop border-4 border-yellow-300">
              <div className="text-6xl mb-3">🎉🎊🏆🎊🎉</div>
              <h4 className="text-2xl font-bold text-primary mb-2">恭喜你！全部掌握！</h4>
              <p className="text-gray-700">你已经成为拼音小达人啦！继续复习巩固吧！</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            💡 提示：多练习，多复习，你一定会越来越棒的！加油！
          </p>
        </div>
      </div>
    </div>
  );
}
