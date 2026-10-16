import React, { useRef, useState } from 'react';
import { ImagePlus, Plus, Upload, X } from 'lucide-react';
import { isSupabaseConfigured, uploadSchoolMedia } from '../utils/elearningStore';

const SchoolMediaUploader = ({ section, user, onUploaded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInput = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file || !title.trim()) return;
    setIsUploading(true);
    setError('');
    try {
      const media = await uploadSchoolMedia(file, { section, title, category, caption }, user);
      onUploaded(media);
      setTitle('');
      setCategory('');
      setCaption('');
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      setIsOpen(false);
    } catch (uploadError) {
      setError(uploadError.message || 'Could not upload this media.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-8 border-y border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">{section === 'gallery' ? 'School Gallery' : 'Student Life'} media</p>
        <button
          type="button"
          onClick={() => { setIsOpen(open => !open); setError(''); }}
          aria-expanded={isOpen}
          className="inline-flex items-center gap-2 rounded-md bg-school-blue px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          {isOpen ? <X size={17} /> : <Plus size={17} />}
          {isOpen ? 'Close' : 'Add image or video'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-semibold text-slate-700">
            {section === 'gallery' ? 'Title' : 'Activity title'}
            <input required value={title} onChange={event => setTitle(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder={section === 'gallery' ? 'e.g. Science laboratory' : 'e.g. Debate Club'} />
          </label>
          {section === 'student-life' && (
            <label className="text-sm font-semibold text-slate-700">
              Category
              <input value={category} onChange={event => setCategory(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Club, Sports, Culture..." />
            </label>
          )}
          <label className="text-sm font-semibold text-slate-700">
            Caption
            <input value={caption} onChange={event => setCaption(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Short description" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Photo or video
            <input ref={fileInput} required type="file" accept="image/*,video/*" onChange={event => setFile(event.target.files?.[0] || null)} className="mt-1 block w-full text-xs file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-bold file:text-slate-700" />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 lg:col-span-4">
            <p className="text-xs text-slate-500">Images and videos up to 100 MB are published immediately.</p>
            <button disabled={!isSupabaseConfigured || isUploading || !file || !title.trim()} type="submit" className="inline-flex items-center gap-2 rounded-md bg-school-green px-4 py-2 text-sm font-bold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">
              {section === 'gallery' ? <ImagePlus size={17} /> : <Upload size={17} />}
              {isUploading ? 'Uploading...' : 'Publish media'}
            </button>
          </div>
          {!isSupabaseConfigured && <p className="text-sm font-medium text-amber-700 sm:col-span-2 lg:col-span-4">Supabase is not configured for media uploads.</p>}
          {error && <p role="alert" className="text-sm font-semibold text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
        </form>
      )}
    </div>
  );
};

export default SchoolMediaUploader;