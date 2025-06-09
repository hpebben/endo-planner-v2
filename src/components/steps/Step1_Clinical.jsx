import { Fragment } from 'react';
import IconButton from '../UI/IconButton';

const stageOptions = [
  { key: 'I',    label: 'Asymptomatic', icon: 'visibility' },
  { key: 'IIa',  label: 'Intermittent Claudication IIA', icon: 'walking' },
  { key: 'IIb',  label: 'Intermittent Claudication IIB', icon: 'running' },
  { key: 'III',  label: 'Rest Pain', icon: 'tired' },
  { key: 'IV',   label: 'Ulcer/Gangrene', icon: 'warning' },
];

const woundOptions = [
  { key: '0', label: 'No wound',       icon: 'yes',                   tooltip: 'No ulcer or gangrene' },
  { key: '1', label: 'Small ulcer',    icon: 'universal-access-alt', tooltip: 'Superficial ulcer ≤ 1 cm' },
  { key: '2', label: 'Deep ulcer',     icon: 'flag',                 tooltip: 'Ulcer to tendon or capsule' },
  { key: '3', label: 'Extensive',      icon: 'shield',               tooltip: 'Extensive ulcer or gangrene' },
];

const ischemiaOptions = [
  { key: '0', label: 'None',     icon: 'yes',     tooltip: 'Toe pressure ≥ 60 mmHg' },
  { key: '1', label: 'Mild',     icon: 'minus',  tooltip: 'Toe pressure 40–59 mmHg' },
  { key: '2', label: 'Moderate', icon: 'warning', tooltip: 'Toe pressure 30–39 mmHg' },
  { key: '3', label: 'Severe',   icon: 'dismiss', tooltip: 'Toe pressure < 30 mmHg' },
];

const infectionOptions = [
  { key: '0', label: 'None',     icon: 'yes',     tooltip: 'No infection' },
  { key: '1', label: 'Mild',     icon: 'minus',  tooltip: 'Mild infection' },
  { key: '2', label: 'Moderate', icon: 'warning', tooltip: 'Moderate infection' },
  { key: '3', label: 'Severe',   icon: 'dismiss', tooltip: 'Severe or systemic infection' },
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
