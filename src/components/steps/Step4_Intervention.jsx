// src/components/steps/Step4_Intervention.jsx
import React, { useState, useEffect } from 'react';
import { CheckboxControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const interventionOptions = [
  { key: 'angioplasty', label: __( 'Balloon Angioplasty', 'endoplanner' ) },
  { key: 'stenting',    label: __( 'Stent Placement', 'endoplanner' ) },
  { key: 'atherectomy', label: __( 'Atherectomy', 'endoplanner' ) },
  { key: 'bypass',      label: __( 'Bypass Surgery', 'endoplanner' ) },
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
      <h3>{ __( '4. Intervention Planning', 'endoplanner' ) }</h3>
      {interventionOptions.map((opt) => (
        <CheckboxControl
          key={opt.key}
          label={opt.label}
          checked={selected.includes(opt.key)}
          onChange={(checked) => onToggle(opt.key, checked)}
        />
      ))}

      <TextareaControl
        label={ __( 'Additional Notes', 'endoplanner' ) }
        value={notes}
        onChange={(val) => setNotes(val)}
        help={ __( 'E.g. device preferences, access site, etc.', 'endoplanner' ) }
      />
    </div>
  );
}
