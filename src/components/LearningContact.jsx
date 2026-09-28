import { Mail, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LearningContact = () => {
  const { siteContent } = useAuth();
  const school = siteContent?.general;
  const contact = school?.contact || {};

  const details = [
    { label: 'Phone', value: contact.phone, href: contact.phone ? `tel:${contact.phone.replace(/\s/g, '')}` : null, icon: Phone },
    { label: 'Email', value: contact.email, href: contact.email ? `mailto:${contact.email}` : null, icon: Mail },
    { label: 'Location', value: contact.location, icon: MapPin }
  ].filter(detail => detail.value);

  return (
    <section className="space-y-6" aria-labelledby="learning-contact-heading">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-school-green">E-Learning Support</p>
        <h2 id="learning-contact-heading" className="mt-1 text-2xl font-bold text-school-blue">Contact {school?.schoolName || 'ES RUNABA'}</h2>
        <p className="mt-2 text-sm text-slate-600">Reach the school administration for help with your learning account or other questions.</p>
      </div>

      <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
        {details.map(detail => (
          <div key={detail.label} className="flex items-start gap-4 px-4 py-5 sm:px-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-school-blue">
              <detail.icon size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900">{detail.label}</h3>
              {detail.href ? (
                <a href={detail.href} className="mt-1 block break-words text-sm text-school-blue hover:text-school-green">{detail.value}</a>
              ) : (
                <p className="mt-1 text-sm text-slate-600">{detail.value}</p>
              )}
            </div>
          </div>
        ))}
        {details.length === 0 && <p className="px-4 py-5 text-sm text-slate-500 sm:px-6">Contact details are not available right now.</p>}
      </div>
    </section>
  );
};

export default LearningContact;