import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

const stageOptions = [
  { label: __( 'I Asymptomatic', 'endoplanner' ), value: 'i' },
  { label: __( 'IIa <100 m', 'endoplanner' ), value: 'iia' },
  { label: __( 'IIb >100 m', 'endoplanner' ), value: 'iib' },
  { label: __( 'III Rest Pain', 'endoplanner' ), value: 'iii' },
  { label: __( 'IV Ulcer/Gangrene', 'endoplanner' ), value: 'iv' },
];

const wifiDescriptions = {
  wound: {
    0: 'No ulcer or gangrene (ischemic pain at rest)',
    1: 'Small/superficial ulcer, no gangrene',
    2: 'Deep ulcer with exposed bone/joint ± digit gangrene',
    3: 'Extensive ulcer ± calcaneal involvement ± extensive gangrene',
  },
  ischemia: {
    0: 'ABI ≥0.8; SBP >100 mmHg; TP ≥60 mmHg',
    1: 'ABI 0.6–0.79; SBP 70–100 mmHg; TP 40–59 mmHg',
    2: 'ABI 0.4–0.59; SBP 50–70 mmHg; TP 30–39 mmHg',
    3: 'ABI ≤0.39; SBP <50 mmHg; TP <30 mmHg',
  },
  infection: {
    0: 'Uninfected',
    1: 'Mild local infection, erythema 0.5–2 cm',
    2: 'Moderate local infection, >2 cm or deeper tissue',
    3: 'Severe infection with SIRS',
  },
};

export default function Step1({ data, setData }) {
  const blockProps = useBlockProps({ className: 'clinical-center' });
  const values = {
    wound: Number(data.clinical?.wound ?? 0),
    ischemia: Number(data.clinical?.ischemia ?? 0),
    infection: Number(data.clinical?.infection ?? 0),
  };

  const onChangeSection = (key, newVal) => {
    setData({
      ...data,
      clinical: { ...data.clinical, [key]: newVal },
    });
  };

  return (
    <div {...blockProps}>
      <h3>Stage</h3>
      <p className="subtitle">Stage I–IV based on Fontaine classification</p>
      <div className="option-buttons">
        {stageOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={data.stage === opt.value ? 'active' : ''}
            onClick={() => setData({ ...data, stage: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="section-spacer" />
      <div className="wifi-section">
        <label className="wifi-label">{__('Wound (W)', 'endoplanner')}</label>
        <p className="wifi-desc">{wifiDescriptions.wound[values.wound]}</p>
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={values.wound}
          onChange={(e) => onChangeSection('wound', Number(e.target.value))}
          className="wifi-slider"
        />
      </div>

      <div className="section-spacer" />
      <div className="wifi-section">
        <label className="wifi-label">{__('Ischemia (I)', 'endoplanner')}</label>
        <p className="wifi-desc">{wifiDescriptions.ischemia[values.ischemia]}</p>
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={values.ischemia}
          onChange={(e) => onChangeSection('ischemia', Number(e.target.value))}
          className="wifi-slider"
        />
      </div>

      <div className="section-spacer" />
      <div className="wifi-section">
        <label className="wifi-label">{__('Foot Infection (fI)', 'endoplanner')}</label>
        <p className="wifi-desc">{wifiDescriptions.infection[values.infection]}</p>
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={values.infection}
          onChange={(e) => onChangeSection('infection', Number(e.target.value))}
          className="wifi-slider"
        />
      </div>

      <div className="section-spacer" />

    </div>
  );
}

Step1.propTypes = {
  data: PropTypes.object.isRequired,
  setData: PropTypes.func.isRequired,
};
