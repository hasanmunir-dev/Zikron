'use client';

import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { noteKeys } from './queries/use-notes';
import { inboxKeys } from './queries/use-inbox';
import { listKeys } from './queries/use-lists';
import { reminderKeys } from './queries/use-reminders';
import { collectionKeys } from './queries/use-collections';
import { contactKeys } from './queries/use-contacts';
import type { Note, InboxItem, List, Reminder, Collection, Contact, LinkableItemType } from '@/types';

export interface WikiLinkTarget {
  id: string;
  type: LinkableItemType;
  title: string;
}

/**
 * Builds a Map<title_lowercase, WikiLinkTarget> from all React Query caches.
 * Used by MarkdownViewer to resolve [[wiki links]] without extra API calls.
 */
export function useWikiLinkMap(): Map<string, WikiLinkTarget> {
  const qc = useQueryClient();

  return useMemo(() => {
    const map = new Map<string, WikiLinkTarget>();

    const add = (title: string, id: string, type: LinkableItemType) => {
      if (title) map.set(title.toLowerCase(), { id, type, title });
    };

    const notes = qc.getQueryData<Note[]>(noteKeys.all()) ?? [];
    const inbox = qc.getQueryData<InboxItem[]>(inboxKeys.all()) ?? [];
    const lists = qc.getQueryData<List[]>(listKeys.all()) ?? [];
    const reminders = qc.getQueryData<Reminder[]>(reminderKeys.all()) ?? [];
    const collections = qc.getQueryData<Collection[]>(collectionKeys.all()) ?? [];
    const contacts = qc.getQueryData<Contact[]>(contactKeys.all()) ?? [];

    notes.forEach(n => add(n.title, n.id, 'note'));
    inbox.forEach(i => add(i.title, i.id, 'inbox'));
    lists.forEach(l => add(l.title, l.id, 'list'));
    reminders.forEach(r => add(r.title, r.id, 'reminder'));
    collections.forEach(c => add(c.title, c.id, 'collection'));
    contacts.forEach(c => add(c.name, c.id, 'contact'));

    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qc]);
}
