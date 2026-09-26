const makeOptions = (values, labelSuffix = '') => values.map((value) => ({
  value,
  label: `${value}${labelSuffix}`
}));

const scienceStreamOptions = (level) => [
  { value: `${level} Stream 1`, label: `${level} Stream 1 - Pure Sciences` },
  { value: `${level} Stream 2`, label: `${level} Stream 2 - Applied Sciences` }
];

const legacyScienceOptions = (level) => makeOptions([
  `${level} MEG`,
  `${level} MCE`,
  `${level} PCB`,
  `${level} Science Stream One`,
  `${level} Science Stream Two`
], ' (legacy record)');

export const schoolClassGroups = [
  { label: 'Senior 1-3', options: makeOptions(['Senior 1', 'Senior 2', 'Senior 3']) },
  { label: 'Senior 4 science streams', options: scienceStreamOptions('Senior 4') },
  { label: 'Senior 4 legacy classes', options: legacyScienceOptions('Senior 4') },
  { label: 'Senior 5 science streams', options: scienceStreamOptions('Senior 5') },
  { label: 'Senior 5 legacy classes', options: legacyScienceOptions('Senior 5') },
  { label: 'Senior 6 combinations', options: makeOptions(['Senior 6 MEG', 'Senior 6 MCE', 'Senior 6 PCB']) }
];

export const eLearningClassGroups = schoolClassGroups.filter((group) => !group.label.toLowerCase().includes('legacy'));