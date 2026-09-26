export const studentAuthEmail = (regNumber) => {
  const safeRegNumber = String(regNumber || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return safeRegNumber ? `student-${safeRegNumber}@students.esrunaba.org` : '';
};