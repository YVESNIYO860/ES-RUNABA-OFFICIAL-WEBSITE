import React from 'react';
import { normalizeSchoolName } from '../utils/translate';

/**
 * School name — never auto-translated (prevents "ES" → "IT'S" etc.)
 */
const SchoolBrand = ({ name, className = '', as: Tag = 'span', children, ...rest }) => {
  const text = normalizeSchoolName(children ?? name);

  return (
    <Tag className={`notranslate ${className}`} translate="no" lang="en" {...rest}>
      {text}
    </Tag>
  );
};

export default SchoolBrand;
