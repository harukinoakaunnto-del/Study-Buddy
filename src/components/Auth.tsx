import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
    } else {
      alert('登録成功！そのままログインできます。');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900">
      <form className="p-8 bg-white rounded-xl shadow-lg w-80 border border-slate-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-700">StudyBuddy</h2>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="メールアドレス"
            className="w-full p-2 border rounded bg-white"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="パスワード"
            className="w-full p-2 border rounded bg-white"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            onClick={handleLogin} 
            disabled={loading} 
            className="w-full bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 transition-colors"
          >
            {loading ? '読み込み中...' : 'ログイン'}
          </button>
          <button 
            onClick={handleSignUp} 
            disabled={loading} 
            className="w-full bg-slate-100 text-slate-700 p-2 rounded font-semibold hover:bg-slate-200 transition-colors"
          >
            新規登録
          </button>
        </div>
      </form>
    </div>
  );
};