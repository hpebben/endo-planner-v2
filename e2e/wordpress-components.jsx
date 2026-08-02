import React from 'react';

export function ProgressBar({ value = 0 }) {
  return <progress aria-label="Progress" max="1" value={value} />;
}

export function SelectControl({ label, value = '', options = [], onChange }) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function RangeControl({ label, value, min, max, step, onChange }) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function Button({ children, ...props }) {
  return <button type="button" {...props}>{children}</button>;
}

export function Modal({ title, children, onRequestClose }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title}>
      <h2>{title}</h2>
      {children}
      <button type="button" onClick={onRequestClose}>Close</button>
    </div>
  );
}

export function Tooltip({ children }) {
  return typeof children === 'function' ? children({}) : children;
}
