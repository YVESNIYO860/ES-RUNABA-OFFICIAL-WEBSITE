import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Trash2, Plus, LogOut, CheckCircle, Save, Edit3, X, Upload, ImagePlus, Film, Inbox, Newspaper } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createSchoolUpdate, deleteSchoolMedia, deleteSchoolUpdate, isSupabaseConfigured, loadSchoolMedia, loadSchoolUpdates, setSchoolUpdateActive, updateSchoolUpdate, uploadSchoolMedia } from '../utils/elearningStore';
import WebsiteMessagesTab from '../components/WebsiteMessagesTab';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaError, setMediaError] = useState('');
  const [mediaSection, setMediaSection] = useState('gallery');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaCaption, setMediaCaption] = useState('');
  const [mediaCategory, setMediaCategory] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState('');
  const [activeView, setActiveView] = useState('content');
  const [type, setType] = useState('news');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(isSupabaseConfigured ? '' : 'Supabase is not configured for this deployment.');
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isAdmin || !isSupabaseConfigured) return undefined;
    let isActive = true;
    Promise.allSettled([loadSchoolUpdates(), loadSchoolMedia()])
      .then(([updatesResult, mediaResult]) => {
        if (!isActive) return;
        if (updatesResult.status === 'fulfilled') setItems(updatesResult.value);
        else {
          console.error('Failed to load school updates from Supabase:', updatesResult.reason);
          setError(updatesResult.reason.message || 'Could not load school updates.');
        }
        if (mediaResult.status === 'fulfilled') setMediaItems(mediaResult.value);
        else {
          console.error('Failed to load school media from Supabase:', mediaResult.reason);
          setMediaError(mediaResult.reason.message || 'Could not load school media. Run the school-media SQL setup.');
        }
      })
      .finally(() => { if (isActive) setLoading(false); });
    return () => { isActive = false; };
  }, [user?.id, user?.isAdmin]);

  if (!user?.isAdmin) return <Navigate to="/dos-login" replace />;

  const resetForm = () => {
    setType('news');
    setTitle('');
    setContent('');
    setEditingId(null);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setError('');
    try {
      if (editingId) {
        const updated = await updateSchoolUpdate(editingId, {
          type,
          title: title.trim(),
          content: content.trim(),
          isActive: items.find(item => item.id === editingId)?.isActive || false
        });
        setItems(current => current.map(item => item.id === editingId ? updated : item));
      } else {
        const created = await createSchoolUpdate({
          type,
          title: title.trim(),
          content: content.trim(),
          isActive: false
        }, user);
        setItems(current => [created, ...current]);
        if (type === 'announcement') {
          const activeAnnouncement = await setSchoolUpdateActive(created.id, true);
          setItems(current => current.map(item => item.id === created.id ? activeAnnouncement : item));
        }
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save school update:', error);
      setError(error.message || 'Failed to save content.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSchoolUpdate(id);
      setItems(current => current.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete school update:', error);
      setError(error.message || 'Could not delete content.');
    }
  };

  const handleMediaUpload = async (event) => {
    event.preventDefault();
    if (!mediaFile || !mediaTitle.trim()) return;
    setMediaBusy(true);
    setError('');
    try {
      const created = await uploadSchoolMedia(mediaFile, {
        section: mediaSection,
        title: mediaTitle,
        caption: mediaCaption,
        category: mediaCategory
      }, user);
      setMediaItems(current => [created, ...current]);
      setMediaTitle('');
      setMediaCaption('');
      setMediaCategory('');
      setMediaFile(null);
      event.target.reset();
    } catch (uploadError) {
      console.error('Failed to publish school media:', uploadError);
      setError(uploadError.message || 'Could not upload this media.');
    } finally {
      setMediaBusy(false);
    }
  };

  const handleMediaDelete = async (media) => {
    const confirmed = window.confirm(`Delete "${media.title}" from ${media.section === 'gallery' ? 'School Gallery' : 'Student Life'}? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingMediaId(media.id);
    setError('');
    try {
      await deleteSchoolMedia(media);
      setMediaItems(current => current.filter(item => item.id !== media.id));
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete this media.');
    } finally {
      setDeletingMediaId('');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const updated = await setSchoolUpdateActive(id, !currentStatus);
      setItems(current => current.map(item => ({
        ...item,
        ...(item.type === 'announcement' && !currentStatus ? { isActive: item.id === id } : {}),
        ...(item.id === id ? updated : {})
      })));
    } catch (error) {
      console.error('Failed to update announcement:', error);
      setError(error.message || 'Could not update announcement status.');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setType(item.type);
    setTitle(item.title);
    setContent(item.content);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pt-5 sm:p-6 md:p-8 md:pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-school-blue">Super Admin Portal</h1>
            <p className="text-slate-500">Manage shared News, Notices, and Announcements</p>
          </div>
          <button onClick={handleLogout} className="flex w-full sm:w-auto justify-center items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-bold transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>

        <div className="mb-6 flex gap-1 border-b border-slate-200" role="tablist" aria-label="Admin portal sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'content'}
            onClick={() => setActiveView('content')}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold ${activeView === 'content' ? 'border-school-green text-school-blue' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Newspaper size={17} /> Content & Media
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'messages'}
            onClick={() => setActiveView('messages')}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold ${activeView === 'messages' ? 'border-school-green text-school-blue' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Inbox size={17} /> Website Inbox
          </button>
        </div>

        {activeView === 'messages' ? <WebsiteMessagesTab /> : <>
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Content' : 'Add New Content'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Content Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-slate-300 rounded-md p-2">
                <option value="news">News</option>
                <option value="notice">Notice</option>
                <option value="announcement">Announcement (Header Marquee)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Content / Message</label>
              <textarea required rows="4" value={content} onChange={e => setContent(e.target.value)} className="w-full border border-slate-300 rounded-md p-2"></textarea>
            </div>
          </div>
          {error && <p role="alert" className="mb-4 text-sm font-semibold text-red-600">{error}</p>}
          <button type="submit" className="bg-school-blue text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
            {editingId ? <Save size={20} /> : <Plus size={20} />} {editingId ? 'Save Changes' : 'Publish Content'}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="ml-3 inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600"><X size={16} /> Cancel edit</button>}
        </form>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold">Published Content</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {loading && <p className="p-6 text-center text-slate-500">Loading shared content...</p>}
            {!loading && error && <p role="alert" className="p-6 text-center text-sm font-medium text-red-600">{error}</p>}
            {!loading && !error && items.length === 0 && <p className="p-6 text-slate-500 text-center">No content published yet.</p>}
            {!loading && items.map(item => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${
                      item.type === 'news' ? 'bg-blue-100 text-blue-700' :
                      item.type === 'notice' ? 'bg-amber-100 text-amber-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {item.type}
                    </span>
                    {item.type === 'announcement' && (
                      <span className={`text-[10px] font-bold ${item.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                        {item.isActive ? 'ACTIVE MARQUEE' : 'INACTIVE'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 truncate">{item.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mt-1">{item.content}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.type === 'announcement' && (
                    <button 
                      onClick={() => toggleActive(item.id, item.isActive)}
                      className={`p-2 rounded-lg transition-colors ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      title={item.isActive ? "Deactivate" : "Set as Active"}
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                  <button type="button" onClick={() => handleEdit(item)} className="p-2 text-school-blue hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <Edit3 size={20} />
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold">Gallery & Student Life Media</h2>
            <p className="text-sm text-slate-500 mt-1">Publish photos and videos to the public website.</p>
          </div>
          <form onSubmit={handleMediaUpload} className="p-6 border-b border-slate-100 space-y-4">
            {mediaError && <p role="alert" className="text-sm font-semibold text-amber-700">{mediaError} Apply `supabase/2026-10-school-media.sql` if this is an existing Supabase project.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block text-sm font-bold text-slate-700">
                Website area
                <select value={mediaSection} onChange={event => setMediaSection(event.target.value)} className="mt-1 w-full border border-slate-300 rounded-md p-2">
                  <option value="gallery">School Gallery</option>
                  <option value="student-life">Student Life</option>
                </select>
              </label>
              <label className="block text-sm font-bold text-slate-700">
                {mediaSection === 'gallery' ? 'Title' : 'Activity title'}
                <input required value={mediaTitle} onChange={event => setMediaTitle(event.target.value)} className="mt-1 w-full border border-slate-300 rounded-md p-2" placeholder={mediaSection === 'gallery' ? 'e.g. Science laboratory' : 'e.g. Debate Club'} />
              </label>
              {mediaSection === 'student-life' && (
                <label className="block text-sm font-bold text-slate-700">
                  Activity category
                  <input value={mediaCategory} onChange={event => setMediaCategory(event.target.value)} className="mt-1 w-full border border-slate-300 rounded-md p-2" placeholder="Club, Sports, Culture..." />
                </label>
              )}
              <label className="block text-sm font-bold text-slate-700">
                Caption or description
                <input value={mediaCaption} onChange={event => setMediaCaption(event.target.value)} className="mt-1 w-full border border-slate-300 rounded-md p-2" placeholder="A short description" />
              </label>
              <label className="block text-sm font-bold text-slate-700 md:col-span-2">
                Photo or video (up to 100 MB)
                <input required type="file" accept="image/*,video/*" onChange={event => setMediaFile(event.target.files?.[0] || null)} className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-bold file:text-slate-700" />
              </label>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-slate-500">Uploads appear on the selected public page immediately.</p>
              <button disabled={mediaBusy} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-school-blue px-5 py-2.5 font-bold text-white hover:bg-slate-800 disabled:opacity-60">
                {mediaSection === 'gallery' ? <ImagePlus size={18} /> : <Film size={18} />}
                {mediaBusy ? 'Uploading...' : 'Add media'}
                {!mediaBusy && <Upload size={16} />}
              </button>
            </div>
            {!isSupabaseConfigured && <p className="text-sm font-semibold text-amber-700">Connect Supabase and apply the school-media setup SQL before uploading.</p>}
          </form>
          <div className="divide-y divide-slate-100">
            {mediaItems.length === 0 && <p className="p-6 text-center text-slate-500">No media has been added yet.</p>}
            {mediaItems.map(media => (
              <div key={media.id} className="flex items-center gap-4 p-4 sm:p-5">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-slate-100">
                  {media.mediaType === 'video'
                    ? <video src={media.url} muted preload="metadata" className="h-full w-full object-cover" />
                    : <img src={media.url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-800">{media.title}</p>
                  <p className="text-xs text-slate-500">{media.section === 'gallery' ? 'School Gallery' : `Student Life${media.category ? ` · ${media.category}` : ''}`} · {media.mediaType}</p>
                  <p className="mt-1 text-xs font-bold text-green-700">Published</p>
                </div>
                <button type="button" onClick={() => handleMediaDelete(media)} disabled={deletingMediaId === media.id} className="rounded-md p-2 text-red-600 hover:bg-red-50 disabled:cursor-wait disabled:opacity-50" title="Delete media" aria-label={`Delete ${media.title}`}>
                  <Trash2 size={19} />
                </button>
              </div>
            ))}
          </div>
        </section>
        </>}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
