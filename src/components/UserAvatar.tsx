import type { UserProfile } from '@/types';

interface UserAvatarProps {
  user: UserProfile;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-xl',
  md: 'w-16 h-16 text-3xl',
  lg: 'w-24 h-24 text-5xl',
};

export default function UserAvatar({ user, isSelected, onClick, size = 'md', showName = true }: UserAvatarProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 ${
        onClick ? 'hover:scale-110' : ''
      }`}
      onClick={onClick}
    >
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 ${
          isSelected
            ? 'ring-4 ring-primary bg-gradient-to-br from-orange-100 to-yellow-100 shadow-lg scale-110'
            : 'bg-gradient-to-br from-blue-50 to-purple-50 shadow-md'
        }`}
      >
        <span className="select-none">{user.avatar}</span>
      </div>
      {showName && (
        <span
          className={`font-bold text-center ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'
          } ${isSelected ? 'text-primary' : 'text-gray-600'}`}
        >
          {user.name}
        </span>
      )}
    </div>
  );
}
