import { useEffect, useState } from 'react';
import { Inbox, Mail, MailOpen, Phone, RefreshCw, Search, Trash2 } from 'lucide-react';
import { supabase } from '../supabase';

const requestMessages = async (method = 'GET', payload = null) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Your session has expired. Please sign in again.');

  const response = await fetch('/api/site-messages', {
    method,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(payload ? { 'Content-Type': 'application/json' } : {})
    },
    ...(payload ? { body: JSON.stringify(payload) } : {})
  });
  const responseText = await response.text();
  const contentType = response.headers.get('content-type') || '';
  const isHtmlResponse = contentType.includes('text/html') || responseText.trimStart().startsWith('<');
  let result = {};
  if (responseText.trim() && !isHtmlResponse) {
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error('The messages service returned an invalid response. Please refresh and try again.');
    }
  }
  if (isHtmlResponse) {
    const localApiHint = import.meta.env.DEV
      ? ' Run `npx vercel dev` locally; `npm run dev` does not serve API routes.'
      : ' Check that the messages API is deployed.';
    throw new Error(`The website messages API returned a web page instead of JSON.${localApiHint}`);
  }
  if (!response.ok) throw new Error(result.error || 'Could not connect to the messages inbox.');
  return result;
};

const formatMessageDate = (date) => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(new Date(date));

