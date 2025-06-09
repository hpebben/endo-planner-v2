import React from 'react';

export default function InfectionGrade2(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <circle cx="12" cy="18" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
      <rect x="10" y="2" width="4" height="12" fill="none" stroke="currentColor" strokeWidth="2"/>
      <rect x="11" y="10" width="2" height="6" fill="currentColor"/>
      <circle cx="12" cy="18" r="3" fill="currentColor"/>
    </svg>
  );
}
