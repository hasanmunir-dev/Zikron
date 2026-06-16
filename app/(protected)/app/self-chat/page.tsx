'use client';

import { useEffect, useState, useRef } from 'react';
import { Send, Search, X, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { savePageState, getPageState } from '@/lib/page-state';
import { useSelfChat, useSendMessage, useToggleFavoriteMessage, useDeleteMessage } from '@/hooks/queries/use-self-chat';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { ItemActions } from '@/components/shared/item-actions';
import { formatRelativeTime } from '@/utils/date';
import type { SelfChatMessage } from '@/types';

type SavedState = { search: string; showSearch: boolean };

export default function SelfChatPage() {
  const { user } = useAuth();
  const [input, setInput] = useState('');

  const saved = getPageState<SavedState>('self-chat');
  const [search, setSearch] = useState(saved?.search ?? '');
  const [showSearch, setShowSearch] = useState(saved?.showSearch ?? false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages = [], isLoading } = useSelfChat();
  const sendMessage = useSendMessage();
  const toggleFavorite = useToggleFavoriteMessage();
  const deleteMessage = useDeleteMessage();

  useEffect(() => {
    savePageState<SavedState>('self-chat', { search, showSearch });
  }, [search, showSearch]);

  useEffect(() => {
    if (!showSearch) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showSearch]);

  async function handleSend() {
    const content = input.trim();
    if (!content || !user) return;
    setInput('');
    sendMessage.mutate(content);
  }

  function handleToggleFavorite(id: string, current: boolean) {
    toggleFavorite.mutate({ id, current });
  }

  function handleDelete(id: string) {
    deleteMessage.mutate(id);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const filtered = search
    ? messages.filter((m: SelfChatMessage) => m.content.toLowerCase().includes(search.toLowerCase()))
    : messages;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border bg-card flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center">
            <MessageSquare size={15} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Me</p>
            <p className="text-xs text-muted-foreground">Your personal saved messages</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Toggle search"
          onClick={() => { setShowSearch(v => !v); setSearch(''); }}
          className={`p-2 rounded-lg transition-colors ${showSearch ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
        >
          <Search size={17} />
        </button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="px-4 py-2.5 border-b border-border bg-card shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-8 pr-8 py-1.5 text-sm border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {search && (
              <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <X size={13} />
              </button>
            )}
          </div>
          {search && <p className="text-xs text-muted-foreground mt-1.5">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        )}
        {!isLoading && filtered.length === 0 && !search && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare size={26} className="text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-foreground">Send messages to yourself</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">Save ideas, reminders, links — anything you want to remember.</p>
          </div>
        )}
        {filtered.length === 0 && search && (
          <div className="text-center py-8 text-sm text-muted-foreground">No messages match &quot;{search}&quot;</div>
        )}
        {filtered.map((msg, i) => {
          const prev = filtered[i - 1];
          const showDate = !prev || new Date(msg.created_at).toDateString() !== new Date(prev.created_at).toDateString();
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center my-3">
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {new Date(msg.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
              <MessageBubble
                msg={msg}
                onToggleFavorite={() => handleToggleFavorite(msg.id, msg.is_favorite)}
                onDelete={() => handleDelete(msg.id)}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            rows={1}
            className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm resize-none bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all max-h-32 field-sizing-content"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            aria-label="Send message"
            className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground/50 mt-1.5 pl-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onToggleFavorite, onDelete }: {
  msg: SelfChatMessage;
  onToggleFavorite: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex justify-end">
      <div className="relative max-w-xs sm:max-w-sm lg:max-w-md">
        {msg.is_favorite && (
          <div className="absolute -left-5 top-2"><Star size={12} className="text-amber-400 fill-amber-400" /></div>
        )}
        <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-md text-sm leading-relaxed
          [&_.prose]:text-white [&_.prose_p]:text-white [&_.prose_li]:text-white [&_.prose_strong]:text-white
          [&_.prose_em]:text-white [&_.prose_code]:bg-blue-500 [&_.prose_code]:text-white
          [&_.prose_pre]:bg-blue-500 [&_.prose_pre]:border-blue-400 [&_.prose_blockquote]:border-blue-400
          [&_.prose_a]:text-blue-200 [&_.prose_h1]:text-white [&_.prose_h2]:text-white [&_.prose_h3]:text-white">
          <MarkdownViewer content={msg.content} />
        </div>
        <div className="flex items-center justify-end gap-1 mt-1">
          <ItemActions
            isFavorite={msg.is_favorite}
            onToggleFavorite={onToggleFavorite}
            onDelete={onDelete}
            deleteTitle="Delete Message?"
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          />
          <span className="text-xs text-muted-foreground">{formatRelativeTime(msg.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
