"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const [mode, setMode] = useState("login"); // login | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    setError("");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // ここでページはGoogleのログイン画面に遷移するので、以降の処理は不要
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name || email.split("@")[0] } },
      });
      setLoading(false);
      if (error) return setError(error.message);
      setError("確認メールを送信しました。メール内のリンクを開いてから、ログインしてください。");
      setMode("login");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    window.location.href = "/dashboard";
  }

  return (
    <div className="h-screen w-full flex items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black text-xl mb-4 mx-auto">
          み
        </div>
        <h1 className="text-lg font-bold text-center mb-6">
          {mode === "login" ? "ログイン" : "アカウント作成"}
        </h1>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-bold mb-4 hover:bg-gray-50"
        >
          <GoogleIcon />
          Googleでログイン
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400">または</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="表示名"
              className="w-full bg-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="w-full bg-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード(6文字以上)"
            className="w-full bg-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none"
          />

          {error && <p className="text-xs text-red-500 leading-relaxed">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 text-white rounded-lg py-2.5 text-sm font-bold flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === "login" ? "ログイン" : "登録する"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-center text-xs text-gray-500 mt-4 hover:text-gray-700"
        >
          {mode === "login" ? "アカウントがない方はこちら" : "すでにアカウントがある方はこちら"}
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6 29.5 4 24 4c-7.6 0-14.1 4.3-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-1.8 14.1-5l-6.5-5.5C29.5 35.4 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.8 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2.1 3.9-3.9 5.2h.1l6.5 5.5C37.5 39.3 44 34 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}
