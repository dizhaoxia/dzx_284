import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, PenTool, Headphones, MousePointerClick, ChevronDown, Plus, UserRound } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import UserAvatar from './UserAvatar';

const navItems = [
  { path: '/chart', label: '拼音表', icon: BookOpen },
  { path: '/spelling', label: '拼读练习', icon: PenTool },
  { path: '/listening', label: '听音选字', icon: Headphones },
  { path: '/drag', label: '拼写练习', icon: MousePointerClick },
];

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { users, currentUserId, setCurrentUser } = useUserStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUser = users.find(u => u.id === currentUserId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (userId: string) => {
    setCurrentUser(userId);
    setShowUserMenu(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-primary hover:scale-105 transition-transform"
          >
            <span className="text-3xl">🎯</span>
            <span>拼音乐园</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-primary'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="relative" ref={menuRef}>
            {currentUser ? (
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 transition-all shadow-md"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xl">
                  {currentUser.avatar}
                </div>
                <span className="font-bold text-gray-700 hidden sm:inline">{currentUser.name}</span>
                <ChevronDown size={18} className={`text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                onClick={() => navigate('/')}
              >
                <UserRound size={20} />
                <span>选择孩子</span>
              </button>
            )}

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 card-cute !p-4 animate-pop">
                <div className="text-sm font-bold text-gray-500 mb-3">选择学习者</div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                        user.id === currentUserId
                          ? 'bg-orange-100 ring-2 ring-primary'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleUserSelect(user.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-2xl">
                        {user.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-gray-700">{user.name}</div>
                        {user.id === currentUserId && (
                          <div className="text-xs text-primary">当前用户</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-bold hover:border-primary hover:text-primary transition-all"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/');
                  }}
                >
                  <Plus size={20} />
                  <span>添加孩子</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="md:hidden flex items-center gap-1 mt-3 overflow-x-auto pb-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
