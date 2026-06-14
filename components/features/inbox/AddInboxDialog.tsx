'use client';

import { useState } from 'react';
import { X, Link as LinkIcon, FileText } from 'lucide-react';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import type { InboxItem } from '@/types';

interface Props {
  onAdd: (item: Omit<InboxItem, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sync_status'>) => void;
  onClose: () => void;
}

export function AddInboxDialog({ onAdd, onClose }: Props) {
  const [type, setType] = useState<'text' | 'link'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      content: content.trim() || null,
      url: type === 'link' ? url.trim() || null : null,
      type,
      status: 'inbox',
      category_id: null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-card rounded-t-2xl sm:rounded-2xl w-[96vw] sm:w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Add to Inbox</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type toggle */}
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            {(['text', 'link'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${type === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t === 'text' ? <FileText size={14} /> : <LinkIcon size={14} />}
                {t === 'text' ? 'Text' : 'Link'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
            <input
              autoFocus
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What do you want to save?"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {type === 'link' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Add context or description (Markdown supported)..."
              minHeight="160px"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tags</label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="study, important, work  (comma separated)"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Save to Inbox
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
