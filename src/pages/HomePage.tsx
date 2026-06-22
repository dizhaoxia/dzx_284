import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, BookOpen, PenTool, Headphones, MousePointerClick } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import UserAvatar from '@/components/UserAvatar';
import Modal from '@/components/Modal';
import { getAvatarOptions, getRandomAvatar } from '@/utils/pinyinData';

const moduleCards = [
  { path: '/chart', label: '拼音表', icon: BookOpen, color: 'from-pink-400 to-rose-500', desc: '认识声母和韵母' },
  { path: '/spelling', label: '拼读练习', icon: PenTool, color: 'from-blue-400 to-cyan-500', desc: '组合拼音学习' },
  { path: '/listening', label: '听音选字', icon: Headphones, color: 'from-green-400 to-emerald-500', desc: '听发音选拼音' },
  { path: '/drag', label: '拼写练习', icon: MousePointerClick, color: 'from-purple-400 to-violet-500', desc: '拖拽组合拼音' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { users, currentUserId, setCurrentUser, addUser, removeUser, loadUsers } = useUserStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(getRandomAvatar());
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSelectUser = (userId: string) => {
    setCurrentUser(userId);
  };

  const handleStartLearning = (path: string) => {
    if (!currentUserId && users.length > 0) {
      setCurrentUser(users[0].id);
    }
    navigate(path);
  };

  const handleAddUser = () => {
    if (!newName.trim()) {
      setError('请输入孩子昵称');
      return;
    }
    if (newName.trim().length > 10) {
      setError('昵称不能超过10个字符');
      return;
    }
    const user = addUser(newName.trim(), selectedAvatar);
    setCurrentUser(user.id);
    setShowAddModal(false);
    setNewName('');
    setSelectedAvatar(getRandomAvatar());
    setError('');
  };

  const openAddModal = () => {
    setNewName('');
    setSelectedAvatar(getRandomAvatar());
    setError('');
    setShowAddModal(true);
  };

  const currentUser = users.find(u => u.id === currentUserId);

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-6xl font-bold text-primary mb-4 animate-pop">
            🎯 拼音乐园
          </h1>
          <p className="text-xl text-gray-600">快乐学习，轻松掌握拼音！</p>
        </div>

        <div className="card-cute mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-700">👶 我的宝贝</h2>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Plus size={20} />
              <span>添加孩子</span>
            </button>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👧👦</div>
              <p className="text-gray-500 mb-6">还没有添加孩子档案，快来创建吧！</p>
              <button
                onClick={openAddModal}
                className="btn-cute bg-gradient-to-r from-primary to-orange-400 text-xl px-8 py-4"
              >
                + 创建第一个档案
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-center">
              {users.map((user) => (
                <div key={user.id} className="relative group">
                  <UserAvatar
                    user={user}
                    isSelected={user.id === currentUserId}
                    onClick={() => handleSelectUser(user.id)}
                    size="lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`确定要删除 ${user.name} 的档案吗？`)) {
                        removeUser(user.id);
                      }
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {currentUser && (
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-yellow-50 text-center">
              <span className="text-2xl mr-2">{currentUser.avatar}</span>
              <span className="font-bold text-primary text-lg">{currentUser.name}</span>
              <span className="text-gray-600 ml-2">准备好开始学习啦！</span>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-700 mb-6">📚 选择学习模块</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {moduleCards.map(({ path, label, icon: Icon, color, desc }) => (
              <button
                key={path}
                onClick={() => handleStartLearning(path)}
                className={`card-cute !p-0 overflow-hidden group hover:-translate-y-2 ${
                  !currentUser && users.length > 0 ? 'opacity-60' : ''
                }`}
              >
                <div className={`bg-gradient-to-br ${color} p-6 text-white text-center`}>
                  <Icon size={48} className="mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold">{label}</h3>
                </div>
                <div className="p-4 text-center">
                  <p className="text-gray-600">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="添加孩子">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">宝贝昵称</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError('');
              }}
              placeholder="请输入昵称"
              maxLength={10}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-lg transition-colors"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">选择头像</label>
            <div className="grid grid-cols-8 gap-2">
              {getAvatarOptions().map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                    selectedAvatar === avatar
                      ? 'bg-primary text-white scale-110 shadow-lg ring-2 ring-yellow-400'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all"
            >
              取消
            </button>
            <button
              onClick={handleAddUser}
              className="flex-1 py-3 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              创建档案
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
