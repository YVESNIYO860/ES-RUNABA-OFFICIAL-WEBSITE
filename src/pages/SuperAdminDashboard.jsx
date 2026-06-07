import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Trash2, Plus, LogOut, CheckCircle, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const [items, setItems] = useState([]);
  const [type, setType] = useState('news');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Basic protection (redirects if not logged in or wrong email)
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user || (user.email !== 'yvensiyonkuru2022@gmail.com' && user.email !== 'yvesniyonkuru2022@gmail.com')) {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    if (!db) return;
    try {
      const q = query(collection(db, 'content'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !content || !db) return;
    try {
      await addDoc(collection(db, 'content'), {
        type,
        title,
        content,
        isActive: type === 'announcement' ? true : false,
        createdAt: new Date().toISOString()
      });
      setTitle('');
      setContent('');
      fetchData();
    } catch (error) {
      console.error("Error adding document:", error);
      alert("Failed to add content.");
    }
  };

  const handleDelete = async (id) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'content', id));
      fetchData();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    if (!db) return;
    try {
      if (!currentStatus && type === 'announcement') {
        const announcements = items.filter(i => i.type === 'announcement' && i.isActive);
        for (let a of announcements) {
           await updateDoc(doc(db, 'content', a.id), { isActive: false });
        }
      }
      await updateDoc(doc(db, 'content', id), { isActive: !currentStatus });
      fetchData();
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-black text-school-blue">Super Admin Portal</h1>
            <p className="text-slate-500">Manage News, Notices, and Announcements</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-bold transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>

        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Content</h2>
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
          <button type="submit" className="bg-school-blue text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
            <Plus size={20} /> Publish Content
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold">Published Content</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {items.length === 0 && <p className="p-6 text-slate-500 text-center">No content published yet.</p>}
            {items.map(item => (
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
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