const WebsiteMessagesTab = () => {
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    const load = async (isBackgroundRefresh = false) => {
      try {
        const result = await requestMessages();
        if (!isActive) return;
        setMessages(result.messages || []);
        setSelectedId(current => result.messages?.some(message => message.id === current)
          ? current
          : result.messages?.[0]?.id || '');
        setError('');
      } catch (loadError) {
        if (isActive && !isBackgroundRefresh) setError(loadError.message || 'Could not load website messages.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void load();
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load(true);
    }, 60_000);
    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [refreshKey]);

  const updateReadStatus = async (message, isRead) => {
    if (message.is_read === isRead) return;
    try {
      await requestMessages('PATCH', { id: message.id, isRead });
      setMessages(current => current.map(item => item.id === message.id ? { ...item, is_read: isRead } : item));
    } catch (updateError) {
      setError(updateError.message || 'Could not update this message.');
    }
  };

  const query = search.trim().toLowerCase();
  const filteredMessages = messages.filter(message => {
    const matchesFilter = filter === 'all' || !message.is_read;
    const matchesSearch = !query || [message.sender_name, message.sender_email, message.sender_phone, message.subject, message.message]
      .some(value => String(value || '').toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });
  const selectedMessage = messages.find(message => message.id === selectedId);
  const unreadCount = messages.filter(message => !message.is_read).length;

  const deleteMessage = async (message) => {
    if (!window.confirm(`Delete the message from ${message.sender_name}? This cannot be undone.`)) return;
    setDeletingId(message.id);
    setError('');
    try {
      await requestMessages('DELETE', { id: message.id });
      const remaining = messages.filter(item => item.id !== message.id);
      setMessages(remaining);
      if (selectedId === message.id) {
        setSelectedId(filteredMessages.find(item => item.id !== message.id)?.id || remaining[0]?.id || '');
      }
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete this message.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <section className="space-y-4" aria-labelledby="website-messages-title">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-school-blue/10 text-school-blue">
            <Inbox size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-school-green">Website Inbox</p>
            <h1 id="website-messages-title" className="text-2xl font-bold text-slate-900">Messages</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-school-green/10 px-3 py-1.5 text-sm font-bold text-school-green">
            {unreadCount} unread
          </span>
          <button
            type="button"
            onClick={() => { setIsLoading(true); setRefreshKey(key => key + 1); }}
            title="Refresh messages"
            aria-label="Refresh messages"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-school-blue hover:text-school-blue"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit rounded-md bg-slate-100 p-1" role="group" aria-label="Filter messages">
          {[
            { id: 'all', label: `All (${messages.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` }
          ].map(option => (
            <button
              key={option.id}
              type="button"
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
              className={`rounded px-3 py-1.5 text-sm font-semibold transition ${filter === option.id ? 'bg-white text-school-blue shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="flex h-10 w-full items-center gap-2 border border-slate-300 bg-white px-3 sm:max-w-xs">
          <Search size={17} className="shrink-0 text-slate-400" aria-hidden="true" />
          <span className="sr-only">Search messages</span>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search messages"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
      </div>

      <div className="grid min-h-[30rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:grid-cols-[minmax(16rem,0.85fr)_minmax(0,1.5fr)]">
        <div className="max-h-[34rem] divide-y divide-slate-100 overflow-y-auto border-b border-slate-200 md:border-b-0 md:border-r">
          {isLoading && messages.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">Loading messages...</p>
          ) : filteredMessages.length ? filteredMessages.map(message => (
            <button
              key={message.id}
              type="button"
              onClick={() => { setSelectedId(message.id); void updateReadStatus(message, true); }}
              className={`w-full border-l-[3px] p-4 text-left transition hover:bg-slate-50 ${selectedId === message.id ? 'border-school-green bg-slate-50' : message.is_read ? 'border-transparent' : 'border-school-blue bg-blue-50/40'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="truncate text-sm font-bold text-slate-900">{message.sender_name}</span>
                <span className="shrink-0 text-[11px] text-slate-400">{formatMessageDate(message.created_at)}</span>
              </div>
              <span className="mt-1 block truncate text-sm font-medium text-slate-700">{message.subject}</span>
              <span className="mt-1 block truncate text-xs text-slate-500">{message.message}</span>
              {message.sender_phone && <span className="mt-2 block truncate text-xs text-slate-500">{message.sender_phone}</span>}
              {!message.is_read && <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">Unread</span>}
            </button>
          )) : (
            <div className="px-5 py-12 text-center">
              <Inbox size={28} className="mx-auto text-slate-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-slate-700">{messages.length ? 'No matching messages' : 'Your inbox is clear'}</p>
              <p className="mt-1 text-xs text-slate-500">New website inquiries will appear here.</p>
            </div>
          )}
        </div>

        {selectedMessage ? (
          <article className="min-w-0 bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-school-green">{selectedMessage.is_read ? 'Read message' : 'New message'}</p>
                <h2 className="mt-1 break-words text-xl font-bold text-slate-900">{selectedMessage.subject}</h2>
                <p className="mt-3 text-sm font-semibold text-slate-800">{selectedMessage.sender_name}</p>
                <a className="mt-1 block break-all text-sm text-school-blue hover:underline" href={`mailto:${selectedMessage.sender_email}`}>
                  {selectedMessage.sender_email}
                </a>
                {selectedMessage.sender_phone && (
                  <a className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-school-blue" href={`tel:${selectedMessage.sender_phone.replace(/[^+\d]/g, '')}`}>
                    <Phone size={14} aria-hidden="true" /> {selectedMessage.sender_phone}
                  </a>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => void updateReadStatus(selectedMessage, !selectedMessage.is_read)}
                  title={selectedMessage.is_read ? 'Mark as unread' : 'Mark as read'}
                  aria-label={selectedMessage.is_read ? 'Mark as unread' : 'Mark as read'}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:border-school-blue hover:text-school-blue"
                >
                  {selectedMessage.is_read ? <Mail size={17} /> : <MailOpen size={17} />}
                </button>
                <button
                  type="button"
                  onClick={() => void deleteMessage(selectedMessage)}
                  disabled={deletingId === selectedMessage.id}
                  title="Delete message"
                  aria-label={`Delete message from ${selectedMessage.sender_name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Received {formatMessageDate(selectedMessage.created_at)}</p>
            <div className="mt-5 whitespace-pre-wrap break-words rounded-md bg-slate-50 p-4 text-sm leading-7 text-slate-700">{selectedMessage.message}</div>
            <a href={`mailto:${selectedMessage.sender_email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`} className="mt-6 inline-flex items-center justify-center rounded-md bg-school-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-school-blue-dark">
              Reply by email
            </a>
          </article>
        ) : (
          <div className="hidden items-center justify-center p-8 text-center md:flex">
            <div>
              <Mail size={32} className="mx-auto text-slate-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-slate-600">Select a message to read it</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WebsiteMessagesTab;