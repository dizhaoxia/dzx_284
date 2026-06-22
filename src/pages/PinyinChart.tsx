import { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import PinyinCard from '@/components/PinyinCard';
import NavBar from '@/components/NavBar';
import { SHENGMU_LIST, YUNMU_LIST } from '@/utils/pinyinData';
import type { PinyinType } from '@/types';

export default function PinyinChart() {
  const users = useUserStore((state) => state.users);
  const currentUserId = useUserStore((state) => state.currentUserId);
  const currentUser = users.find(u => u.id === currentUserId);
  const [activeTab, setActiveTab] = useState<PinyinType>('shengmu');

  const list = activeTab === 'shengmu' ? SHENGMU_LIST : YUNMU_LIST;

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        {currentUser && (
          <div className="text-center mb-6">
            <span className="text-3xl mr-2">{currentUser.avatar}</span>
            <span className="text-xl font-bold text-gray-700">{currentUser.name} 的拼音表</span>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">📖 声母韵母表</h1>
          <p className="text-gray-600">点击拼音卡片听发音，学习正确口型</p>
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
            🗣️ 声母 (23个)
          </button>
          <button
            onClick={() => setActiveTab('yunmu')}
            className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${
              activeTab === 'yunmu'
                ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 shadow hover:shadow-md hover:scale-105'
            }`}
          >
            🎵 韵母 (24个)
          </button>
        </div>

        <div className="card-cute">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6 justify-items-center">
            {list.map((item, index) => (
              <div
                key={item.pinyin}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-pop"
              >
                <PinyinCard item={item} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 card-cute bg-gradient-to-r from-yellow-50 to-orange-50">
          <h3 className="text-xl font-bold text-gray-700 mb-4">💡 小提示</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• 点击任意拼音卡片，即可听到标准发音</li>
            <li>• 发音时注意观察口型提示，模仿正确的发音方式</li>
            <li>• 声母是音节开头的辅音，韵母是音节中声母后面的部分</li>
            <li>• 多听多读，慢慢就能掌握啦！</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
