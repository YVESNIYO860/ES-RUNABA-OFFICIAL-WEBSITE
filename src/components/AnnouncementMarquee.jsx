import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Scrolling notice text for the header announcement bar
 */
const AnnouncementMarquee = ({ text }) => {
  const [firestoreText, setFirestoreText] = useState('');

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!db) return;
      try {
        const q = query(collection(db, 'content'), where('type', '==', 'announcement'), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
           setFirestoreText(querySnapshot.docs[0].data().content);
        }
      } catch (error) {
        console.error("Error fetching announcement:", error);
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
