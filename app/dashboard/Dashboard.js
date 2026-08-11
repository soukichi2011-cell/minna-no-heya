"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabaseClient";
import {
  MessageCircle, Users, Rows3, Send, Plus, Lock, Trash2, X,
  UserPlus, ChevronLeft, Hash, Mic, LogOut, Loader2,
} from "lucide-react";

const supabase = createClient();

function Avatar({ user, px = 36 }) {
  if (!user) return <div style={{ width: px, height: px }} className="rounded-full bg-gray-200 shrink-0" />;
  return (
    <div
      className={`relative shrink-0 rounded-full ${user.color || "bg-indigo-500"} flex items-center justify-center text-white font-bold`}
      style={{ width: px, height: px, fontSize: px * 0.42 }}
    >
      {user.initial}
    </div>
  );
}

function RailIcon({ active, onClick, tooltip, children, colorClass = "bg-gray-400" }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="relative flex items-center justify-center">
      <span className={`absolute -left-3 bg-indigo-600 rounded-r-full transition-all duration-150 ${active ? "h-9 w-1.5" : hover ? "h-5 w-1.5" : "h-2 w-1.5 opacity-0"}`} />
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        title={tooltip}
        className={`relative w-12 h-12 flex items-center justify-center text-white font-bold transition-all duration-150 ${colorClass} ${active ? "rounded-2xl" : "rounded-full hover:rounded-2xl"}`}
      >
        {children}
      </button>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Bubble({ mine, text, time }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${mine ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"}`}>
        <p className="whitespace-pre-wrap break-words">{text}</p>
        <p className={`text-[10px] mt-1 ${mine ? "text-indigo-200" : "text-gray-400"}`}>{time}</p>
      </div>
    </div>
  );
}

function Composer({ placeholder, value, setValue, onSend, disabled, disabledNote }) {
  return (
    <div className="p-3 border-t border-gray-200 bg-white">
      {disabled ? (
        <p className="text-center text-xs text-gray-400 py-2">{disabledNote}</p>
      ) : (
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) onSend(); }}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
          />
          <button onClick={() => value.trim() && onSend()} className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0">
            <Send size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

const fmt = (ts) => new Date(ts).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });

