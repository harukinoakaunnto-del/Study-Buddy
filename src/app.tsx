import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, Languages, MessageCircle, CheckSquare, Calendar, X, 
  Send, Plus, ChevronLeft, Search, Trash2, Timer as TimerIcon, 
  Play, Pause, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { getDefinition, translateWithHints, getAIChatResponse } from './services/gemini';

// --- Supabase関連のインポートを削除 ---

// --- Types ---
type View = 'home' | 'dictionary' | 'translator' | 'chat' | 'tasks' | 'countdown' | 'timer';

interface Task {
  id: string;
  text: string;
  color: string;
}

// --- Constants ---
const PASTEL_COLORS = [
  'bg-[#FFD1DC]', 'bg-[#B2E2F2]', 'bg-[#C1E1C1]', 
  'bg-[#FDFD96]', 'bg-[#E0BBE4]', 'bg-[#FFCC99]',
];

// --- Components ---

const Header = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <div className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md sticky top-0 z-10">
    <button onClick={onBack} className="puffy-button p-3 rounded-full bg-white text-gray-600">
      <ChevronLeft size={24} />
    </button>
    <h1 className="text-xl font-bold text-gray-700">{title}</h1>
    <div className="w-12" />
  </div>
);

const HomeIcon = ({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) => (
  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick} className="flex flex-col items-center gap-4">
    <div className={`${color} w-28 h-28 rounded-full flex items-center justify-center text-white puffy-shadow`}>{icon}</div>
    <span className="font-bold text-gray-600 text-lg">{label}</span>
  </motion.button>
);

const HomeView = ({ onNavigate }: { onNavigate: (view: View) => void }) => (
  <div className="h-full flex flex-col items-center justify-center p-8 relative">
    <div className="mb-20 text-center">
      <h1 className="text-4xl font-bold text-gray-700 mb-3">StudyBuddy</h1>
      <p className="text-gray-400 text-lg">今日も一歩、合格へ。</p>
    </div>
    <div className="max-w-2xl w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-20 justify-items-center">
        <HomeIcon icon={<Book size={40} />} label="辞書" color="bg-[#FFD1DC]" onClick={() => onNavigate('dictionary')} />
        <HomeIcon icon={<Languages size={40} />} label="翻訳" color="bg-[#B2E2F2]" onClick={() => onNavigate('translator')} />
        <HomeIcon icon={<MessageCircle size={40} />} label="AI chat" color="bg-[#C1E1C1]" onClick={() => onNavigate('chat')} />
        <HomeIcon icon={<CheckSquare size={40} />} label="タスク" color="bg-[#FDFD96]" onClick={() => onNavigate('tasks')} />
        <HomeIcon icon={<TimerIcon size={40} />} label="タイマー" color="bg-[#FFCC99]" onClick={() => onNavigate('timer')} />
        <HomeIcon icon={<Calendar size={40} />} label="試験日" color="bg-[#E0BBE4]" onClick={() => onNavigate('countdown')} />
      </div>
    </div>
  </div>
);

// (DictionaryView, TranslatorView, ChatView, TasksView, CountdownView, TimerView は元のロジックを維持)
const DictionaryView = ({ onBack, onSearch, isLoading, result }: any) => {
  const [localWord, setLocalWord] = useState('');
  return (
    <div className="h-full flex flex-col bg-[#FDFCF0]">
      <Header title="辞書" onBack={onBack} />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex gap-4 mb-8">
            <input type="text" value={localWord} onChange={(e) => setLocalWord(e.target.value)} placeholder="単語を入力..." className="flex-1 puffy-card px-8 py-5 outline-none text-gray-700 text-lg" onKeyDown={(e) => e.key === 'Enter' && onSearch(localWord)} />
            <button onClick={() => onSearch(localWord)} className="puffy-button bg-[#FFD1DC] text-white p-5 rounded-2xl"><Search size={28} /></button>
          </div>
          {isLoading ? (<div className="flex justify-center p-12"><div className="animate-bounce text-pink-300">考え中...</div></div>) : result && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="puffy-card p-10 bg-white"><div className="markdown-body"><Markdown>{result}</Markdown></div></motion.div>)}
        </div>
      </div>
    </div>
  );
};

const TranslatorView = ({ onBack, onTranslate, isLoading, result }: any) => {
  const [localText, setLocalText] = useState('');
  return (
    <div className="h-full flex flex-col bg-[#FDFCF0]">
      <Header title="翻訳" onBack={onBack} />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
          <textarea value={localText} onChange={(e) => setLocalText(e.target.value)} placeholder="英文を貼り付けてください..." className="w-full h-60 puffy-card p-8 outline-none text-gray-700 mb-8 resize-none text-lg" />
          <button onClick={() => onTranslate(localText)} disabled={isLoading} className="w-full puffy-button bg-[#B2E2F2] text-white py-5 rounded-2xl font-bold mb-10 text-xl">{isLoading ? '翻訳中...' : 'ヒント付きで翻訳'}</button>
          {result && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="puffy-card p-10 bg-white"><div className="markdown-body"><Markdown>{result}</Markdown></div></motion.div>)}
        </div>
      </div>
    </div>
  );
};

