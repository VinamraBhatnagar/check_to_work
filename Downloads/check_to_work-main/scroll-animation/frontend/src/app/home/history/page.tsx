"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserChats, type ChatSession } from "@/lib/chatStore";

export default function HistoryPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    getUserChats(user.uid)
      .then(setChats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="h-full overflow-y-auto bg-[#060a14] px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Memory</p>
        <h1 className="mt-2 text-2xl font-semibold">Chat History</h1>
        <p className="mt-2 text-sm text-gray-400">Saved conversations from Firestore, scoped to your account.</p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-lg border border-white/[0.06] bg-white/[0.03]">
          {loading ? (
            <p className="px-5 py-8 text-sm text-gray-500">Loading history...</p>
          ) : chats.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500">Start a new chat to build your history.</p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {chats.map((chat) => (
                <article key={chat.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-medium">{chat.title}</h2>
                    <span className="text-xs text-gray-500">
                      {chat.updatedAt?.toDate ? chat.updatedAt.toDate().toLocaleString() : "Recently"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                    {chat.messages.at(-1)?.content || "No messages"}
                  </p>
                  <p className="mt-3 text-xs text-gray-600">{chat.messages.length} messages</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
