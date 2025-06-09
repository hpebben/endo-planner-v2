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
  {
    key: '0',
    label: 'No wound',
    icon: 'yes',
    tooltip: 'No ulceration or gangrene'
  },
  {
    key: '1',
    label: 'Small ulcer',
    icon: 'universal-access-alt',
    tooltip: 'Superficial ulcer < 1 cm'
  },
  {
    key: '2',
    label: 'Deep ulcer',
    icon: 'flag',
    tooltip: 'Deeper ulcer with exposed structures'
  },
  {
    key: '3',
    label: 'Extensive',
    icon: 'shield',
    tooltip: 'Extensive tissue loss or gangrene'
  },
];

const ischemiaOptions = [
  {
    key: '0',
    label: 'None',
    icon: 'yes',
    tooltip: 'No ischemia'
  },
  {
    key: '1',
    label: 'Mild',
    icon: 'minus',
    tooltip: 'Mild reduction in perfusion'
  },
  {
    key: '2',
    label: 'Moderate',
    icon: 'warning',
    tooltip: 'Significant ischemia present'
  },
  {
    key: '3',
    label: 'Severe',
    icon: 'dismiss',
    tooltip: 'Severe ischemia with critical findings'
  },
];

const infectionOptions = [
  {
    key: '0',
    label: 'None',
    icon: 'yes',
    tooltip: 'No infection'
  },
  {
    key: '1',
    label: 'Mild',
    icon: 'minus',
    tooltip: 'Local infection only'
  },
  {
    key: '2',
    label: 'Moderate',
    icon: 'warning',
    tooltip: 'Deeper or spreading infection'
  },
  {
    key: '3',
    label: 'Severe',
    icon: 'dismiss',
    tooltip: 'Systemic infection or sepsis'
  },
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
            tooltip={o.tooltip}
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
            tooltip={o.tooltip}
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
            tooltip={o.tooltip}
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
