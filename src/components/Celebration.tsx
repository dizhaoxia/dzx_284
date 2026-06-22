import { useEffect, useState } from 'react';

interface CelebrationProps {
  trigger: boolean;
  items?: string[];
  count?: number;
}

interface FloatingItem {
  id: number;
  emoji: string;
  left: number;
  delay: number;
}

export default function Celebration({ trigger, items = ['⭐', '🎉', '✨', '🌟', '💫'], count = 12 }: CelebrationProps) {
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    if (trigger) {
      const newItems: FloatingItem[] = [];
      for (let i = 0; i < count; i++) {
        newItems.push({
          id: Date.now() + i,
          emoji: items[Math.floor(Math.random() * items.length)],
          left: 10 + Math.random() * 80,
          delay: Math.random() * 0.3,
        });
      }
      setFloatingItems(newItems);

      const timer = setTimeout(() => {
        setFloatingItems([]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trigger, items, count]);

  if (floatingItems.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {floatingItems.map((item) => (
        <div
          key={item.id}
          className="celebration-item"
          style={{
            left: `${item.left}%`,
            bottom: '20%',
            animationDelay: `${item.delay}s`,
            fontSize: `${2 + Math.random() * 2}rem`,
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
}
