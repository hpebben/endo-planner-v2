import { Fragment } from 'react';
import PropTypes from 'prop-types';
import IconButton from '../UI/IconButton';

const stageOptions = [
  {
    key: 'I',
    label: 'Asymptomatic',
    icon: 'visibility',
    tooltip: 'No symptoms or functional limitation.'
  },
  {
    key: 'IIa',
    label: 'Intermittent Claudication IIA',
    icon: 'walking',
    tooltip: 'Pain-free walking distance greater than 200 m.'
  },
  {
    key: 'IIb',
    label: 'Intermittent Claudication IIB',
    icon: 'running',
    tooltip: 'Pain occurs after walking less than 200 m.'
  },
  {
    key: 'III',
    label: 'Rest Pain',
    icon: 'tired',
    tooltip: 'Ischemic rest pain present.'
  },
  {
    key: 'IV',
    label: 'Ulcer/Gangrene',
    icon: 'warning',
    tooltip: 'Tissue loss with ulceration or gangrene.'
  },
];

const woundOptions = [
  { key: '0', label: 'No wound',       icon: 'yes' },
  { key: '1', label: 'Small ulcer',    icon: 'universal-access-alt' },
  { key: '2', label: 'Deep ulcer',     icon: 'flag' },
  { key: '3', label: 'Extensive',      icon: 'shield' },
];

const ischemiaOptions = [
  { key: '0', label: 'None',         icon: 'yes' },
  { key: '1', label: 'Mild',         icon: 'minus' },
  { key: '2', label: 'Moderate',     icon: 'warning' },
  { key: '3', label: 'Severe',       icon: 'dismiss' },
];

const infectionOptions = [
  { key: '0', label: 'None',         icon: 'yes' },
  { key: '1', label: 'Mild',         icon: 'minus' },
  { key: '2', label: 'Moderate',     icon: 'warning' },
  { key: '3', label: 'Severe',       icon: 'dismiss' },
];

export default function Step1({ data, setData }) {
  const selectStage = ( key ) => {
    setData({ ...data, stage: key });
  };

  const selectWound = (key) => {
    setData({ ...data, wound: key });
  };

  const selectIschemia = (key) => {
    setData({ ...data, ischemia: key });
  };

  const selectInfection = (key) => {
    setData({ ...data, infection: key });
  };

  return (
    <Fragment>
      <h3>Stage</h3>
      <div className="step1-grid">
        { stageOptions.map((o) =>
          <IconButton
            key={o.key}
            icon={o.icon}
            label={o.label}
            tooltip={o.tooltip}
            isSelected={ data.stage === o.key }
            onClick={() => selectStage(o.key)}
          />
        )}
      </div>
      <h3>Wound Grade</h3>
      <div className="step1-grid">
        { woundOptions.map((o) => (
          <IconButton
            key={o.key}
            icon={o.icon}
            label={o.label}
            isSelected={ data.wound === o.key }
            onClick={() => selectWound(o.key)}
          />
        )) }
      </div>
      <h3>Ischemia</h3>
      <div className="step1-grid">
        { ischemiaOptions.map((o) => (
          <IconButton
            key={o.key}
            icon={o.icon}
            label={o.label}
            isSelected={ data.ischemia === o.key }
            onClick={() => selectIschemia(o.key)}
          />
        )) }
      </div>
      <h3>Infection</h3>
      <div className="step1-grid">
        { infectionOptions.map((o) => (
          <IconButton
            key={o.key}
            icon={o.icon}
            label={o.label}
            isSelected={ data.infection === o.key }
            onClick={() => selectInfection(o.key)}
          />
        )) }
      </div>
    </Fragment>
  );
}

Step1.propTypes = {
  data: PropTypes.object.isRequired,
  setData: PropTypes.func.isRequired,
};
