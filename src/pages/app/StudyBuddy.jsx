import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { Button, Input, Textarea, Card, EmptyState, Spinner } from "../../components/ui/index";

const AVATAR_COLORS = [
  "#2960F1", "#E8590C", "#0CA678", "#D6336C", "#7048E8", "#F59F00",
];

function colorForId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function generateJoinCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/* ---------------------------------------------------------- */
/* Browse / search rooms                                        */
/* ---------------------------------------------------------- */
function BrowseRooms({ session, onOpenRoom, onCreate, toast }) {
  const [rooms, setRooms] = useState([]);
  const [memberCounts, setMemberCounts] = useState({});
  const [myRoomIds, setMyRoomIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmRoom, setConfirmRoom] = useState(null);
  const [joining, setJoining] = useState(false);
  const [codeInput, setCodeInput] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: roomsData } = await supabase
      .from("study_buddy_rooms")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: myMemberships } = await supabase
      .from("study_buddy_members")
      .select("room_id")
      .eq("user_id", session.user.id);
    setMyRoomIds(new Set((myMemberships || []).map((m) => m.room_id)));

    const counts = {};
    await Promise.all(
      (roomsData || []).map(async (r) => {
        const { count } = await supabase
          .from("study_buddy_members")
          .select("user_id", { count: "exact", head: true })
          .eq("room_id", r.id);
        counts[r.id] = count || 0;
      })
    );
    setMemberCounts(counts);
    setRooms(roomsData || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.user.id]);

  const handleRoomClick = (room) => {
    if (myRoomIds.has(room.id)) {
      onOpenRoom(room);
    } else {
      setConfirmRoom(room);
    }
  };

  const doJoin = async (room) => {
    setJoining(true);
    const { error } = await supabase
      .from("study_buddy_members")
      .insert({ room_id: room.id, user_id: session.user.id });
    setJoining(false);
    if (error) {
      toast("Could not join room", "error");
      return;
    }
    setConfirmRoom(null);
    onOpenRoom(room);
  };

  const handleJoinByCode = async () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    const { data: room } = await supabase
      .from("study_buddy_rooms")
      .select("*")
      .eq("join_code", code)
      .maybeSingle();
    if (!room) {
      toast("No room found with that code", "error");
      return;
    }
    if (myRoomIds.has(room.id)) {
      onOpenRoom(room);
    } else {
      setConfirmRoom(room);
    }
  };

  const filtered = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white">
          Study Buddy
        </h1>
        <button onClick={onCreate} className="text-sm font-medium text-primary-400">
          + Create room
        </button>
      </div>

      <Input
        placeholder="Search rooms..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Have a code? Enter it here"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleJoinByCode}>Join</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No rooms yet"
          description="Create the first Study Buddy room for your circle."
          action={<Button onClick={onCreate}>Create room</Button>}
        />
      ) : (
        filtered.map((room) => (
          <Card
            key={room.id}
            className="mb-3 !p-4 cursor-pointer"
            onClick={() => handleRoomClick(room)}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-display font-semibold text-slate-800 dark:text-white text-sm">
                {room.name}
              </p>
              {myRoomIds.has(room.id) && (
                <span className="text-[10px] font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-400 px-2 py-0.5 rounded-full">
                  Joined
                </span>
              )}
            </div>
            {room.description && (
              <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                {room.description}
              </p>
            )}
            <p className="text-xs text-slate-400">
              {memberCounts[room.id] || 0} member
              {memberCounts[room.id] === 1 ? "" : "s"}
            </p>
          </Card>
        ))
      )}

      {confirmRoom && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm">
            <p className="font-display font-bold text-lg text-slate-800 dark:text-white mb-1">
              {confirmRoom.name}
            </p>
            {confirmRoom.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {confirmRoom.description}
              </p>
            )}
            <p className="text-xs text-slate-400 mb-5">
              {memberCounts[confirmRoom.id] || 0} member
              {memberCounts[confirmRoom.id] === 1 ? "" : "s"} — join this room?
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setConfirmRoom(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                loading={joining}
                onClick={() => doJoin(confirmRoom)}
              >
                Join
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Create room                                                   */
/* ---------------------------------------------------------- */
function CreateRoom({ session, onCreated, onCancel, toast }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast("Give your room a name", "error");
      return;
    }
    setSaving(true);
    const joinCode = generateJoinCode();
    const { data: room, error } = await supabase
      .from("study_buddy_rooms")
      .insert({
        creator_id: session.user.id,
        name: name.trim(),
        description: description.trim() || null,
        join_code: joinCode,
      })
      .select()
      .single();
    if (error) {
      setSaving(false);
      toast("Could not create room", "error");
      return;
    }
    const { error: memberError } = await supabase
      .from("study_buddy_members")
      .insert({ room_id: room.id, user_id: session.user.id });
    setSaving(false);
    if (memberError) {
      toast("Room created, but could not join it", "error");
      return;
    }
    onCreated(room);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white">
          New room
        </h1>
      </div>
      <Input
        label="Room name"
        placeholder="e.g. Pre-Med Study Circle"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4"
      />
      <Textarea
        label="Description"
        placeholder="What's this room for?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-6 min-h-[100px]"
      />
      <Button size="lg" className="w-full" loading={saving} onClick={handleCreate}>
        Create room
      </Button>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Room chat                                                     */
/* ---------------------------------------------------------- */
function RoomChat({ session, room, onBack, toast }) {
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [memberCount, setMemberCount] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [revealedUserId, setRevealedUserId] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadProfiles = async (userIds) => {
    const unique = [...new Set(userIds)].filter((id) => !profiles[id]);
    if (unique.length === 0) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, university, hide_university")
      .in("id", unique);
    if (data) {
      setProfiles((prev) => {
        const next = { ...prev };
        data.forEach((p) => (next[p.id] = p));
        return next;
      });
    }
  };

  const load = async () => {
    setLoading(true);
    const { data: msgs } = await supabase
      .from("study_buddy_messages")
      .select("*")
      .eq("room_id", room.id)
      .order("created_at", { ascending: true });
    setMessages(msgs || []);
    await loadProfiles((msgs || []).map((m) => m.sender_id));
    const { count } = await supabase
      .from("study_buddy_members")
      .select("user_id", { count: "exact", head: true })
      .eq("room_id", room.id);
    setMemberCount(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "study_buddy_messages", filter: `room_id=eq.${room.id}` },
        async (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          await loadProfiles([payload.new.sender_id]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    const { error } = await supabase.from("study_buddy_messages").insert({
      room_id: room.id,
      sender_id: session.user.id,
      content: text.trim(),
    });
    setSending(false);
    if (error) {
      toast("Could not send message", "error");
      return;
    }
    setText("");
  };

  const handleLeave = async () => {
    await supabase
      .from("study_buddy_members")
      .delete()
      .eq("room_id", room.id)
      .eq("user_id", session.user.id);
    onBack();
  };

  const handleShare = async () => {
    const link = `${window.location.origin}/app/study-buddy?code=${room.join_code}`;
    try {
      await navigator.clipboard.writeText(link);
      toast("Invite link copied", "success");
    } catch {
      toast(link, "success");
    }
  };

  const initial = (name) => (name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <p className="font-display font-semibold text-slate-800 dark:text-white text-sm truncate">
              {room.name}
            </p>
            <p className="text-xs text-slate-400">
              {memberCount} member{memberCount === 1 ? "" : ""} · code {room.join_code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={handleShare} className="text-xs font-medium text-primary-400">
            Share
          </button>
          <button onClick={handleLeave} className="text-xs font-medium text-slate-400">
            Leave
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          messages.map((m) => {
            const sender = profiles[m.sender_id];
            const isMe = m.sender_id === session.user.id;
            return (
              <div
                key={m.id}
                className={`flex items-end gap-2 mb-3 ${isMe ? "flex-row-reverse" : ""}`}
              >
                <button
                  onClick={() =>
                    setRevealedUserId(revealedUserId === m.sender_id ? null : m.sender_id)
                  }
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: colorForId(m.sender_id) }}
                >
                  {initial(sender?.display_name)}
                </button>
                <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isMe
                        ? "bg-primary-400 text-white rounded-br-sm"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                  {revealedUserId === m.sender_id && (
                    <p className="text-[10px] text-slate-400 mt-1 px-1">
                      {sender?.hide_university
                        ? "University hidden"
                        : sender?.university || "Unknown university"}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 pt-2">
        <Input
          placeholder="Message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          className="flex-1"
        />
        <Button loading={sending} onClick={handleSend}>
          Send
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Root page                                                     */
/* ---------------------------------------------------------- */
export default function StudyBuddy() {
  const { session } = useApp();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [screen, setScreen] = useState("browse"); // browse | create | room
  const [activeRoom, setActiveRoom] = useState(null);
  const [pendingCode, setPendingCode] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    if (code) {
      setPendingCode(code.toUpperCase());
      navigate(location.pathname, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pendingCode) return;
    const resolve = async () => {
      const { data: room } = await supabase
        .from("study_buddy_rooms")
        .select("*")
        .eq("join_code", pendingCode)
        .maybeSingle();
      if (!room) {
        toast("No room found with that invite code", "error");
        setPendingCode(null);
        return;
      }
      const { data: existing } = await supabase
        .from("study_buddy_members")
        .select("room_id")
        .eq("room_id", room.id)
        .eq("user_id", session.user.id)
        .maybeSingle();
      setPendingCode(null);
      if (existing) {
        setActiveRoom(room);
        setScreen("room");
      } else {
        // reuse the confirm flow by routing through BrowseRooms would need
        // more plumbing — for the direct-link case, join immediately since
        // clicking a shared invite link is itself the confirmation.
        const { error } = await supabase
          .from("study_buddy_members")
          .insert({ room_id: room.id, user_id: session.user.id });
        if (error) {
          toast("Could not join room", "error");
          return;
        }
        setActiveRoom(room);
        setScreen("room");
        toast(`Joined ${room.name}`, "success");
      }
    };
    resolve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCode]);

  return (
    <div className="px-5 pt-6 pb-8">
      {screen === "browse" && (
        <BrowseRooms
          session={session}
          onOpenRoom={(room) => {
            setActiveRoom(room);
            setScreen("room");
          }}
          onCreate={() => setScreen("create")}
          toast={toast}
        />
      )}

      {screen === "create" && (
        <CreateRoom
          session={session}
          onCreated={(room) => {
            setActiveRoom(room);
            setScreen("room");
          }}
          onCancel={() => setScreen("browse")}
          toast={toast}
        />
      )}

      {screen === "room" && activeRoom && (
        <RoomChat
          session={session}
          room={activeRoom}
          onBack={() => setScreen("browse")}
          toast={toast}
        />
      )}
    </div>
  );
}
