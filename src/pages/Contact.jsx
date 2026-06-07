import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Contact = () => {
  const { siteContent } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  if (!siteContent) return <div className="min-h-screen bg-slate-50"></div>;
  const branding = siteContent.general;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 5000);
  };

  // Ensure scroll to form if hash is present
  React.useEffect(() => {
    if (window.location.hash === '#contact-form') {
      const el = document.getElementById('contact-form');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[55vh] min-h-[400px] flex items-center justify-center overflow-hidden">
         {/* Fixed Background Image */}
         <div 
           className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577563908411-5079b6a1d824?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-fixed"
         />
         {/* Minimal Clarity Overlay */}
         <div className="absolute inset-0 bg-black/30" />
         
         <div className="relative z-10 text-center text-white px-4">
             <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
             >
                 <MessageSquare size={32} className="text-white" />
             </motion.div>
             <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black mb-6 text-white drop-shadow-2xl italic tracking-tighter"
             >
                 Contact Us
             </motion.h1>
             <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-100 max-w-2xl mx-auto font-light drop-shadow-lg"
             >
                 We are here to help. Reach out for inquiries, admissions, or any feedback.
             </motion.p>
         </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">Get In Touch</h2>
            <p className="text-slate-600 leading-relaxed text-lg font-light">
              Visit our school or use the details below to contact our administration office during working hours (8:00 AM - 5:00 PM).
            </p>

            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-5 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-school-blue/30 transition-colors">
                <div className="p-3 bg-school-blue/10 text-school-blue rounded-xl shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Our Location</h4>
                  <p className="text-slate-500">{branding.contact.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-5 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-school-green/30 transition-colors">
                <div className="p-3 bg-school-green/10 text-school-green rounded-xl shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Phone Numbers</h4>
                  <p className="text-slate-500">+250 783 883 046</p>
                </div>
              </div>

              <div className="flex items-start gap-5 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-amber-500/30 transition-colors">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Email Address</h4>
                  <p className="text-slate-500">{branding.contact.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2" id="contact-form">
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-school-blue/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

              {isSubmitted ? (
                <div className="py-24 text-center space-y-6 animate-in zoom-in duration-500">
                  <div className="flex justify-center text-school-green">
                    <CheckCircle2 size={80} className="drop-shadow-sm" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800">Message Sent Successfully!</h3>
                  <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed">
                    Thank you for reaching out to {branding.schoolName}. We have received your message and will get back to you shortly.
                  </p>
                  <div className="pt-6">
                      <button onClick={() => setIsSubmitted(false)} className="text-school-blue font-bold hover:underline">Send another message</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <h3 className="text-2xl font-bold text-slate-800 mb-8">Send us a Message</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Your Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Jean Doe"
                        className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-school-blue focus:ring-4 focus:ring-school-blue/10 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="e.g. jean@example.com"
                        className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-school-blue focus:ring-4 focus:ring-school-blue/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Subject</label>
                    <input 
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="How can we help you?"
                      className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-school-blue focus:ring-4 focus:ring-school-blue/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Your Message</label>
                    <textarea 
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Type your message here..."
                      className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-school-blue focus:ring-4 focus:ring-school-blue/10 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 mt-4 group">
                    Send Message <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-20">
        <div className="w-full bg-slate-900 rounded-[2rem] overflow-hidden relative shadow-2xl border-t-8 border-school-blue/20">
          <div className="p-8 bg-white/5 backdrop-blur-md flex justify-between items-center border-b border-white/10 relative z-10">
             <div>
                <p className="font-black text-white text-2xl tracking-tighter italic uppercase">SCHOOL LOCATION</p>
                <p className="text-sm text-school-green font-bold tracking-widest uppercase mt-1">Runaba Sector, Burera District</p>
             </div>
             <a 
               href="https://www.google.com/maps/place/Ecole+Secondaire+Runaba/@-1.4002063,29.8418217,21z/data=!4m6!3m5!1s0x19dc692897897feb:0x3f3fd6d029f8cedf!8m2!3d-1.4002056!4d29.8419759!16s%2Fg%2F11ss5c38gz" 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-school-blue text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2"
             >
                Open in Google Maps <MapPin size={18} />
             </a>
          </div>
          
          <div className="h-[550px] w-full relative">
            <iframe 
               src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1994.57!2d29.8418217!3d-1.4002063!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dc692897897feb%3A0x3f3fd6d029f8cedf!2sEcole%20Secondaire%20Runaba!5e0!3m2!1sen!2srw!4v1713366000000!5m2!1sen!2srw"
               width="100%" 
               height="100%" 
               style={{ border: 0 }} 
               allowFullScreen="" 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
               title="School Location Map"
               className="grayscale hover:grayscale-0 transition-all duration-700 brightness-90 hover:brightness-100"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
