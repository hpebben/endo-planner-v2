import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import SegmentedControl from '../UI/SegmentedControl';

const stageOptions = [
  { label: __('I Asymptomatic', 'endoplanner'), value: 'i' },
  { label: __('IIa ≥200 m', 'endoplanner'), value: 'iia' },
  { label: __('IIb <200 m', 'endoplanner'), value: 'iib' },
  { label: __('III Rest pain', 'endoplanner'), value: 'iii' },
  { label: __('IV Ulcer/gangrene', 'endoplanner'), value: 'iv' },
];

const gradeOptions = [0, 1, 2, 3].map((grade) => ({
  label: String(grade),
  value: String(grade),
}));

const wifiDescriptions = {
  wound: {
    0: 'No ulcer or gangrene',
    1: 'Small, shallow ulcer; no gangrene',
    2: 'Deep ulcer with exposed bone/joint or limited digit gangrene',
    3: 'Extensive ulcer, heel involvement or extensive gangrene',
  },
  ischemia: {
    0: 'ABI ≥0.80; ankle pressure >100 mmHg; toe pressure ≥60 mmHg',
    1: 'ABI 0.60–0.79; ankle pressure 70–100; toe pressure 40–59 mmHg',
    2: 'ABI 0.40–0.59; ankle pressure 50–70; toe pressure 30–39 mmHg',
    3: 'ABI ≤0.39; ankle pressure <50; toe pressure <30 mmHg',
  },
  infection: {
    0: 'No signs or symptoms of infection',
    1: 'Mild local infection limited to skin/subcutaneous tissue',
    2: 'Moderate infection: erythema >2 cm or deeper structures involved',
    3: 'Severe infection with systemic inflammatory response',
  },
};

function WifiGrade({ title, field, value, onChange }) {
  const assessed = Number.isInteger(value);

  return (
    <section className="clinical-section wifi-grade-section">
      <h2 className="section-title">{title}</h2>
      <p className="wifi-desc">
        {assessed
          ? wifiDescriptions[field][value]
          : __('Not assessed — select a grade explicitly.', 'endoplanner')}
      </p>
      <SegmentedControl
        options={gradeOptions}
        value={assessed ? String(value) : undefined}
        onChange={(next) => onChange(Number(next))}
        ariaLabel={`${title} grade`}
      />
      {assessed && (
        <button
          type="button"
          className="stage-btn clear-grade-btn"
          onClick={() => onChange(null)}
        >
          {__('Clear', 'endoplanner')}
        </button>
      )}
    </section>
  );
}

WifiGrade.propTypes = {
  title: PropTypes.string.isRequired,
  field: PropTypes.oneOf(['wound', 'ischemia', 'infection']).isRequired,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

export default function Step1({ data, setData }) {
  const clinical = data.clinical || {};
  const setClinicalGrade = (key, value) => {
    setData((previous) => ({
      ...previous,
      clinical: { ...(previous.clinical || {}), [key]: value },
    }));
  };

  return (
    <div className="clinical-center">
      <h2 className="section-title">{__('Fontaine stage', 'endoplanner')}</h2>
      <p className="section-subtitle">
        {__('Choose the stage that best matches the clinical presentation; IIa and IIb are separated at a 200 metre walking distance.', 'endoplanner')}
      </p>
      <SegmentedControl
        options={stageOptions}
        value={data.stage}
        onChange={(stage) => setData((previous) => ({ ...previous, stage }))}
        ariaLabel={__('Fontaine stage', 'endoplanner')}
      />

      <div className="section-spacer" />
      <h2 className="section-title">{__('WIfI component grades', 'endoplanner')}</h2>
      <p className="section-subtitle">
        {__('All three components must be assessed before a clinical stage is calculated.', 'endoplanner')}
      </p>

      <WifiGrade
        title={__('Wound', 'endoplanner')}
        field="wound"
        value={clinical.wound}
        onChange={(value) => setClinicalGrade('wound', value)}
      />
      <WifiGrade
        title={__('Ischemia', 'endoplanner')}
        field="ischemia"
        value={clinical.ischemia}
        onChange={(value) => setClinicalGrade('ischemia', value)}
      />
      <WifiGrade
        title={__('Foot infection', 'endoplanner')}
        field="infection"
        value={clinical.infection}
        onChange={(value) => setClinicalGrade('infection', value)}
      />
    </div>
  );
}

Step1.propTypes = {
  data: PropTypes.object.isRequired,
  setData: PropTypes.func.isRequired,
};
