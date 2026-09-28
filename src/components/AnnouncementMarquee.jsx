import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured, loadActiveAnnouncement } from '../utils/elearningStore';

/**
 * Scrolling notice text for the header announcement bar
 */
const AnnouncementMarquee = ({ text }) => {
  const [firestoreText, setFirestoreText] = useState('');

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!isSupabaseConfigured) return;
      try {
        setFirestoreText(await loadActiveAnnouncement());
      } catch (error) {
        console.error('Failed to load announcement from Supabase:', error);
      }
    };
    fetchAnnouncement();
  }, []);

  const message = firestoreText || text;

  if (!message?.trim()) return null;

  return (
    <div 
      className="announcement-marquee flex-1 min-w-0 overflow-hidden"
      aria-label="Important Announcement"
    >
      <div className="announcement-marquee-track">
        <span className="announcement-marquee-item">{message}</span>
        <span className="announcement-marquee-item" aria-hidden="true">
          {message}
        </span>
        <span className="announcement-marquee-item" aria-hidden="true">
          {message}
        </span>
      </div>
    </div>
  );
};

export default AnnouncementMarquee;
