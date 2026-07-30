const photoModules = import.meta.glob('../assets/school-photos/*.{jpg,jpeg,png,webp}', { eager: true, as: 'url' });
export const schoolPhotoUrls = Object.values(photoModules).map(String);

const defaultTitles = [
  'Welcome to ES RUNABA',
  'Our Beautiful Campus',
  'Academic Excellence',
  'Student Life',
  'Celebrating Success',
];

const defaultSubtitles = [
  'Where discipline and skill starts from. Started for deep learning and academic excellence.',
  'Nestled in the green hills of Burera — a peaceful haven for focused learning.',
  'Science, sports, and character development in a single school community.',
  'A vibrant campus culture of growth, leadership, and collaboration.',
  'Graduates ready to lead with confidence and compassion.',
];

const defaultColors = [
  'from-school-blue/80',
  'from-teal-900/80',
  'from-indigo-900/80',
  'from-emerald-900/80',
  'from-amber-900/80',
];

export const heroSlides = schoolPhotoUrls.slice(0, 5).map((src, index) => ({
  src,
  title: defaultTitles[index] || `School Photo ${index + 1}`,
  subtitle: defaultSubtitles[index] || 'Discover what makes our school special.',
  color: defaultColors[index] || 'from-school-blue/80',
}));
