import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Plus, Upload, X } from 'lucide-react';
import { createSchoolMediaAlbum, isSupabaseConfigured, loadSchoolMediaAlbums, uploadSchoolMedia } from '../utils/elearningStore';

const SchoolMediaUploader = ({ section, user, onUploaded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [albumChoice, setAlbumChoice] = useState('new');
  const [albums, setAlbums] = useState([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInput = useRef(null);
  const selectedAlbum = albums.find(album => albumChoice === `existing:${album.id}`);

  useEffect(() => {
    if (!isOpen || !isSupabaseConfigured) return undefined;
    let isActive = true;
    setIsLoadingAlbums(true);
    loadSchoolMediaAlbums(section)
      .then(data => { if (isActive) setAlbums(data); })
      .catch(loadError => {
        if (isActive) setError(loadError.message || 'Could not load albums. Run the school-media SQL setup.');
      })
      .finally(() => { if (isActive) setIsLoadingAlbums(false); });
    return () => { isActive = false; };
  }, [isOpen, section]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const albumName = albumChoice === 'new' ? newAlbumName.trim() : selectedAlbum?.name;
    const mediaTitle = section === 'student-life' ? albumName : title.trim();
    if (!file || !mediaTitle || !albumName || (albumChoice !== 'new' && !selectedAlbum)) return;
    setIsUploading(true);
    setError('');
    try {
      const album = selectedAlbum || await createSchoolMediaAlbum({
        section,
        name: albumName,
        category: section === 'student-life' ? category : ''
      }, user);
      setAlbums(current => [album, ...current.filter(item => item.id !== album.id)]);
      setAlbumChoice(`existing:${album.id}`);
      const media = await uploadSchoolMedia(file, {
        section,
        albumId: album.id,
        albumName: album.name,
        title: mediaTitle,
        category: album.category || category,
        caption
      }, user);
      onUploaded(media);
      setNewAlbumName('');
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
            Album
            <select value={albumChoice} onChange={event => setAlbumChoice(event.target.value)} disabled={isLoadingAlbums || isUploading} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              <option value="new">Create new album</option>
              {albums.map(album => <option key={album.id} value={`existing:${album.id}`}>Add to: {album.name}</option>)}
            </select>
          </label>
          {albumChoice === 'new' && (
            <label className="text-sm font-semibold text-slate-700">
              {section === 'student-life' ? 'New activity / album name' : 'New album name'}
              <input required value={newAlbumName} onChange={event => setNewAlbumName(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="e.g. 2026 Sports Day" />
            </label>
          )}
          {section === 'gallery' && (
            <label className="text-sm font-semibold text-slate-700">
              Image/video title
              <input required value={title} onChange={event => setTitle(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="e.g. Science laboratory" />
            </label>
          )}
          {section === 'student-life' && selectedAlbum && (
            <p className="self-end pb-2 text-sm font-semibold text-slate-600">{selectedAlbum.name} · {selectedAlbum.category}</p>
          )}
          {section === 'student-life' && albumChoice === 'new' && (
            <label className="text-sm font-semibold text-slate-700">
              Activity category
              <input required value={category} onChange={event => setCategory(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Club, Sports, Culture..." />
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
            <button disabled={!isSupabaseConfigured || isLoadingAlbums || isUploading || !file || (section === 'gallery' && !title.trim()) || (albumChoice === 'new' && (!newAlbumName.trim() || (section === 'student-life' && !category.trim()))) || (albumChoice !== 'new' && !selectedAlbum)} type="submit" className="inline-flex items-center gap-2 rounded-md bg-school-green px-4 py-2 text-sm font-bold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">
              {section === 'gallery' ? <ImagePlus size={17} /> : <Upload size={17} />}
              {isUploading ? 'Uploading...' : 'Publish media'}
            </button>
          </div>
          {isLoadingAlbums && <p className="text-sm text-slate-500 sm:col-span-2 lg:col-span-4">Loading albums...</p>}
          {!isSupabaseConfigured && <p className="text-sm font-medium text-amber-700 sm:col-span-2 lg:col-span-4">Supabase is not configured for media uploads.</p>}
          {error && <p role="alert" className="text-sm font-semibold text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
        </form>
      )}
    </div>
  );
};

export default SchoolMediaUploader;