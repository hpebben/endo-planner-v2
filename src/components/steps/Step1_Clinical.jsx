import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { RadioControl } from '@wordpress/components';
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

  return (
    <div {...blockProps}>
      <h3>Stage</h3>
      <small className="subtitle">Stage I – IV based on Fontaine classification</small>
      <div className="clinical-buttons">
        {stageOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={data.clinicalStage === opt.value ? 'selected' : ''}
            onClick={() => setData({ ...data, clinicalStage: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <RadioControl
        label={__('Wound Grade', 'endoplanner')}
        selected={data.wound}
        options={woundOptions}
        onChange={(value) => setData({ ...data, wound: value })}
      />
      <p className="help-text">0: no ulcer; 1: small/shallow; 2: deep with tendon/bone; 3: extensive gangrene.</p>

      <RadioControl
        label={__('Ischemia', 'endoplanner')}
        selected={data.ischemia}
        options={ischemiaOptions}
        onChange={(value) => setData({ ...data, ischemia: value })}
      />
      <p className="help-text">0: ABI &ge;0.8; 1: 0.6-0.79; 2: 0.4-0.59; 3: &lt;0.4.</p>

      <RadioControl
        label={__('Infection', 'endoplanner')}
        selected={data.infection}
        options={infectionOptions}
        onChange={(value) => setData({ ...data, infection: value })}
      />
      <p className="help-text">0: none; 1: mild; 2: moderate; 3: severe systemic signs.</p>
    </div>
  );
}

Step1.propTypes = {
  data: PropTypes.object.isRequired,
  setData: PropTypes.func.isRequired,
};
