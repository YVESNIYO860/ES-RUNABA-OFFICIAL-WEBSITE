export const generateStudentRegistrationNumber = (fullName, startYear, students = []) => {
  const year = Number(startYear);
  if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear()) return '';

  const nameLetters = String(fullName || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/gi, '')
    .toUpperCase();
  if (!nameLetters) return '';

  const prefix = `${String(year).slice(-2)}${nameLetters.slice(0, 3).padEnd(3, 'X')}`;
  const nextNumber = students.reduce((highest, student) => {
    const match = String(student.regNumber || '').match(new RegExp(`^${prefix}(\\d{2})$`));
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0) + 1;

  return nextNumber <= 99 ? `${prefix}${String(nextNumber).padStart(2, '0')}` : '';
};