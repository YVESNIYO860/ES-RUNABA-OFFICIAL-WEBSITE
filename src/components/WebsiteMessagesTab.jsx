import { useEffect, useState } from 'react';
import { Inbox, Mail, MailOpen, RefreshCw, Search } from 'lucide-react';
import { supabase } from '../supabase';

const requestMessages = async (method = 'GET', payload = null) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Your session has expired. Please sign in again.');

  const response = await fetch('/api/site-messages', {
    method,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(payload ? { 'Content-Type': 'application/json' } : {})
    },
    ...(payload ? { body: JSON.stringify(payload) } : {})
  });
  const result = await response.json().catch(() => ({}));
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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      try {
        const result = await requestMessages();
        if (!isActive) return;
        setMessages(result.messages || []);
        setSelectedId(current => current || result.messages?.[0]?.id || '');
        setError('');
      } catch (loadError) {
        if (isActive) setError(loadError.message || 'Could not load website messages.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void load();
    const intervalId = window.setInterval(load, 30_000);
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
    const matchesSearch = !query || [message.sender_name, message.sender_email, message.subject, message.message]
      .some(value => value.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });
  const selectedMessage = messages.find(message => message.id === selectedId);
  const unreadCount = messages.filter(message => !message.is_read).length;

  return (
    <section className="space-y-5" aria-labelledby="website-messages-title">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-school-green">Website Inbox</p>
          <h1 id="website-messages-title" className="mt-1 text-2xl font-bold text-school-blue">Messages</h1>
          <p className="mt-1 text-sm text-slate-600">{unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}</p>
        </div>
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

      {error && <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 border-b border-slate-200" role="group" aria-label="Filter messages">
          {[
            { id: 'all', label: `All (${messages.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` }
          ].map(option => (
            <button
              key={option.id}
              type="button"
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
              className={`border-b-2 px-3 py-2 text-sm font-semibold transition ${filter === option.id ? 'border-school-green text-school-blue' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
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

      <div className="grid min-h-[28rem] border border-slate-200 bg-white md:grid-cols-[minmax(15rem,0.85fr)_minmax(0,1.5fr)]">
        <div className="max-h-[34rem] divide-y divide-slate-200 overflow-y-auto border-b border-slate-200 md:border-b-0 md:border-r">
          {isLoading && messages.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">Loading messages...</p>
          ) : filteredMessages.length ? filteredMessages.map(message => (
            <button
              key={message.id}
              type="button"
              onClick={() => { setSelectedId(message.id); void updateReadStatus(message, true); }}
              className={`w-full border-l-4 p-4 text-left transition hover:bg-slate-50 ${selectedId === message.id ? 'border-school-green bg-slate-50' : message.is_read ? 'border-transparent' : 'border-school-blue bg-blue-50/40'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="truncate text-sm font-bold text-slate-900">{message.sender_name}</span>
                {!message.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-school-green" aria-label="Unread" />}
              </div>
              <span className="mt-1 block truncate text-sm font-medium text-slate-700">{message.subject}</span>
              <span className="mt-1 block truncate text-xs text-slate-500">{message.message}</span>
              <span className="mt-3 block text-xs text-slate-400">{formatMessageDate(message.created_at)}</span>
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
          <article className="min-w-0 p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold text-slate-900">{selectedMessage.subject}</h2>
                <p className="mt-2 text-sm text-slate-600">From {selectedMessage.sender_name}</p>
                <a className="mt-1 block break-all text-sm text-school-blue hover:underline" href={`mailto:${selectedMessage.sender_email}`}>
                  {selectedMessage.sender_email}
                </a>
              </div>
              <button
                type="button"
                onClick={() => void updateReadStatus(selectedMessage, !selectedMessage.is_read)}
                title={selectedMessage.is_read ? 'Mark as unread' : 'Mark as read'}
                aria-label={selectedMessage.is_read ? 'Mark as unread' : 'Mark as read'}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:border-school-blue hover:text-school-blue"
              >
                {selectedMessage.is_read ? <Mail size={17} /> : <MailOpen size={17} />}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500">Received {formatMessageDate(selectedMessage.created_at)}</p>
            <p className="mt-6 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{selectedMessage.message}</p>
            <a href={`mailto:${selectedMessage.sender_email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`} className="mt-8 inline-flex items-center justify-center rounded-md bg-school-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-school-blue-dark">
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