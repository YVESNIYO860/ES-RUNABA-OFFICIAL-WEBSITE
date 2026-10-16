import { useEffect, useState } from 'react';
import { Inbox, MessageSquare, Plus, RefreshCw, Search, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

const requestSchoolMessages = async (method = 'GET', payload = null, query = '') => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Your session has expired. Please sign in again.');

  const response = await fetch(`/api/school-messages${query}`, {
    method,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(payload ? { 'Content-Type': 'application/json' } : {})
    },
    ...(payload ? { body: JSON.stringify(payload) } : {})
  });
  const responseText = await response.text();
  const isHtml = response.headers.get('content-type')?.includes('text/html') || responseText.trimStart().startsWith('<');
  if (isHtml) {
    const hint = import.meta.env.DEV
      ? ' Run `npx vercel dev` locally; `npm run dev` does not serve API routes.'
      : ' Check that the school messaging API is deployed.';
    throw new Error(`The school messaging API returned a web page instead of JSON.${hint}`);
  }
  let result = {};
  if (responseText.trim()) {
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error('The messaging service returned an invalid response.');
    }
  }
  if (!response.ok) throw new Error(result.error || 'Could not load school messages.');
  return result;
};

const formatMessageTime = (date) => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(new Date(date));

const SchoolMessagesTab = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [compose, setCompose] = useState(false);
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isManager = user?.role === 'dos' || user?.isAdmin;

  useEffect(() => {
    let isActive = true;
    const loadInbox = async (background = false) => {
      try {
        const result = await requestSchoolMessages();
        if (!isActive) return;
        const nextThreads = result.threads || [];
        setThreads(nextThreads);
        setRecipients(result.recipients || []);
        setSelectedId(current => nextThreads.some(thread => thread.id === current)
          ? current
          : nextThreads[0]?.id || '');
        setError('');
      } catch (loadError) {
        if (isActive && !background) setError(loadError.message || 'Could not load your messages.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadInbox();
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadInbox(true);
    }, 60_000);
    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [refreshKey]);

  useEffect(() => {
    if (!selectedId || compose) {
      setMessages([]);
      return undefined;
    }
    let isActive = true;
    const loadThread = async () => {
      try {
        const result = await requestSchoolMessages('GET', null, `?threadId=${encodeURIComponent(selectedId)}`);
        if (!isActive) return;
        const threadMessages = result.messages || [];
        setMessages(threadMessages);
        const hasIncomingUnread = threadMessages.some(message => message.sender_id !== user?.id && !message.read_at);
        if (hasIncomingUnread && !isManager) {
          await requestSchoolMessages('PATCH', { threadId: selectedId });
          if (isActive) setThreads(current => current.map(thread => thread.id === selectedId ? { ...thread, unreadCount: 0 } : thread));
        }
      } catch (loadError) {
        if (isActive) setError(loadError.message || 'Could not open this conversation.');
      }
    };
    void loadThread();
    return () => { isActive = false; };
  }, [selectedId, compose, isManager, user?.id]);
  const filteredThreads = threads.filter(thread => {
    const otherId = thread.user_a_id === user?.id ? thread.user_b_id : thread.user_a_id;
    const person = thread.participantA?.id === otherId ? thread.participantA : thread.participantB;
    const term = search.trim().toLocaleLowerCase();
    return !term || [thread.subject, thread.last_message, person?.full_name, person?.email]
      .some(value => String(value || '').toLocaleLowerCase().includes(term));
  });
  const selectedThread = threads.find(thread => thread.id === selectedId);
  const totalUnread = threads.reduce((total, thread) => total + (thread.unreadCount || 0), 0);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!body.trim() || isSending) return;
    setIsSending(true);
    setError('');
    try {
      const result = await requestSchoolMessages('POST', compose
        ? { recipientId, subject, body }
        : { threadId: selectedId, body });
      setBody('');
      if (compose) {
        setSubject('');
        setRecipientId('');
        setCompose(false);
        if (result.thread) {
          setThreads(current => [result.thread, ...current.filter(thread => thread.id !== result.thread.id)]);
          setSelectedId(result.thread.id);
        }
      } else if (result.message) {
        setMessages(current => [...current, result.message]);
        setThreads(current => current.map(thread => thread.id === selectedId
          ? { ...thread, last_message: result.message.body, last_sender_id: user.id, last_message_at: result.message.created_at }
          : thread));
      }
    } catch (sendError) {
      setError(sendError.message || 'Could not send this message.');
    } finally {
      setIsSending(false);
    }
  };

  const personForThread = (thread) => {
    const otherId = thread.user_a_id === user?.id ? thread.user_b_id : thread.user_a_id;
    return thread.participantA?.id === otherId ? thread.participantA : thread.participantB;
  };

  return (
    <section className="space-y-4" aria-labelledby="school-messages-title">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-school-blue/10 text-school-blue"><MessageSquare size={21} /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-school-green">Private school inbox</p>
            <h2 id="school-messages-title" className="text-2xl font-bold text-slate-900">Messages</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-school-green/10 px-3 py-1.5 text-sm font-bold text-school-green">{totalUnread} unread</span>
          {(user?.role === 'student' || isManager) && (
            <button type="button" onClick={() => { setCompose(true); setSelectedId(''); setError(''); }} className="inline-flex h-10 items-center gap-2 rounded-md bg-school-blue px-4 text-sm font-bold text-white hover:bg-slate-800">
              <Plus size={17} /> New message
            </button>
          )}
          <button type="button" onClick={() => { setIsLoading(true); setRefreshKey(key => key + 1); }} title="Refresh inbox" aria-label="Refresh inbox" className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:border-school-blue hover:text-school-blue">
            <RefreshCw size={17} />
          </button>
        </div>
      </header>

      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <div className="grid min-h-[32rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.5fr)]">
        <aside className="border-b border-slate-200 md:border-b-0 md:border-r">
          <label className="flex h-11 items-center gap-2 border-b border-slate-200 px-3">
            <Search size={16} className="text-slate-400" />
            <span className="sr-only">Search conversations</span>
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search conversations" className="min-w-0 flex-1 text-sm outline-none" />
          </label>
          <div className="max-h-[34rem] divide-y divide-slate-100 overflow-y-auto">
            {isLoading && !threads.length ? <p className="p-5 text-sm text-slate-500">Loading inbox...</p> : null}
            {!isLoading && !filteredThreads.length && (
              <div className="px-5 py-12 text-center">
                <Inbox size={26} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">{search ? 'No matching conversations' : 'Your inbox is clear'}</p>
                <p className="mt-1 text-xs text-slate-500">New questions and replies will appear here.</p>
              </div>
            )}
            {filteredThreads.map(thread => {
              const person = personForThread(thread);
              return (
                <button key={thread.id} type="button" onClick={() => { setCompose(false); setSelectedId(thread.id); }} className={`w-full border-l-[3px] p-4 text-left hover:bg-slate-50 ${selectedId === thread.id && !compose ? 'border-school-green bg-slate-50' : thread.unreadCount ? 'border-school-blue bg-blue-50/40' : 'border-transparent'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="truncate text-sm font-bold text-slate-900">{person?.full_name || person?.email || 'School user'}</span>
                    <span className="shrink-0 text-[11px] text-slate-400">{formatMessageTime(thread.last_message_at)}</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-700">{thread.subject}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{thread.last_message}</p>
                  {thread.unreadCount > 0 && <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">{thread.unreadCount} new</span>}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex min-h-[32rem] min-w-0 flex-col">
          {compose ? (
            <form onSubmit={handleSend} className="space-y-4 p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">New conversation</h3>
                  <p className="mt-1 text-sm text-slate-500">Messages are visible to the participants and DOS administrators.</p>
                </div>
                <button type="button" onClick={() => { setCompose(false); setError(''); }} aria-label="Cancel new conversation" title="Cancel" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50">
                  <X size={17} />
                </button>
              </div>
              <label className="block text-sm font-semibold text-slate-700">
                To
                <select required value={recipientId} onChange={event => setRecipientId(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5">
                  <option value="">Choose a recipient</option>
                  {recipients.map(recipient => <option key={recipient.id} value={recipient.id}>{recipient.full_name || recipient.email} · {recipient.role}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Subject
                <input required maxLength={160} value={subject} onChange={event => setSubject(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5" placeholder="What would you like help with?" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Message
                <textarea required maxLength={5000} rows={7} value={body} onChange={event => setBody(event.target.value)} className="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 font-normal leading-relaxed" placeholder="Write your message..." />
              </label>
              <button disabled={isSending || !recipientId || !subject.trim() || !body.trim()} type="submit" className="inline-flex items-center gap-2 rounded-md bg-school-blue px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                <Send size={16} /> {isSending ? 'Sending...' : 'Send message'}
              </button>
            </form>
          ) : selectedThread ? (
            <>
              <div className="border-b border-slate-200 p-5 sm:px-7">
                <h3 className="break-words text-lg font-bold text-slate-900">{selectedThread.subject}</h3>
                <p className="mt-1 text-xs text-slate-500">Conversation with {personForThread(selectedThread)?.full_name || personForThread(selectedThread)?.email || 'school user'}</p>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-4 sm:p-6">
                {!messages.length && <p className="py-8 text-center text-sm text-slate-500">Loading conversation...</p>}
                {messages.map(message => {
                  const ownMessage = message.sender_id === user?.id;
                  return (
                    <div key={message.id} className={`flex ${ownMessage ? 'justify-end' : 'justify-start'}`}>
                      <article className={`max-w-[88%] rounded-xl px-4 py-3 shadow-sm ${ownMessage ? 'bg-school-blue text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
                        <p className={`mb-1 text-[11px] font-bold ${ownMessage ? 'text-white/70' : 'text-school-green'}`}>{ownMessage ? 'You' : message.sender?.full_name || message.sender?.email || 'School user'}</p>
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.body}</p>
                        <time className={`mt-2 block text-right text-[10px] ${ownMessage ? 'text-white/60' : 'text-slate-400'}`}>{formatMessageTime(message.created_at)}</time>
                      </article>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={handleSend} className="flex items-end gap-3 border-t border-slate-200 bg-white p-4 sm:p-5">
                <label className="sr-only" htmlFor="school-message-reply">Reply</label>
                <textarea id="school-message-reply" rows={2} maxLength={5000} value={body} onChange={event => setBody(event.target.value)} placeholder="Write a reply..." className="min-h-12 flex-1 resize-y rounded-md border border-slate-300 px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-school-blue" />
                <button disabled={isSending || !body.trim()} type="submit" aria-label="Send reply" title="Send reply" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-school-blue text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                  <Send size={17} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div><MessageSquare size={30} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-600">Select a conversation to read it</p></div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SchoolMessagesTab;