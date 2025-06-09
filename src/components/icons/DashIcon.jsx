import React from 'react';

export default function DashIcon({ name, className = '' }) {
  return <span className={`dashicons dashicons-${name} ${className}`}></span>;
}
