import { Fragment } from 'react';
import IconButton from '../UI/IconButton';

const options = [
  { key: 'I',    label: 'Asymptomatic', icon: 'visibility' },
  { key: 'IIa',  label: 'Intermittent Claudication IIA', icon: 'walking' },
  { key: 'IIb',  label: 'Intermittent Claudication IIB', icon: 'running' },
  { key: 'III',  label: 'Rest Pain', icon: 'tired' },
  { key: 'IV',   label: 'Ulcer/Gangrene', icon: 'warning' },
];

export default function Step1({ data, setData }) {
  const selectStage = ( key ) => {
    setData({ ...data, stage: key });
  };

  return (
    <Fragment>
      <div className="step1-grid">
        { options.map((o) =>
          <IconButton
            key={o.key}
            icon={o.icon}
            label={o.label}
            isSelected={ data.stage === o.key }
            onClick={() => selectStage(o.key)}
          />
        )}
      </div>
      {/* Add similar icon-driven inputs for wound, ischemia, infection */}
    </Fragment>
  );
}
