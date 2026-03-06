import { useState } from 'react';
import Header           from './components/Header';
import DangerBanner     from './components/DangerBanner';
import LanguageSelector from './components/LanguageSelector';
import SpeechCard       from './components/SpeechCard';
import HistoryCard      from './components/HistoryCard';

export default function App() {
  const [targetLang, setTargetLang] = useState('vi');
  const [isDanger, setIsDanger]     = useState(false);
  const [history, setHistory]       = useState([]);

  const handleNewHistory = (item) => {
    const newItem = {
      ...item,
      id:   Date.now(),
      time: new Date().toLocaleTimeString('ko-KR'),
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  return (
    <div className="container">
      <Header />
      <DangerBanner visible={isDanger} />
      <LanguageSelector value={targetLang} onChange={setTargetLang} />
      <SpeechCard
        targetLang={targetLang}
        onDangerDetected={setIsDanger}
        onNewHistory={handleNewHistory}
      />
      <HistoryCard history={history} />
    </div>
  );
}