const ChatView = ({ onBack, onSend, messages, isLoading }: any) => {
  const [localInput, setLocalInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  const handleSend = () => { if (!localInput.trim() || isLoading) return; onSend(localInput); setLocalInput(''); };
  return (
    <div className="h-full flex flex-col bg-[#FDFCF0]">
      <Header title="AI指導医" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {messages.length === 0 && (<div className="text-center text-gray-400 mt-12 text-lg">「今日は何を勉強した？」など、何でも聞いてください。</div>)}
          {messages.map((msg: any, i: number) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-6 rounded-3xl puffy-shadow ${msg.role === 'user' ? 'bg-[#C1E1C1] text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none'}`}><div className="markdown-body"><Markdown>{msg.content}</Markdown></div></div>
            </div>
          ))}
          {isLoading && (<div className="flex justify-start"><div className="bg-white p-6 rounded-3xl puffy-shadow animate-pulse text-gray-400">指導医が回答中...</div></div>)}
          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="p-8 bg-white/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto w-full flex gap-4">
          <input type="text" value={localInput} onChange={(e) => setLocalInput(e.target.value)} placeholder="メッセージを入力..." className="flex-1 puffy-card px-8 py-5 outline-none text-gray-700 text-lg" onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
          <button onClick={handleSend} className="puffy-button bg-[#C1E1C1] text-white p-5 rounded-2xl"><Send size={28} /></button>
        </div>
      </div>
    </div>
  );
};

const TasksView = ({ onBack, onAdd, onRemove, tasks }: any) => {
  const [localInput, setLocalInput] = useState('');
  const handleAdd = () => { if (!localInput.trim()) return; onAdd(localInput); setLocalInput(''); };
  return (
    <div className="h-full flex flex-col bg-[#FDFCF0]">
      <Header title="タスク" onBack={onBack} />
      <div className="p-6">
        <div className="flex gap-3 mb-8">
          <input type="text" value={localInput} onChange={(e) => setLocalInput(e.target.value)} placeholder="新しいタスク..." className="flex-1 puffy-card px-6 py-4 outline-none text-gray-700" onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
          <button onClick={handleAdd} className="puffy-button bg-[#FDFD96] text-gray-600 p-4 rounded-2xl"><Plus size={24} /></button>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <AnimatePresence>{tasks.map((task: any) => (<motion.button key={task.id} initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, opacity: 0 }} whileHover={{ scale: 1.1 }} onClick={() => onRemove(task.id)} className={`${task.color} w-32 h-32 rounded-full p-4 flex items-center justify-center text-center text-gray-700 font-bold puffy-shadow text-sm break-all`}>{task.text}</motion.button>))}</AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const CountdownView = ({ onBack, onSaveDate, initialDate, daysLeft }: any) => {
  const [localDate, setLocalDate] = useState(initialDate);
  return (
    <div className="h-full flex flex-col bg-[#FDFCF0]">
      <Header title="試験日カウントダウン" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="mb-12 w-full max-w-xs">
          <label className="block text-sm font-bold text-gray-500 mb-2 ml-4">試験日を設定</label>
          <input type="date" value={localDate} onChange={(e) => setLocalDate(e.target.value)} onBlur={() => onSaveDate(localDate)} className="w-full puffy-card px-6 py-4 outline-none text-gray-700" />
        </div>
        {daysLeft !== null && (
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="128" cy="128" r="110" fill="none" stroke="#E0E0E0" strokeWidth="20" />
              <motion.circle cx="128" cy="128" r="110" fill="none" stroke="#E0BBE4" strokeWidth="20" strokeDasharray="691" initial={{ strokeDashoffset: 691 }} animate={{ strokeDashoffset: Math.max(0, 691 - (daysLeft / 365) * 691) }} transition={{ duration: 1 }} strokeLinecap="round" />
            </svg>
            <div className="text-center z-10"><div className="text-5xl font-black text-gray-700">{daysLeft}</div><div className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Days Left</div></div>
          </div>
        )}
      </div>
    </div>
  );
};

const TimerView = ({ onBack }: any) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const timerRef = useRef<any>(null);

  const playAlarm = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playBeep = (time: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(880, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.1, time + 0.01);
      gain.gain.linearRampToValueAtTime(0, time + 0.2);
      osc.start(time); osc.stop(time + 0.2);
    };
    [0, 0.3, 0.6].forEach(t => playBeep(audioCtx.currentTime + t));
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false); playAlarm();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const progress = (timeLeft / totalTime) * 691;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="h-full flex flex-col bg-[#FDFCF0]">
      <Header title="タイマー" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="flex gap-4 mb-12">
          {[25, 5].map(m => (
            <button key={m} onClick={() => { setIsActive(false); setTotalTime(m * 60); setTimeLeft(m * 60); }} className={`px-6 py-2 rounded-full font-bold transition-all ${totalTime === m * 60 ? 'bg-[#FFD1DC] text-white puffy-shadow' : 'bg-white text-gray-400'}`}>
              {m === 25 ? '集中 (25分)' : '休憩 (5分)'}
            </button>
          ))}
        </div>
        <div className="relative w-80 h-80 flex items-center justify-center mb-12">
          <div className="absolute w-64 h-64 bg-white rounded-full puffy-shadow" />
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="160" cy="160" r="110" fill="none" stroke="#E0E0E0" strokeWidth="10" className="opacity-30" />
            <motion.circle cx="160" cy="160" r="110" fill="none" stroke={totalTime === 25 * 60 ? "#FFD1DC" : "#B2E2F2"} strokeWidth="10" strokeDasharray="691" animate={{ strokeDashoffset: 691 - progress }} transition={{ duration: 1, ease: "linear" }} strokeLinecap="round" />
          </svg>
          <div className="text-5xl font-bold text-gray-700 z-10">{formatTime(timeLeft)}</div>
        </div>
        <div className="flex gap-8">
          <button onClick={() => setIsActive(!isActive)} className={`w-20 h-20 rounded-full flex items-center justify-center text-white puffy-button ${isActive ? 'bg-[#FFCC99]' : 'bg-[#C1E1C1]'}`}>{isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}</button>
          <button onClick={() => { setIsActive(false); setTimeLeft(totalTime); }} className="w-20 h-20 rounded-full flex items-center justify-center bg-white text-gray-400 puffy-button"><RotateCcw size={32} /></button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  // ステート管理 (LocalStorageを利用してタスクなどを保存)
  const [dictResult, setDictResult] = useState('');
  const [isDictLoading, setIsDictLoading] = useState(false);
  const [transResult, setTransResult] = useState('');
  const [isTransLoading, setIsTransLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [examDate, setExamDate] = useState(localStorage.getItem('examDate') || '');

  useEffect(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('examDate', examDate); }, [examDate]);

  // ハンドラー
  const handleSearchDict = async (word: string) => { if(!word.trim()) return; setIsDictLoading(true); try { const res = await getDefinition(word); setDictResult(res || ''); } catch(e) { setDictResult('Error'); } finally { setIsDictLoading(false); } };
  const handleTranslate = async (text: string) => { if(!text.trim()) return; setIsTransLoading(true); try { const res = await translateWithHints(text); setTransResult(res || ''); } catch(e) { setTransResult('Error'); } finally { setIsTransLoading(false); } };
  const handleSendChat = async (text: string) => { if(!text.trim() || isChatLoading) return; const newMsg = [...chatMessages, { role: 'user', content: text }]; setChatMessages(newMsg); setIsChatLoading(true); try { const res = await getAIChatResponse(newMsg); setChatMessages([...newMsg, { role: 'ai', content: res || '' }]); } catch(e) { setChatMessages([...newMsg, { role: 'ai', content: 'エラーが発生しました。' }]); } finally { setIsChatLoading(false); } };
  const addTask = (text: string) => setTasks([...tasks, { id: Date.now().toString(), text, color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)] }]);
  const getDaysLeft = () => { if (!examDate) return null; const diff = new Date(examDate).getTime() - new Date().setHours(0,0,0,0); return Math.ceil(diff / (1000 * 60 * 60 * 24)); };

  // 常にメイン画面を表示（セッションチェックなし）
  return (
    <div className="h-screen w-full relative overflow-hidden font-sans bg-[#FDFCF0]">
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
            <HomeView onNavigate={setCurrentView} />
          </motion.div>
        )}
        {currentView === 'dictionary' && (
          <motion.div key="dict" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="h-full absolute inset-0 z-20">
            <DictionaryView onBack={() => setCurrentView('home')} onSearch={handleSearchDict} isLoading={isDictLoading} result={dictResult} />
          </motion.div>
        )}
        {currentView === 'translator' && (
          <motion.div key="trans" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="h-full absolute inset-0 z-20">
            <TranslatorView onBack={() => setCurrentView('home')} onTranslate={handleTranslate} isLoading={isTransLoading} result={transResult} />
          </motion.div>
        )}
        {currentView === 'chat' && (
          <motion.div key="chat" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="h-full absolute inset-0 z-20">
            <ChatView onBack={() => setCurrentView('home')} onSend={handleSendChat} messages={chatMessages} isLoading={isChatLoading} />
          </motion.div>
        )}
        {currentView === 'tasks' && (
          <motion.div key="tasks" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="h-full absolute inset-0 z-20">
            <TasksView onBack={() => setCurrentView('home')} onAdd={addTask} onRemove={(id: any) => setTasks(tasks.filter(t => t.id !== id))} tasks={tasks} />
          </motion.div>
        )}
        {currentView === 'countdown' && (
          <motion.div key="count" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="h-full absolute inset-0 z-20">
            <CountdownView onBack={() => setCurrentView('home')} onSaveDate={setExamDate} initialDate={examDate} daysLeft={getDaysLeft()} />
          </motion.div>
        )}
        {currentView === 'timer' && (
          <motion.div key="timer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="h-full absolute inset-0 z-20">
            <TimerView onBack={() => setCurrentView('home')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