export default function Dashboard({ me }) {
  const [tab, setTab] = useState("dm");
  const [profiles, setProfiles] = useState([]);
  const [friendIds, setFriendIds] = useState([]);
  const [showFriends, setShowFriends] = useState(false);

  const findUser = useCallback((id) => (id === me.id ? me : profiles.find((p) => p.id === id) || { name: "不明", initial: "?", color: "bg-gray-400" }), [profiles, me]);

  // 全プロフィール + フレンド関係の読み込み
  useEffect(() => {
    (async () => {
      const { data: allProfiles } = await supabase.from("profiles").select("*");
      setProfiles((allProfiles || []).filter((p) => p.id !== me.id));
      const { data: friendships } = await supabase.from("friendships").select("friend_id").eq("user_id", me.id);
      setFriendIds((friendships || []).map((f) => f.friend_id));
    })();
  }, [me.id]);

  async function addFriend(id) {
    await supabase.from("friendships").insert({ user_id: me.id, friend_id: id });
    setFriendIds((prev) => [...prev, id]);
  }

  const friends = friendIds.map((id) => findUser(id));
  const candidates = profiles.filter((p) => !friendIds.includes(p.id));
  const boardUnlocked = friends.length > 0;

  return (
    <div className="h-screen w-full bg-white text-gray-900 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-black text-white">み</div>
          <span className="font-bold">みんなの部屋</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFriends(true)} className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full">
            <UserPlus size={14} /> フレンド管理
          </button>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
            title="ログアウト"
          >
            <LogOut size={15} />
          </button>
          <Avatar user={me} px={32} />
        </div>
      </header>

      <nav className="flex border-b border-gray-200 shrink-0">
        {[
          { id: "dm", label: "個人メッセ", icon: MessageCircle },
          { id: "group", label: "グループ", icon: Users },
          { id: "board", label: "掲示板", icon: Rows3 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border-b-2 ${
              tab === id ? (id === "board" ? "border-amber-500 text-amber-600" : "border-indigo-500 text-indigo-600") : "border-transparent text-gray-400"
            }`}
          >
            <Icon size={16} />{label}
            {id === "board" && !boardUnlocked && <Lock size={12} />}
          </button>
        ))}
      </nav>

      <div className="flex-1 min-h-0">
        {tab === "dm" && <DmView me={me} friends={friends} />}
        {tab === "group" && <GroupView me={me} friends={friends} findUser={findUser} />}
        {tab === "board" && <BoardView me={me} unlocked={boardUnlocked} findUser={findUser} />}
      </div>

      {showFriends && (
        <Modal title="フレンド管理" onClose={() => setShowFriends(false)}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-2 font-bold">フレンド ({friends.length})</p>
              {friends.length === 0 && <p className="text-sm text-gray-400">まだいません</p>}
              <div className="space-y-2">
                {friends.map((f) => (
                  <div key={f.id} className="flex items-center gap-3">
                    <Avatar user={f} px={30} /><span className="text-sm">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2 font-bold">フレンド候補</p>
              {candidates.length === 0 && <p className="text-sm text-gray-400">候補はいません。友達に新規登録してもらうとここに出てきます。</p>}
              <div className="space-y-2">
                {candidates.map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><Avatar user={c} px={30} /><span className="text-sm">{c.name}</span></div>
                    <button onClick={() => addFriend(c.id)} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-full font-bold">追加</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- DM ---------------- */

function DmView({ me, friends }) {
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const friend = friends.find((f) => f.id === activeFriend);

  useEffect(() => {
    if (!activeFriend) return;
    let active = true;

    (async () => {
      const { data } = await supabase
        .from("dm_messages")
        .select("*")
        .or(`and(from_id.eq.${me.id},to_id.eq.${activeFriend}),and(from_id.eq.${activeFriend},to_id.eq.${me.id})`)
        .order("created_at", { ascending: true });
      if (active) setMessages(data || []);
    })();

    // リアルタイム購読:相手からの新着メッセージを即座に反映
    const channel = supabase
      .channel(`dm-${[me.id, activeFriend].sort().join("-")}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dm_messages" }, (payload) => {
        const m = payload.new;
        const isThisConversation =
          (m.from_id === me.id && m.to_id === activeFriend) || (m.from_id === activeFriend && m.to_id === me.id);
        if (isThisConversation) setMessages((prev) => [...prev, m]);
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [activeFriend, me.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ block: "end" }); }, [messages]);

  async function sendDm() {
    const body = text;
    setText("");
    await supabase.from("dm_messages").insert({ from_id: me.id, to_id: activeFriend, text: body });
    // 自分の画面はリアルタイム通知を待たずに即表示
    setMessages((prev) => [...prev, { from_id: me.id, to_id: activeFriend, text: body, created_at: new Date().toISOString() }]);
  }

  if (friends.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6">
        <UserPlus size={28} className="text-gray-300 mb-2" />
        <p className="text-gray-500 text-sm">まだフレンドがいません。右上の「フレンド管理」から追加してください。</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <aside className="w-20 border-r border-gray-200 bg-gray-50 overflow-y-auto shrink-0 flex flex-col items-center gap-2 py-3 pl-3">
        {friends.map((f) => (
          <RailIcon key={f.id} active={activeFriend === f.id} tooltip={f.name} colorClass={f.color} onClick={() => setActiveFriend(f.id)}>
            {f.initial}
          </RailIcon>
        ))}
      </aside>
      {!friend ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">左のアイコンから相手を選んでください</div>
      ) : (
        <section className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-2">
            <Avatar user={friend} px={30} /><span className="font-bold">{friend.name}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => <Bubble key={i} mine={m.from_id === me.id} text={m.text} time={fmt(m.created_at)} />)}
            <div ref={bottomRef} />
          </div>
          <Composer placeholder={`${friend.name} にメッセージを送る`} value={text} setValue={setText} onSend={sendDm} />
        </section>
      )}
    </div>
  );
}

/* ---------------- グループ ---------------- */

