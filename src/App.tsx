import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import HomePage from '@/pages/HomePage';
import PinyinChart from '@/pages/PinyinChart';
import SpellingPractice from '@/pages/SpellingPractice';
import ListeningQuiz from '@/pages/ListeningQuiz';
import DragSpelling from '@/pages/DragSpelling';

export default function App() {
  const loadUsers = useUserStore((state) => state.loadUsers);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chart" element={<PinyinChart />} />
        <Route path="/spelling" element={<SpellingPractice />} />
        <Route path="/listening" element={<ListeningQuiz />} />
        <Route path="/drag" element={<DragSpelling />} />
      </Routes>
    </Router>
  );
}
