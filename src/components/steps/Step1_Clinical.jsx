import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useBlockProps } from '@wordpress/block-editor';

const stageOptions = [
  { label: __( 'Asymptomatic', 'endoplanner' ), value: 'asymptomatic' },
  { label: __( 'Intermittent Claudication IIA', 'endoplanner' ), value: 'iia' },
  { label: __( 'Intermittent Claudication IIB', 'endoplanner' ), value: 'iib' },
  { label: __( 'Rest Pain', 'endoplanner' ), value: 'iii' },
  { label: __( 'Ulcer/Gangrene', 'endoplanner' ), value: 'iv' },
];

const woundOptions = [
  { label: __( 'No wound', 'endoplanner' ), value: '0' },
  { label: __( 'Small ulcer', 'endoplanner' ), value: '1' },
  { label: __( 'Deep ulcer', 'endoplanner' ), value: '2' },
  { label: __( 'Extensive', 'endoplanner' ), value: '3' },
];

const ischemiaOptions = [
  { label: __( 'None', 'endoplanner' ), value: '0' },
  { label: __( 'Mild', 'endoplanner' ), value: '1' },
  { label: __( 'Moderate', 'endoplanner' ), value: '2' },
  { label: __( 'Severe', 'endoplanner' ), value: '3' },
];

const infectionOptions = [
  { label: __( 'None', 'endoplanner' ), value: '0' },
  { label: __( 'Mild', 'endoplanner' ), value: '1' },
  { label: __( 'Moderate', 'endoplanner' ), value: '2' },
  { label: __( 'Severe', 'endoplanner' ), value: '3' },
];

export default function Step1({ data, setData }) {
  const blockProps = useBlockProps({ className: 'clinical-center' });
  const [hoverStage, setHoverStage] = useState(null);
  const [hoverWound, setHoverWound] = useState(null);
  const [hoverIschemia, setHoverIschemia] = useState(null);
  const [hoverInfection, setHoverInfection] = useState(null);

  return (
    <div {...blockProps}>
      <h3>Stage</h3>
      <small className="subtitle">Stage I – IV based on Fontaine classification</small>
      <div className="option-buttons">
        {stageOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={data.clinicalStage === opt.value ? 'active' : ''}
            onMouseEnter={() => setHoverStage('Fontaine I–IV')}
            onMouseLeave={() => setHoverStage(null)}
            onClick={() => setData({ ...data, clinicalStage: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {hoverStage && <small className="tooltip-caption">{hoverStage}</small>}

      <h4>{__('Wound Grade', 'endoplanner')}</h4>
      <div className="option-buttons">
        {woundOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={data.wound === opt.value ? 'active' : ''}
            onMouseEnter={() =>
              setHoverWound('0: no ulcer; 1: small/shallow; 2: deep tendon/bone; 3: extensive gangrene')
            }
            onMouseLeave={() => setHoverWound(null)}
            onClick={() => setData({ ...data, wound: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {hoverWound && <small className="tooltip-caption">{hoverWound}</small>}

      <h4>{__('Ischemia', 'endoplanner')}</h4>
      <div className="option-buttons">
        {ischemiaOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={data.ischemia === opt.value ? 'active' : ''}
            onMouseEnter={() => setHoverIschemia('0: ABI ≥0.8; 1: 0.6–0.79; 2: 0.4–0.59; 3: <0.4')}
            onMouseLeave={() => setHoverIschemia(null)}
            onClick={() => setData({ ...data, ischemia: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {hoverIschemia && <small className="tooltip-caption">{hoverIschemia}</small>}

      <h4>{__('Infection', 'endoplanner')}</h4>
      <div className="option-buttons">
        {infectionOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={data.infection === opt.value ? 'active' : ''}
            onMouseEnter={() => setHoverInfection('0: none; 1: mild; 2: moderate; 3: severe')}
            onMouseLeave={() => setHoverInfection(null)}
            onClick={() => setData({ ...data, infection: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {hoverInfection && <small className="tooltip-caption">{hoverInfection}</small>}

    </div>
  );
}

Step1.propTypes = {
  data: PropTypes.object.isRequired,
  setData: PropTypes.func.isRequired,
};