function GroupView({ me, friends, findUser }) {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);
  const bottomRef = useRef(null);
  const group = groups.find((g) => g.id === activeGroup);
  const channel = channels.find((c) => c.id === activeChannel);

  useEffect(() => {
    (async () => {
      const { data: memberships } = await supabase.from("group_members").select("group_id").eq("user_id", me.id);
      const ids = (memberships || []).map((m) => m.group_id);
      if (ids.length === 0) return setGroups([]);
      const { data } = await supabase.from("groups").select("*").in("id", ids);
      setGroups(data || []);
    })();
  }, [me.id]);

  useEffect(() => {
    if (!activeGroup) return setChannels([]);
    (async () => {
      const { data } = await supabase.from("channels").select("*").eq("group_id", activeGroup).order("created_at");
      setChannels(data || []);
    })();
  }, [activeGroup]);

  useEffect(() => {
    if (!activeChannel) return;
    let active = true;
    (async () => {
      const { data } = await supabase.from("channel_messages").select("*").eq("channel_id", activeChannel).order("created_at");
      if (active) setMessages(data || []);
    })();
    const ch = supabase
      .channel(`channel-${activeChannel}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "channel_messages", filter: `channel_id=eq.${activeChannel}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, [activeChannel]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ block: "end" }); }, [messages]);

  async function createGroup(name, memberIds) {
    const { data: g } = await supabase.from("groups").insert({ name, initial: name[0], color: "bg-purple-500", created_by: me.id }).select().single();
    if (!g) return;
    await supabase.from("group_members").insert([{ group_id: g.id, user_id: me.id }, ...memberIds.map((id) => ({ group_id: g.id, user_id: id }))]);
    await supabase.from("channels").insert([{ group_id: g.id, name: "general", channel_type: "text" }, { group_id: g.id, name: "雑談ボイス", channel_type: "voice" }]);
    setGroups((prev) => [...prev, g]);
    setActiveGroup(g.id);
    setShowNewGroup(false);
  }

  async function addChannel(name, type) {
    const { data } = await supabase.from("channels").insert({ group_id: activeGroup, name, channel_type: type }).select().single();
    if (data) setChannels((prev) => [...prev, data]);
  }

  async function sendMsg() {
    const body = text;
    setText("");
    const { data } = await supabase.from("channel_messages").insert({ channel_id: activeChannel, from_id: me.id, text: body }).select().single();
    if (data) setMessages((prev) => [...prev, data]);
  }

  if (channel && channel.channel_type === "text") {
    return (
      <div className="h-full flex flex-col">
        <div className="px-3 py-3 border-b border-gray-200 flex items-center gap-2">
          <button onClick={() => setActiveChannel(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"><ChevronLeft size={20} /></button>
          <Hash size={16} className="text-gray-400" />
          <div><p className="font-bold leading-tight">{channel.name}</p><p className="text-xs text-gray-400">{group.name}</p></div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
          {messages.map((m, i) => {
            const author = findUser(m.from_id);
            return (
              <div key={i} className={`flex gap-2 ${m.from_id === me.id ? "justify-end" : ""}`}>
                {m.from_id !== me.id && <Avatar user={author} px={28} />}
                <div>{m.from_id !== me.id && <p className="text-xs text-gray-400 mb-0.5">{author.name}</p>}<Bubble mine={m.from_id === me.id} text={m.text} time={fmt(m.created_at)} /></div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <Composer placeholder={`#${channel.name} にメッセージを送る`} value={text} setValue={setText} onSend={sendMsg} />
      </div>
    );
  }

  if (channel && channel.channel_type === "voice") {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6">
        <button onClick={() => setActiveChannel(null)} className="absolute top-3 left-3 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"><ChevronLeft size={20} /></button>
        <Mic size={32} className="text-indigo-400 mb-3" />
        <p className="font-bold mb-1">{channel.name}</p>
        <p className="text-sm text-gray-400 max-w-xs">ボイスチャンネルの見た目だけ用意しています。実際の通話機能は未実装です。</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 overflow-x-auto">
        {groups.map((g) => (
          <RailIcon key={g.id} active={activeGroup === g.id} tooltip={g.name} colorClass={g.color} onClick={() => setActiveGroup(g.id)}>{g.initial}</RailIcon>
        ))}
        <button onClick={() => setShowNewGroup(true)} className="w-12 h-12 rounded-full hover:rounded-2xl bg-gray-100 hover:bg-emerald-500 text-emerald-500 hover:text-white flex items-center justify-center transition-all shrink-0">
          <Plus size={20} />
        </button>
      </div>
      {groups.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm px-6 text-center">グループがありません。＋ボタンから作成できます</div>
      ) : group ? (
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">{group.name}</p>
            <AddChannelButton onAdd={addChannel} />
          </div>
          <p className="px-4 text-xs text-gray-400 font-bold mt-2 mb-1">テキストチャンネル</p>
          {channels.filter((c) => c.channel_type === "text").map((c) => (
            <button key={c.id} onClick={() => setActiveChannel(c.id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left">
              <Hash size={16} className="text-gray-400" /><span className="text-sm font-medium">{c.name}</span>
            </button>
          ))}
          <p className="px-4 text-xs text-gray-400 font-bold mt-3 mb-1">ボイスチャンネル</p>
          {channels.filter((c) => c.channel_type === "voice").map((c) => (
            <button key={c.id} onClick={() => setActiveChannel(c.id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left">
              <Mic size={16} className="text-gray-400" /><span className="text-sm font-medium">{c.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">上のアイコンからグループを選んでください</div>
      )}
      {showNewGroup && <NewGroupModal friends={friends} onClose={() => setShowNewGroup(false)} onCreate={createGroup} />}
    </div>
  );
}

function AddChannelButton({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("text");
  if (!open) return <button onClick={() => setOpen(true)} className="text-xs text-indigo-600 font-bold">+ チャンネル追加</button>;
  return (
    <div className="flex items-center gap-1">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="チャンネル名" className="text-xs bg-gray-100 rounded px-2 py-1 w-24 outline-none" />
      <select value={type} onChange={(e) => setType(e.target.value)} className="text-xs bg-gray-100 rounded px-1 py-1 outline-none">
        <option value="text">テキスト</option>
        <option value="voice">ボイス</option>
      </select>
      <button onClick={() => { if (name.trim()) { onAdd(name.trim(), type); setName(""); setOpen(false); } }} className="text-xs bg-indigo-600 text-white rounded px-2 py-1">作成</button>
    </div>
  );
}

function NewGroupModal({ friends, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  return (
    <Modal title="新しいグループ" onClose={onClose}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="グループ名" className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none mb-4" />
      <p className="text-xs text-gray-400 mb-2 font-bold">メンバーを選択</p>
      {friends.length === 0 && <p className="text-sm text-gray-400 mb-4">先にフレンドを追加してください</p>}
      <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
        {friends.map((f) => (
          <label key={f.id} className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={selected.includes(f.id)} onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, f.id] : prev.filter((id) => id !== f.id))} />
            <Avatar user={f} px={26} /><span className="text-sm">{f.name}</span>
          </label>
        ))}
      </div>
      <button onClick={() => onCreate(name, selected)} disabled={!name.trim() || selected.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg py-2 text-sm font-bold">
        作成する
      </button>
    </Modal>
  );
}

/* ---------------- 掲示板 ---------------- */

function BoardView({ me, unlocked, findUser }) {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [text, setText] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const bottomRef = useRef(null);
  const thread = threads.find((t) => t.id === activeThread);

  useEffect(() => {
    if (!unlocked) return;
    (async () => {
      const { data } = await supabase.from("board_threads").select("*").order("created_at", { ascending: false });
      setThreads(data || []);
    })();
  }, [unlocked]);

  useEffect(() => {
    if (!activeThread) return;
    let active = true;
    (async () => {
      const { data } = await supabase.from("board_replies").select("*").eq("thread_id", activeThread).order("no").limit(50, { foreignTable: undefined });
      if (active) setReplies(data || []);
    })();
    const ch = supabase
      .channel(`thread-${activeThread}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "board_replies", filter: `thread_id=eq.${activeThread}` }, (payload) => {
        setReplies((prev) => [...prev, payload.new]);
      })
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, [activeThread]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ block: "end" }); }, [replies]);

  async function createThread(title, body) {
    const { data: t } = await supabase.from("board_threads").insert({ title, creator_id: me.id }).select().single();
    if (!t) return;
    await supabase.from("board_replies").insert({ thread_id: t.id, no: 1, author_id: me.id, text: body });
    setThreads((prev) => [t, ...prev]);
    setActiveThread(t.id);
    setShowNewThread(false);
  }

  async function reply() {
    const body = text;
    setText("");
    const no = replies.length + 1;
    const { data } = await supabase.from("board_replies").insert({ thread_id: activeThread, no, author_id: me.id, text: body }).select().single();
    if (data) setReplies((prev) => [...prev, data]);
    if (no >= 1000) setThreads((prev) => prev.map((t) => (t.id === activeThread ? { ...t, locked: true } : t)));
  }

  async function deleteThread(id) {
    await supabase.from("board_threads").delete().eq("id", id);
    setThreads((prev) => prev.filter((t) => t.id !== id));
    setDeleteTarget(null);
    if (activeThread === id) setActiveThread(null);
  }

  if (!unlocked) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 bg-amber-50 text-amber-900">
        <Lock size={32} className="text-amber-400 mb-3" />
        <p className="font-bold mb-1">掲示板はフレンド限定です</p>
        <p className="text-sm text-amber-700 max-w-xs">フレンドを1人以上追加すると、掲示板の閲覧・書き込みができるようになります。</p>
      </div>
    );
  }

  if (thread) {
    const isCreator = thread.creator_id === me.id;
    return (
      <div className="h-full flex flex-col bg-amber-50 text-amber-950">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-amber-200">
          <button onClick={() => setActiveThread(null)} className="text-amber-700"><ChevronLeft size={20} /></button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold truncate">{thread.title}</p>
            <p className="text-xs text-amber-600">{thread.reply_count}/1000 ・ 主: {findUser(thread.creator_id).name}</p>
          </div>
          {isCreator && <button onClick={() => setDeleteTarget(thread.id)} className="text-red-500 flex items-center gap-1 text-xs"><Trash2 size={14} />削除</button>}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
          {replies.map((r) => {
            const author = findUser(r.author_id);
            return (
              <div key={r.no} className="border-b border-amber-200 pb-2">
                <p className="text-xs text-amber-700"><span className="font-bold text-amber-600">{r.no}</span> <span className="text-emerald-700">{author.name}</span> <span className="text-amber-400">{fmt(r.created_at)}</span></p>
                <p className="mt-0.5 whitespace-pre-wrap">{r.text}</p>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <Composer placeholder="レスを書き込む" value={text} setValue={setText} onSend={reply} disabled={thread.locked} disabledNote="1000レスに到達したため書き込みできません(スレッドは保存されています)" />
        {deleteTarget && (
          <Modal title="スレッドを削除しますか?" onClose={() => setDeleteTarget(null)}>
            <p className="text-sm text-gray-600 mb-5">この操作は取り消せません。</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100">キャンセル</button>
              <button onClick={() => deleteThread(deleteTarget)} className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white font-bold">削除する</button>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-amber-50 text-amber-950">
      <div className="flex items-center justify-between px-5 py-3 border-b border-amber-200">
        <span className="text-amber-700 font-bold text-sm">スレッド一覧</span>
        <button onClick={() => setShowNewThread(true)} className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-white font-bold px-3 py-1.5 rounded">
          <Plus size={13} /> スレを立てる
        </button>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-amber-200">
        {threads.length === 0 && <p className="text-center text-sm text-amber-600 pt-8">まだスレッドがありません</p>}
        {threads.map((t) => (
          <button key={t.id} onClick={() => setActiveThread(t.id)} className="w-full text-left px-5 py-3 hover:bg-amber-100 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm truncate">{t.locked && <span className="text-amber-400 mr-1">[past]</span>}{t.title}</p>
              <p className="text-xs text-amber-500 mt-0.5">{findUser(t.creator_id).name}</p>
            </div>
            <span className={`text-xs font-bold shrink-0 ${t.locked ? "text-amber-400" : t.reply_count > 900 ? "text-red-500" : "text-amber-600"}`}>{t.reply_count}/1000</span>
          </button>
        ))}
      </div>
      {showNewThread && (
        <Modal title="新しいスレッドを立てる" onClose={() => setShowNewThread(false)}>
          <NewThreadForm onCreate={createThread} />
        </Modal>
      )}
    </div>
  );
}

function NewThreadForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <div className="space-y-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="スレッドタイトル" className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="最初のレス(>>1)の内容" rows={4} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none resize-none" />
      <button onClick={() => onCreate(title, body)} disabled={!title.trim() || !body.trim()} className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg py-2 text-sm font-bold">
        スレを立てる
      </button>
    </div>
  );
}
