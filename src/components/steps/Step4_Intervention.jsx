// src/components/steps/Step4_Intervention.jsx
import React, { useState, useEffect } from 'react';
import { CheckboxControl, TextareaControl } from '@wordpress/components';

const interventionOptions = [
  { key: 'angioplasty', label: 'Balloon Angioplasty' },
  { key: 'stenting',    label: 'Stent Placement' },
  { key: 'atherectomy', label: 'Atherectomy' },
  { key: 'bypass',      label: 'Bypass Surgery' },
  // …add more as needed
];

export default function Step4({ data, setData }) {
  const [ selected, setSelected ] = useState(data.interventions || []);
  const [ notes, setNotes ] = useState(data.interventionNotes || '');

  useEffect(() => {
    setData({ ...data, interventions: selected, interventionNotes: notes });
  }, [selected, notes]);

  const onToggle = (key, isChecked) => {
    setSelected((prev) =>
      isChecked ? [...prev, key] : prev.filter((k) => k !== key)
    );
  };

  return (
    <div className="step4-intervention">
      <h3>4. Intervention Planning</h3>
      {interventionOptions.map((opt) => (
        <CheckboxControl
          key={opt.key}
          label={opt.label}
          checked={selected.includes(opt.key)}
          onChange={(checked) => onToggle(opt.key, checked)}
        />
      ))}

      <TextareaControl
        label="Additional Notes"
        value={notes}
        onChange={(val) => setNotes(val)}
        help="E.g. device preferences, access site, etc."
      />
    </div>
  );
}
