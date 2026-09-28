import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Trash2, Plus, LogOut, CheckCircle, Save, Edit3, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createSchoolUpdate, deleteSchoolUpdate, isSupabaseConfigured, loadSchoolUpdates, setSchoolUpdateActive, updateSchoolUpdate } from '../utils/elearningStore';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [items, setItems] = useState([]);
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
    loadSchoolUpdates()
      .then(data => { if (isActive) setItems(data); })
      .catch(loadError => {
        console.error('Failed to load school updates from Supabase:', loadError);
        if (isActive) setError(loadError.message || 'Could not load school updates.');
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
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-school-blue">Super Admin Portal</h1>
            <p className="text-slate-500">Manage shared News, Notices, and Announcements</p>
          </div>
          <button onClick={handleLogout} className="flex w-full sm:w-auto justify-center items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-bold transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>

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
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
