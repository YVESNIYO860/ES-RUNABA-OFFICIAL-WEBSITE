import React from 'react';
import { Facebook, MessageCircle, Mail, Phone, MapPin, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { siteContent } = useAuth();
  const branding = siteContent?.general || { schoolName: "ES RUNABA" };

  return (
    <footer className="bg-school-blue text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12">
          {/* School Info */}
          <div className="space-y-4 col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold mb-4">{branding.schoolName}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Empowering the next generation of leaders through quality education and character building in a supportive environment.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-school-green transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://wa.me/250783883046" target="_blank" rel="noopener noreferrer" className="hover:text-school-green transition-colors">
                <MessageCircle size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-school-green transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-school-green">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/academics" className="hover:text-white transition-colors">Academics</Link></li>
              <li><Link to="/student-life" className="hover:text-white transition-colors">School Life</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
            </ul>
          </div>

          {/* Academics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-school-green">Combinations</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Mathematics, Economics & Geography (MEG)</li>
              <li>Mathematics, Computer Science & Economics (MCE)</li>
              <li>Physics, Chemistry & Biology (PCB)</li>
              <li>Ordinary Level (O Level)</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-school-green">Contact Us</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-school-green mt-1 flex-shrink-0" />
                <span>{branding.contact?.location || "Burera, Butaro, Rwanda"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-school-green flex-shrink-0" />
                <span>{branding.contact?.phone || "+250 783 883 046"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-school-green flex-shrink-0" />
                <span>{branding.contact?.email || "info@esrunaba.edu"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {branding.schoolName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
