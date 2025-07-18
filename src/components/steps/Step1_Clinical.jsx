import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import SegmentedControl from '../UI/SegmentedControl';

const stageOptions = [
  { label: __( 'I Asymptomatic', 'endoplanner' ), value: 'i' },
  { label: __( 'IIa >100m', 'endoplanner' ), value: 'iia' },
  { label: __( 'IIb <100m', 'endoplanner' ), value: 'iib' },
  { label: __( 'III Rest Pain', 'endoplanner' ), value: 'iii' },
  { label: __( 'IV Ulcer/Gangrene', 'endoplanner' ), value: 'iv' },
];

const wifiDescriptions = {
  wound: {
    0: 'No ulcer or gangrene',
    1: 'Small/superficial ulcer, no gangrene',
    2: 'Deep ulcer with exposed bone/joint ± digit gangrene',
    3: 'Extensive ulcer ± calcaneal involvement ± extensive gangrene',
  },
  ischemia: {
    0: 'ABI ≥ 0.80; TP ≥ 60 mmHg',
    1: 'ABI 0.6–0.79; TP 40–59 mmHg',
    2: 'ABI 0.4–0.59; TP 30–39 mmHg',
    3: 'ABI ≤ 0.39; TP < 30 mmHg',
  },
  infection: {
    0: 'No signs of infection',
    1: 'Mild local infection, erythema 0.5–2 cm',
    2: 'Moderate infection, >2 cm or deeper tissue',
    3: 'Severe infection with SIRS',
  },
};

export default function Step1({ data, setData }) {
  const blockProps = useBlockProps({ className: 'clinical-center' });
  const [wound, setWound] = useState(data.clinical?.wound ?? 0);
  const [ischemia, setIschemia] = useState(data.clinical?.ischemia ?? 0);
  const [infection, setInfection] = useState(data.clinical?.infection ?? 0);

  useEffect(() => {
    setWound(data.clinical?.wound ?? 0);
    setIschemia(data.clinical?.ischemia ?? 0);
    setInfection(data.clinical?.infection ?? 0);
  }, [data.clinical]);

  const onChangeSection = (key, newVal) => {
    if (key === 'wound') setWound(newVal);
    if (key === 'ischemia') setIschemia(newVal);
    if (key === 'infection') setInfection(newVal);
    setData({
      ...data,
      clinical: { ...data.clinical, [key]: newVal },
    });
  };

  return (
    <div {...blockProps}>
      <h2 className="section-title">{__('Stage', 'endoplanner')}</h2>
      <p className="section-subtitle">
        {__('Stage I\u2013IV based on Fontaine classification', 'endoplanner')}
      </p>
      <SegmentedControl
        options={stageOptions}
        value={data.stage}
        onChange={(val) => setData({ ...data, stage: val })}
        ariaLabel={__('Fontaine stage', 'endoplanner')}
      />

      <div className="section-spacer" />

      <h2 className="section-title">{__('Wound', 'endoplanner')}</h2>
      <p className="wifi-desc">{wifiDescriptions.wound[wound]}</p>
      <input
        type="range"
        min={0}
        max={3}
        step={1}
        value={wound}
        onChange={(e) => onChangeSection('wound', Number(e.target.value))}
        className="wifi-slider"
      />
      <div className="wifimarkers">
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </div>

      <div className="section-spacer" />

      <h2 className="section-title">{__('Ischemia', 'endoplanner')}</h2>
      <p className="wifi-desc">{wifiDescriptions.ischemia[ischemia]}</p>
      <input
        type="range"
        min={0}
        max={3}
        step={1}
        value={ischemia}
        onChange={(e) => onChangeSection('ischemia', Number(e.target.value))}
        className="wifi-slider"
      />
      <div className="wifimarkers">
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </div>

      <div className="section-spacer" />

      <h2 className="section-title">{__('Infection', 'endoplanner')}</h2>
      <p className="wifi-desc">{wifiDescriptions.infection[infection]}</p>
      <input
        type="range"
        min={0}
        max={3}
        step={1}
        value={infection}
        onChange={(e) => onChangeSection('infection', Number(e.target.value))}
        className="wifi-slider"
      />
      <div className="wifimarkers">
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </div>

      <div className="section-spacer" />
    </div>
  );
}

Step1.propTypes = {
  data: PropTypes.object.isRequired,
  setData: PropTypes.func.isRequired,
};
