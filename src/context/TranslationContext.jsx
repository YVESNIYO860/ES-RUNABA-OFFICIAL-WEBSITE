import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const TranslationContext = createContext(null);

const translations = {
  EN: {
    home: 'Home',
    about: 'About',
    academics: 'Academics',
    schoolLife: 'School Life',
    gallery: 'Gallery',
    contact: 'Contact',
    elearning: 'E-learning',
    eLearningPortal: 'E-learning Portal',
    darkTheme: 'Dark theme',
    lightTheme: 'Light theme',
    connect: 'Connect:',
    selectLanguage: 'Select language',
    english: 'English',
    french: 'Français',
    kinyarwanda: 'Kinyarwanda',
    staffLogin: 'Staff Login',
    adminAccess: 'Admin Access',
    homeHeroSlides: [
      {
        title: 'WELCOME TO ES RUNABA',
        subtitle: 'Where discipline and skill starts from. Started for deep learning and academic excellence.',
        color: 'from-school-blue/80'
      },
      {
        title: 'Thriving Sports Culture',
        subtitle: 'We nurture champions on and off the field — discipline, teamwork, and fun.',
        color: 'from-emerald-900/80'
      },
      {
        title: 'State-of-the-Art Labs',
        subtitle: 'Science & ICT laboratories equipped to spark curiosity and innovation.',
        color: 'from-indigo-900/80'
      },
      {
        title: 'Celebrating Success',
        subtitle: 'Proud graduates who carry the RUNABA spirit into university and beyond.',
        color: 'from-amber-900/80'
      },
      {
        title: 'Our Beautiful School',
        subtitle: 'Nestled in the green hills of Burera — a peaceful haven for focused learning.',
        color: 'from-teal-900/80'
      }
    ],
    homeHeroButton1: 'Explore {schoolName}',
    homeHeroButton2: 'Discover Programs',
    homeHighlightsHeading1: 'Quality Academics',
    homeHighlightsText1: 'Offering both O-Level and specialized A-Level combinations with experienced and dedicated tutors.',
    homeHighlightsHeading2: 'Vibrant Community',
    homeHighlightsText2: 'A diverse and inclusive environment where every student has the chance to belong and thrive.',
    homeHighlightsHeading3: 'Success Path',
    homeHighlightsText3: "We take deep pride in our students' national exam performance and extra-curricular victories.",
    homeLegacyTitle: 'A Legacy of Excellence',
    homeLegacyText1: 'Discover a campus where tradition meets innovation, preparing students for a limitless future.',
    homeLegacyText2: 'At {schoolName}, we build a supportive environment where every learner feels encouraged to explore, grow, and achieve.',
    homeDiscoverSchool: 'Discover {schoolName}',
    homeReadFullStory: 'Read Our Full Story',
    homeCommunityTag: 'Voices of Success',
    homeCommunityTitle: 'Our Community Story',
    homeShareStory: 'Want to share your story? Contact us to be featured here.',
    homeFutureReadyTag: 'Future Ready',
    homeMissionTitle: 'Ready to Start Your Journey?',
    homeMissionDesc: 'Join the {schoolName} family and build a foundation for lifelong success.',
    homeApplyNow: 'Apply Now',
    aboutHeroTitle: 'About {schoolName}',
    aboutHeroSubtitle: 'Ora Pro Nobis',
    aboutLegacyHeading: 'Our Legacy of Excellence',
    aboutLegacyText1: 'ES RUNABA stands as a beacon of academic excellence in the region. Founded in 2003 with a vision to transform lives through quality education, our institution has evolved into a prestigious center for holistic development, guided by visionary leadership.',
    aboutLegacyText2: 'At {schoolName}, we pride ourselves on our strong integration with the community. We work closely with parents and local leaders to create a conducive environment for learning, where every student is valued, respected, and supported in their unique educational journey.',
    aboutSchoolInAction: 'School in Action',
    aboutActionHeading: 'Where Theory Meets Hands-On Innovation',
    aboutActionText: 'At ES RUNABA, we don\'t just teach from textbooks. Our world-class laboratories and ICT facilities are active hubs where students experiment, fail, refine, and eventually master the skills of the future.',
    aboutMissionHeading: 'Our Mission',
    aboutMissionText: 'To provide a holistic learning experience that encourages creativity, critical thinking, and innovation, empowering students to become leaders who influence positive change.',
    aboutVisionHeading: 'Our Vision',
    aboutVisionText: 'To be a premier educational institution recognized for shaping well-rounded individuals capable of contributing meaningfully to society and global development.',
    aboutHistoryTitle: 'Our History',
    aboutJourneyTitle: 'The Journey Continues...',
    academicsHeroTitle: 'Academic Excellence',
    academicsHeroSubtitle: 'Rigorous programs designed to prepare students for national exams and university.',
    academicsOLevelTitle: 'Ordinary Level (O-Level)',
    academicsOLevelText: 'Our O-Level program (Senior 1 to Senior 3) follows the national curriculum, emphasizing a broad foundation in sciences, humanities, and languages.',
    academicsFocusHeading: 'Focus on Fundamentals',
    academicsFocusText: 'We ensure our students master the basics before specializing in A-Level. A strong foundation builds a skyscraper.',
    academicsSpecializationsTag: 'Specializations',
    academicsSectionTitle: 'Academic Combinations',
    academicsCoreSubjects: 'Core Subjects',
    academicsFacilitiesHeading: 'World-Class Facilities',
    academicsFacilitiesTitle: 'Modern Learning Environment',
    academicsFacilitiesText: 'Our school is equipped with specialized Science and ICT laboratories, providing students with the hands-on experience necessary to excel in the digital age.',
    contactHeroTitle: 'Contact Us',
    contactHeroSubtitle: 'We are here to help. Reach out for inquiries, admissions, or any feedback.',
    contactGetInTouch: 'Get In Touch',
    contactVisitText: 'Visit our school or use the details below to contact our administration office during working hours (8:00 AM - 5:00 PM).',
    contactLocationTitle: 'Our Location',
    contactPhoneTitle: 'Phone Numbers',
    contactEmailTitle: 'Email Address',
    contactSendMessageTitle: 'Send us a Message',
    contactMessageSent: 'Message Sent Successfully!',
    contactThankYou: 'Thank you for reaching out to {schoolName}. We have received your message and will get back to you shortly.',
    contactSendAnother: 'Send another message',
    contactYourName: 'Your Name',
    contactEmailAddressLabel: 'Email Address',
    contactSubjectLabel: 'Subject',
    contactYourMessageLabel: 'Your Message',
    contactPlaceholderSubject: 'How can we help you?',
    contactPlaceholderMessage: 'Type your message here...',
    contactOpenMap: 'Open in Google Maps',
    contactSchoolLocation: 'SCHOOL LOCATION',
    studentLifeHeroTitle: 'Student Life',
    studentLifeHeroSubtitle: 'Exploring the vibrant clubs, sports, and culture at {schoolName}',
    studentLifeActivitiesTitle: 'Clubs & Activities',
    studentLifeGalleryNote: 'Click on any card to open a full photo gallery',
    staffLogin: 'Staff Login',
    adminAccess: 'Admin Access'
  },
  FR: {
    home: 'Accueil',
    about: 'À propos',
    academics: 'Programmes',
    schoolLife: 'Vie scolaire',
    gallery: 'Galerie',
    contact: 'Contact',
    elearning: 'E-learning',
    eLearningPortal: 'Portail E-learning',
    darkTheme: 'Mode sombre',
    lightTheme: 'Mode clair',
    connect: 'Connexion :',
    selectLanguage: 'Langue',
    english: 'Anglais',
    french: 'Français',
    kinyarwanda: 'Kinyarwanda',
    staffLogin: 'Connexion personnel',
    adminAccess: 'Accès administrateur',
    homeHeroSlides: [
      {
        title: 'BIENVENUE À ES RUNABA',
        subtitle: 'Là où la discipline et les compétences commencent. Créé pour l’apprentissage approfondi et l’excellence académique.',
        color: 'from-school-blue/80'
      },
      {
        title: 'Culture sportive dynamique',
        subtitle: 'Nous nourrissons des champions sur et en dehors du terrain — discipline, travail d’équipe et plaisir.',
        color: 'from-emerald-900/80'
      },
      {
        title: 'Laboratoires de pointe',
        subtitle: 'Laboratoires de sciences et d’informatique conçus pour susciter la curiosité et l’innovation.',
        color: 'from-indigo-900/80'
      },
      {
        title: 'Célébrer la réussite',
        subtitle: 'Des diplômés fiers qui portent l’esprit RUNABA à l’université et au-delà.',
        color: 'from-amber-900/80'
      },
      {
        title: 'Notre belle école',
        subtitle: 'Nichée dans les collines verdoyantes de Burera — un havre paisible pour un apprentissage concentré.',
        color: 'from-teal-900/80'
      }
    ],
    homeHeroButton1: 'Découvrir {schoolName}',
    homeHeroButton2: 'Programmes',
    homeHighlightsHeading1: 'Excellence académique',
    homeHighlightsText1: 'Offrant à la fois des combinaisons O-Level et A-Level spécialisées avec des tuteurs expérimentés et dévoués.',
    homeHighlightsHeading2: 'Communauté vibrante',
    homeHighlightsText2: 'Un environnement diversifié et inclusif où chaque élève a la chance d’appartenir et de s’épanouir.',
    homeHighlightsHeading3: 'Parcours de réussite',
    homeHighlightsText3: 'Nous sommes très fiers des performances de nos élèves aux examens nationaux et des victoires parascolaires.',
    homeLegacyTitle: 'Une histoire d’excellence',
    homeLegacyText1: 'Découvrez un campus où la tradition rencontre l’innovation, préparant les élèves à un avenir sans limites.',
    homeLegacyText2: 'À {schoolName}, nous construisons un environnement de soutien où chaque apprenant est encouragé à explorer, grandir et réussir.',
    homeDiscoverSchool: 'Découvrez {schoolName}',
    homeReadFullStory: 'Lire notre histoire complète',
    homeCommunityTag: 'Voix du succès',
    homeCommunityTitle: 'L’histoire de notre communauté',
    homeShareStory: 'Vous souhaitez partager votre histoire ? Contactez-nous pour être présenté ici.',
    homeFutureReadyTag: 'Prêt pour l’avenir',
    homeMissionTitle: 'Prêt à commencer votre parcours ?',
    homeMissionDesc: 'Rejoignez la famille {schoolName} et construisez une base pour une réussite à vie.',
    homeApplyNow: 'Postuler maintenant',
    aboutHeroTitle: 'À propos de {schoolName}',
    aboutHeroSubtitle: 'Ora Pro Nobis',
    aboutLegacyHeading: 'Notre histoire d’excellence',
    aboutLegacyText1: 'ES RUNABA est un phare d’excellence académique dans la région. Fondée en 2003 avec une vision de transformer les vies par une éducation de qualité, notre institution est devenue un centre prestigieux de développement holistique, guidé par un leadership visionnaire.',
    aboutLegacyText2: 'À {schoolName}, nous sommes fiers de notre forte intégration avec la communauté. Nous travaillons en étroite collaboration avec les parents et les leaders locaux pour créer un environnement propice à l’apprentissage, où chaque élève est valorisé, respecté et soutenu dans son parcours éducatif unique.',
    aboutSchoolInAction: 'L’école en action',
    aboutActionHeading: 'Là où la théorie rencontre l\'innovation pratique',
    aboutActionText: 'À ES RUNABA, nous n\'enseignons pas seulement à partir de manuels. Nos laboratoires de classe mondiale et nos installations TIC sont des centres actifs où les élèves expérimentent, échouent, affinent et maîtrisent finalement les compétences de l\'avenir.',
    aboutMissionHeading: 'Notre mission',
    aboutMissionText: 'Offrir une expérience d’apprentissage holistique qui encourage la créativité, la pensée critique et l’innovation, permettant aux élèves de devenir des leaders qui influencent le changement positif.',
    aboutVisionHeading: 'Notre vision',
    aboutVisionText: 'Être une institution éducative de premier plan reconnue pour façonner des individus équilibrés capables de contribuer de manière significative à la société et au développement mondial.',
    aboutHistoryTitle: 'Notre histoire',
    aboutJourneyTitle: 'Le voyage continue...',
    academicsHeroTitle: 'Excellence académique',
    academicsHeroSubtitle: 'Des programmes rigoureux conçus pour préparer les élèves aux examens nationaux et à l’université.',
    academicsOLevelTitle: 'Niveau Ordinaire (O-Level)',
    academicsOLevelText: 'Notre programme O-Level (Senior 1 à Senior 3) suit le programme national, mettant l’accent sur une base solide en sciences, en lettres et en langues.',
    academicsFocusHeading: 'Concentration sur les fondamentaux',
    academicsFocusText: 'Nous veillons à ce que nos élèves maîtrisent les bases avant de se spécialiser en A-Level. Une base solide construit un gratte-ciel.',
    academicsSpecializationsTag: 'Spécialisations',
    academicsSectionTitle: 'Combinaisons académiques',
    academicsCoreSubjects: 'Sujets principaux',
    academicsFacilitiesHeading: 'Installations de classe mondiale',
    academicsFacilitiesTitle: 'Environnement d’apprentissage moderne',
    academicsFacilitiesText: 'Notre’école est équipée de laboratoires de sciences et d’informatique spécialisés, offrant aux élèves l’expérience pratique nécessaire pour exceller à l’ère numérique.',
    contactHeroTitle: 'Contactez-nous',
    contactHeroSubtitle: 'Nous sommes là pour vous aider. Contactez-nous pour des demandes, des admissions ou tout retour.',
    contactGetInTouch: 'Entrer en contact',
    contactVisitText: 'Visitez notre école ou utilisez les informations ci-dessous pour contacter notre bureau administratif pendant les heures d’ouverture (08h00 - 17h00).',
    contactLocationTitle: 'Notre emplacement',
    contactPhoneTitle: 'Numéros de téléphone',
    contactEmailTitle: 'Adresse e-mail',
    contactSendMessageTitle: 'Envoyez-nous un message',
    contactMessageSent: 'Message envoyé avec succès !',
    contactThankYou: 'Merci de nous avoir contactés, {schoolName}. Nous avons reçu votre message et vous répondrons bientôt.',
    contactSendAnother: 'Envoyer un autre message',
    contactYourName: 'Votre nom',
    contactEmailAddressLabel: 'Adresse e-mail',
    contactSubjectLabel: 'Sujet',
    contactYourMessageLabel: 'Votre message',
    contactPlaceholderSubject: 'Comment pouvons-nous vous aider ?',
    contactPlaceholderMessage: 'Tapez votre message ici...',
    contactOpenMap: 'Ouvrir dans Google Maps',
    contactSchoolLocation: 'EMPLACEMENT DE L’ÉCOLE',
    studentLifeHeroTitle: 'Vie étudiante',
    studentLifeHeroSubtitle: 'Explorer les clubs, les sports et la culture dynamiques à {schoolName}',
    studentLifeActivitiesTitle: 'Clubs et activités',
    studentLifeGalleryNote: 'Cliquez sur une carte pour ouvrir une galerie de photos complète'
  },
  RW: {
    home: 'Ahabanza',
    about: 'Ibyerekeye',
    academics: 'Amasomo',
    schoolLife: 'Ubuzima bw\'ishuri',
    gallery: 'Ibyumba',
    contact: 'Twandikire',
    elearning: 'E-learning',
    eLearningPortal: 'Porogaramu ya E-learning',
    darkTheme: 'Insanganyamatsiko yijimye',
    lightTheme: 'Insanganyamatsiko yoroshye',
    connect: 'Huhuze :',
    selectLanguage: 'Ururimi',
    english: 'Icyongereza',
    french: 'Igifaransa',
    kinyarwanda: 'Ikinyarwanda',
    staffLogin: 'Injira abakozi',
    adminAccess: 'Uruhushya rw\'uyobozi',
    homeHeroSlides: [
      {
        title: 'MURAKAZA NEZA MURI ES RUNABA',
        subtitle: 'Aho imyitwarire n\'ubushobozi bitangirira. Yashinzwe ngo hige byimbitse kandi habeho uburere bwiza.',
        color: 'from-school-blue/80'
      },
      {
        title: 'Umuryango w\'imikino ukura',
        subtitle: 'Turera intwari haba mu kibuga no hanze yacyo — imyifatire, gukorera mu itsinda n\'ibyishimo.',
        color: 'from-emerald-900/80'
      },
      {
        title: 'Laboratwari zigezweho',
        subtitle: 'Laboratwari z\'ubumenyi n\'ikoranabuhanga zateguwe kugirango zihere ibitekerezo n\'udushya.',
        color: 'from-indigo-900/80'
      },
      {
        title: 'Guhimbaza intsinzi',
        subtitle: 'Abarangije amashuri bishimiye gutwara umutima wa RUNABA bajyana muri kaminuza no hanze yayo.',
        color: 'from-amber-900/80'
      },
      {
        title: 'Ishuri ryacu ryiza',
        subtitle: 'Ryubatse mu misozi y\'icyatsi ya Burera — ahantu hatuje ho kwibanda ku masomo.',
        color: 'from-teal-900/80'
      }
    ],
    homeHeroButton1: 'Sura {schoolName}',
    homeHeroButton2: 'Menya porogaramu',
    homeHighlightsHeading1: 'Amasomo meza',
    homeHighlightsText1: 'Dutanga porogaramu za O-Level hamwe na A-Level zihariye hamwe n\'abarimu babigize umwuga kandi bitangiye.',
    homeHighlightsHeading2: 'Umuryango uvuguruzanya',
    homeHighlightsText2: 'Ibidukikije byuzuye itandukaniro aho buri mwana agira amahirwe yo kwiyumvamo no gutera imbere.',
    homeHighlightsHeading3: 'Inzira y\'intsinzi',
    homeHighlightsText3: 'Twishimira cyane uko abanyeshuri bacu bitwaye mu bizamini bya leta no mu mikino itandukanye.',
    homeLegacyTitle: 'Umurage w\'ubudasa',
    homeLegacyText1: 'Menya ishuri aho umuco uhuza n\'udushya, utegura abanyeshuri ejo hazaza hadafite imbago.',
    homeLegacyText2: 'Muri {schoolName}, twubaka ahantu ho gushyigikira aho buri wiga asabwa kugerageza, gukura no gutsinda.',
    homeDiscoverSchool: 'Menya {schoolName}',
    homeReadFullStory: 'Soma inkuru yose yacu',
    homeCommunityTag: 'Ijwi ry\'intsinzi',
    homeCommunityTitle: 'Inkuru y\'umuryango wacu',
    homeShareStory: 'Urashaka gusangiza inkuru yawe? Twandikire kugirango igaragazwe hano.',
    homeFutureReadyTag: 'Witeguye ejo hazaza',
    homeMissionTitle: 'Witeguye gutangira urugendo rwawe?',
    homeMissionDesc: 'Jya mu muryango wa {schoolName} kandi wubake umusingi wo gutsinda ubuzima bwose.',
    homeApplyNow: 'Saba ubu',
    aboutHeroTitle: 'Ibyerekeye {schoolName}',
    aboutHeroSubtitle: 'Ora Pro Nobis',
    aboutLegacyHeading: 'Umurage w\'ubudasa',
    aboutLegacyText1: 'ES RUNABA ni ikimenyetso cy\'ubudasa mu burezi mu karere. Yashinzwe mu 2003 ifite intego yo guhindura ubuzima binyuze mu burezi bufite ireme, ikaba yabaye ikigo cy\'icyubahiro mu iterambere rusange, kiyobowe n\'abantu bafite icyerekezo.',
    aboutLegacyText2: 'Muri {schoolName}, twishimira gufatanya bya hafi n\'umuryango. Dukorana n\'ababyeyi n\'abayobozi b\'aho kugirango duteze imbere ahantu heza ho kwiga, aho buri mwana yubahirizwa, yubahwa kandi ashyigikiwe mu rugendo rwe rwihariye rwo kwiga.',
    aboutSchoolInAction: 'Ishuri mu bikorwa',
    aboutActionHeading: 'Aho inyigisho zihura n\'ubuhanga bukorwa',
    aboutActionText: 'Muri ES RUNABA, ntitwigisha gusa dukurikije ibitabo. Laboratwari zacu zo mu rwego rwo hejuru hamwe n\'ibikoresho bya ICT ni ahantu hakorerwa ibikorwa aho abanyeshuri bigerageza, bananirwa, bagakosora, bityo bakarangiza bamenyera ubumenyi bw\'ahazaza.',
    aboutMissionHeading: 'Intego yacu',
    aboutMissionText: 'Gutanga uburere bufite ireme bubashishikariza ubuhanzi, gutekereza neza no guhanga udushya, butuma abanyeshuri baba abayobozi bazana impinduka nziza.',
    aboutVisionHeading: 'Icyerekezo cyacu',
    aboutVisionText: 'Kuba ikigo cy\'uburezi kizwi cyane mu gutegura abantu bafite ubushobozi bwo gutanga umusanzu ufatika mu muryango no mu iterambere mpuzamahanga.',
    aboutHistoryTitle: 'Amateka yacu',
    aboutJourneyTitle: 'Urugendo rurakomeza...',
    academicsHeroTitle: 'Ubudasa mu masomo',
    academicsHeroSubtitle: 'Porogaramu zikomeye zagenewe gutegura abanyeshuri ku bizamini bya leta na kaminuza.',
    academicsOLevelTitle: 'Urwego Rusanzwe (O-Level)',
    academicsOLevelText: 'Porogaramu yacu ya O-Level (Senior 1 kugeza Senior 3) ikurikiza gahunda y\'igihugu, ishyira imbere umusingi ukomeye mu bumenyi, ubumenyi bw\'isi, n\'indimi.',
    academicsFocusHeading: 'Gushyira imbaraga ku ngingo z’ingenzi',
    academicsFocusText: 'Turirinda ko abanyeshuri bacu babanza kumenya iby’ingenzi mbere yo kwiyongera muri A-Level. Umusingi ukomeye wubaka inyubako ndende.',
    academicsSpecializationsTag: 'Guhitamo byihariye',
    academicsSectionTitle: 'Imyitozo y\'amasomo',
    academicsCoreSubjects: 'Amasomo nyamukuru',
    academicsFacilitiesHeading: 'Ibikorwa by\'icyitegererezo',
    academicsFacilitiesTitle: 'Ibidukikije by\'igihugu kigisha neza',
    academicsFacilitiesText: 'Ishuri ryacu rifite laboratwari z\'ubumenyi na ICT byihariye, ritanga amahugurwa y\'ibikorwa ngiro akenewe kugirango abanyeshuri bazamure imikorere mu gihe cya digitale.',
    contactHeroTitle: 'Twandikire',
    contactHeroSubtitle: 'Turi hano kugirango tugufashe. Vugana natwe ku bibazo, kwandika, cyangwa ibitekerezo.',
    contactGetInTouch: 'Tuge',
    contactVisitText: 'Sura ishuri ryacu cyangwa ukoreshe amakuru ari hasi kugirango uvugane n\'ibiro byacu by\'ubuyobozi mu masaha yo gukorera (08:00 - 17:00).',
    contactLocationTitle: 'Aho turi',
    contactPhoneTitle: 'Imibare ya telefoni',
    contactEmailTitle: 'Aderesi ya E-mail',
    contactSendMessageTitle: 'Twandikire',
    contactMessageSent: 'Ubutumwa bwoherejwe neza!',
    contactThankYou: 'Murakoze kuduha ubutumwa, {schoolName}. Twakiriye ubutumwa bwawe kandi tuzagusubiza vuba.',
    contactSendAnother: 'Ohereza ubundi butumwa',
    contactYourName: 'Izina ryawe',
    contactEmailAddressLabel: 'Aderesi ya E-mail',
    contactSubjectLabel: 'Umwandiko',
    contactYourMessageLabel: 'Ubutumwa bwawe',
    contactPlaceholderSubject: 'Twagufasha dute?',
    contactPlaceholderMessage: 'Andika ubutumwa bwawe hano...',
    contactOpenMap: 'Fungura muri Google Maps',
    contactSchoolLocation: 'AHO ISHURI RIHEREREYE',
    studentLifeHeroTitle: 'Ubuzima bw\'ishuri',
    studentLifeHeroSubtitle: 'Gusuzuma clubs, siporo, n\'umuco ukora muri {schoolName}',
    studentLifeActivitiesTitle: 'Amasomo n\'ibikorwa',
    studentLifeGalleryNote: 'Kanda kuri buri karita kugirango ufungure galerie y\'amafoto yuzuye'
  }
};

const getLanguageCode = (lang) => {
  if (lang === 'FR') return 'fr';
  if (lang === 'RW') return 'rw';
  return 'en';
};

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('EN');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    const initialLanguage = savedLanguage && translations[savedLanguage] ? savedLanguage : 'EN';
    setLanguage(initialLanguage);
    document.documentElement.lang = getLanguageCode(initialLanguage);
  }, []);

  const updateLanguage = (nextLanguage) => {
    if (!translations[nextLanguage]) return;
    setLanguage(nextLanguage);
    localStorage.setItem('language', nextLanguage);
    document.documentElement.lang = getLanguageCode(nextLanguage);
  };

  const value = useMemo(() => ({
    language,
    setLanguage: updateLanguage,
    t: (key) => translations[language][key] || translations.EN[key] || key,
    translations: translations[language]
  }), [language]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};
