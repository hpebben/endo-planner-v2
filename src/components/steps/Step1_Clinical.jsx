import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useBlockProps } from '@wordpress/block-editor';

const stageOptions = [
  {
    label: __( 'Asymptomatic', 'endoplanner' ),
    value: 'asymptomatic',
    tooltip: 'Fontaine I–IV',
  },
  {
    label: __( 'Intermittent Claudication IIA', 'endoplanner' ),
    value: 'iia',
    tooltip: 'Fontaine I–IV',
  },
  {
    label: __( 'Intermittent Claudication IIB', 'endoplanner' ),
    value: 'iib',
    tooltip: 'Fontaine I–IV',
  },
  { label: __( 'Rest Pain', 'endoplanner' ), value: 'iii', tooltip: 'Fontaine I–IV' },
  {
    label: __( 'Ulcer/Gangrene', 'endoplanner' ),
    value: 'iv',
    tooltip: 'Fontaine I–IV',
  },
];

const woundOptions = [
  {
    value: '0',
    desc: __(
      'No ulcer or gangrene (ischemic pain at rest)',
      'endoplanner'
    ),
  },
  {
    value: '1',
    desc: __(
      'Small or superficial ulcer on leg or foot, without gangrene (SDA or SC)',
      'endoplanner'
    ),
  },
  {
    value: '2',
    desc: __(
      'Deep ulcer with exposed bone, joint, or tendon ± gangrene limited to digits (MAD or standard TMA ± SC)',
      'endoplanner'
    ),
  },
  {
    value: '3',
    desc: __(
      'Deep, extensive ulcer involving forefoot and/or midfoot ± calcaneal involvement ± extensive gangrene (CR of the foot or nontraditional TMA)',
      'endoplanner'
    ),
  },
];

const ischemiaOptions = [
  {
    value: '0',
    desc: __(
      'ABI ≥ 0.80; Ankle SBP > 100 mmHg; TP/TcPO₂ ≥ 60 mmHg',
      'endoplanner'
    ),
  },
  {
    value: '1',
    desc: __(
      'ABI 0.60–0.79; Ankle SBP 70–100 mmHg; TP/TcPO₂ 40–59 mmHg',
      'endoplanner'
    ),
  },
  {
    value: '2',
    desc: __(
      'ABI 0.40–0.59; Ankle SBP 50–70 mmHg; TP/TcPO₂ 30–39 mmHg',
      'endoplanner'
    ),
  },
  {
    value: '3',
    desc: __(
      'ABI ≤ 0.39; Ankle SBP < 50 mmHg; TP/TcPO₂ < 30 mmHg',
      'endoplanner'
    ),
  },
];

const infectionOptions = [
  { value: '0', desc: __( 'Uninfected', 'endoplanner' ) },
  {
    value: '1',
    desc: __(
      'Mild local infection, involving only the skin and subcutaneous tissue, erythema > 0.5 to ≤ 2 cm',
      'endoplanner'
    ),
  },
  {
    value: '2',
    desc: __(
      'Moderate local infection, with erythema > 2 cm or involving deeper structures',
      'endoplanner'
    ),
  },
  {
    value: '3',
    desc: __( 'Severe local infection with signs of SIRS', 'endoplanner' ),
  },
];

export default function Step1({ data, setData }) {
  const blockProps = useBlockProps({ className: 'clinical-center' });
  const [hoverStage, setHoverStage] = useState(null);

  return (
    <div {...blockProps}>
      <h3>Stage</h3>
      <small className="subtitle">Stage I – IV based on Fontaine classification</small>
      <div className="option-buttons">
        {stageOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={data.stage === opt.value ? 'active' : ''}
            onMouseEnter={() => setHoverStage(opt.tooltip)}
            onMouseLeave={() => setHoverStage(null)}
            onClick={() => setData({ ...data, stage: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {hoverStage && <small className="tooltip-caption">{hoverStage}</small>}

      <h4>{__('Wound Grade', 'endoplanner')}</h4>
      <div className="option-buttons">
        {woundOptions.map((opt) => (
          <label key={opt.value} title={opt.desc} className="radio-option">
            <input
              type="radio"
              name="wound"
              value={opt.value}
              aria-label={opt.desc}
              checked={data.wound === opt.value}
              onChange={(e) => setData({ ...data, wound: e.target.value })}
            />
            {opt.value}
          </label>
        ))}
      </div>

      <h4>{__('Ischemia', 'endoplanner')}</h4>
      <div className="option-buttons">
        {ischemiaOptions.map((opt) => (
          <label key={opt.value} title={opt.desc} className="radio-option">
            <input
              type="radio"
              name="ischemia"
              value={opt.value}
              aria-label={opt.desc}
              checked={data.ischemia === opt.value}
              onChange={(e) => setData({ ...data, ischemia: e.target.value })}
            />
            {opt.value}
          </label>
        ))}
      </div>

      <h4>{__('Infection', 'endoplanner')}</h4>
      <div className="option-buttons">
        {infectionOptions.map((opt) => (
          <label key={opt.value} title={opt.desc} className="radio-option">
            <input
              type="radio"
              name="infection"
              value={opt.value}
              aria-label={opt.desc}
              checked={data.infection === opt.value}
              onChange={(e) => setData({ ...data, infection: e.target.value })}
            />
            {opt.value}
          </label>
        ))}
      </div>

    </div>
  );
}

Step1.propTypes = {
  data: PropTypes.object.isRequired,
  setData: PropTypes.func.isRequired,
};
