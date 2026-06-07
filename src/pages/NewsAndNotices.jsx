import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { Calendar, Bell, Info } from 'lucide-react';

const NewsAndNotices = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      if (!db) {
         setLoading(false);
         return;
      }
      try {
        const q = query(collection(db, 'content'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data.filter(d => d.type === 'news' || d.type === 'notice'));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter);

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-school-green font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Stay Updated</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-2 tracking-tight">News & Notices</h1>
          <div className="w-24 h-1.5 bg-school-green mx-auto mt-6 shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          <button onClick={() => setFilter('all')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${filter === 'all' ? 'bg-school-blue text-white shadow-md' : 'bg-white text-slate-500 border hover:border-school-blue'}`}>All</button>
          <button onClick={() => setFilter('news')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${filter === 'news' ? 'bg-school-blue text-white shadow-md' : 'bg-white text-slate-500 border hover:border-school-blue'}`}>News</button>
          <button onClick={() => setFilter('notice')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${filter === 'notice' ? 'bg-school-blue text-white shadow-md' : 'bg-white text-slate-500 border hover:border-school-blue'}`}>Notices</button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading latest updates...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Info className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-700">No updates yet</h3>
            <p className="text-slate-500 mt-2">Check back later for news and notices.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-shadow relative overflow-hidden group"
              >
                <div className={`absolute top-0 left-0 w-2 h-full ${item.type === 'news' ? 'bg-school-blue' : 'bg-school-green'}`}></div>
                <div className="flex items-center gap-3 mb-4">
                  {item.type === 'news' ? (
                     <div className="w-10 h-10 rounded-full bg-school-blue/10 text-school-blue flex items-center justify-center"><Info size={18} /></div>
                  ) : (
                     <div className="w-10 h-10 rounded-full bg-school-green/10 text-school-green flex items-center justify-center"><Bell size={18} /></div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{item.type}</span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Calendar size={12} />
                      {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">{item.title}</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsAndNotices;
