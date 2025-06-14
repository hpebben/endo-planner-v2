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
    0: __( 'No ulcer or gangrene (ischemic pain at rest)', 'endoplanner' ),
    1: __(
      'Small or superficial ulcer on leg or foot, without gangrene (SDA or SC)',
      'endoplanner'
    ),
    2: __(
      'Deep ulcer with exposed bone, joint, or tendon ± gangrene limited to digits (MAD or standard TMA ± SC)',
      'endoplanner'
    ),
    3: __(
      'Deep, extensive ulcer involving forefoot and/or midfoot ± calcaneal involvement ± extensive gangrene (CR of the foot or nontraditional TMA)',
      'endoplanner'
    ),
  },
  ischemia: {
    0: __(
      'ABI ≥ 0.80; Ankle SBP > 100 mmHg; TP/TcPO₂ ≥ 60 mmHg',
      'endoplanner'
    ),
    1: __(
      'ABI 0.60–0.79; Ankle SBP 70–100 mmHg; TP/TcPO₂ 40–59 mmHg',
      'endoplanner'
    ),
    2: __(
      'ABI 0.40–0.59; Ankle SBP 50–70 mmHg; TP/TcPO₂ 30–39 mmHg',
      'endoplanner'
    ),
    3: __(
      'ABI ≤ 0.39; Ankle SBP < 50 mmHg; TP/TcPO₂ < 30 mmHg',
      'endoplanner'
    ),
  },
  infection: {
    0: __( 'Uninfected', 'endoplanner' ),
    1: __(
      'Mild local infection, involving only the skin and subcutaneous tissue, erythema > 0.5 to ≤ 2 cm',
      'endoplanner'
    ),
    2: __(
      'Moderate local infection, with erythema > 2 cm or involving deeper structures',
      'endoplanner'
    ),
    3: __( 'Severe local infection with signs of SIRS', 'endoplanner' ),
  },
};

export default function Step1({ data, setData }) {
  const blockProps = useBlockProps({ className: 'clinical-center' });
  const clinical = data.clinical || {};
  const setClinical = (vals) => setData({ ...data, clinical: vals });

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

      <h4>{__('Wound (W)', 'endoplanner')}</h4>
      <div className="clinical-options">
        {[0, 1, 2, 3].map((grade) => (
          <button
            key={grade}
            className={clinical.wound === String(grade) ? 'selected' : ''}
            onClick={() => setClinical({ ...clinical, wound: String(grade) })}
            title={wifiDescriptions.wound[grade]}
          >
            {grade}
          </button>
        ))}
      </div>

      <h4>{__('Ischemia (I)', 'endoplanner')}</h4>
      <div className="clinical-options">
        {[0, 1, 2, 3].map((grade) => (
          <button
            key={grade}
            className={clinical.ischemia === String(grade) ? 'selected' : ''}
            onClick={() => setClinical({ ...clinical, ischemia: String(grade) })}
            title={wifiDescriptions.ischemia[grade]}
          >
            {grade}
          </button>
        ))}
      </div>

      <h4>{__('Foot Infection (fI)', 'endoplanner')}</h4>
      <div className="clinical-options">
        {[0, 1, 2, 3].map((grade) => (
          <button
            key={grade}
            className={clinical.infection === String(grade) ? 'selected' : ''}
            onClick={() => setClinical({ ...clinical, infection: String(grade) })}
            title={wifiDescriptions.infection[grade]}
          >
            {grade}
          </button>
        ))}
      </div>

    </div>
  );
}

Step1.propTypes = {
  data: PropTypes.object.isRequired,
  setData: PropTypes.func.isRequired,
};
