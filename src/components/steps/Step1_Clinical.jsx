import { Fragment } from 'react';
import IconButton from '../UI/IconButton';
import DashIcon from '../icons/DashIcon';
import WoundGrade0 from '../icons/WoundGrade0';
import WoundGrade1 from '../icons/WoundGrade1';
import WoundGrade2 from '../icons/WoundGrade2';
import WoundGrade3 from '../icons/WoundGrade3';
import IschemiaGrade0 from '../icons/IschemiaGrade0';
import IschemiaGrade1 from '../icons/IschemiaGrade1';
import IschemiaGrade2 from '../icons/IschemiaGrade2';
import IschemiaGrade3 from '../icons/IschemiaGrade3';
import InfectionGrade0 from '../icons/InfectionGrade0';
import InfectionGrade1 from '../icons/InfectionGrade1';
import InfectionGrade2 from '../icons/InfectionGrade2';
import InfectionGrade3 from '../icons/InfectionGrade3';

const stageOptions = [
  { key: 'I',    label: 'Asymptomatic', icon: <DashIcon name="visibility" /> },
  { key: 'IIa',  label: 'Intermittent Claudication IIA', icon: <DashIcon name="walking" /> },
  { key: 'IIb',  label: 'Intermittent Claudication IIB', icon: <DashIcon name="running" /> },
  { key: 'III',  label: 'Rest Pain', icon: <DashIcon name="tired" /> },
  { key: 'IV',   label: 'Ulcer/Gangrene', icon: <DashIcon name="warning" /> },
];

const woundOptions = [
  { key: '0', label: 'No wound',       icon: <WoundGrade0 /> },
  { key: '1', label: 'Small ulcer',    icon: <WoundGrade1 /> },
  { key: '2', label: 'Deep ulcer',     icon: <WoundGrade2 /> },
  { key: '3', label: 'Extensive',      icon: <WoundGrade3 /> },
];

const ischemiaOptions = [
  { key: '0', label: 'None',         icon: <IschemiaGrade0 /> },
  { key: '1', label: 'Mild',         icon: <IschemiaGrade1 /> },
  { key: '2', label: 'Moderate',     icon: <IschemiaGrade2 /> },
  { key: '3', label: 'Severe',       icon: <IschemiaGrade3 /> },
];

const infectionOptions = [
  { key: '0', label: 'None',         icon: <InfectionGrade0 /> },
  { key: '1', label: 'Mild',         icon: <InfectionGrade1 /> },
  { key: '2', label: 'Moderate',     icon: <InfectionGrade2 /> },
  { key: '3', label: 'Severe',       icon: <InfectionGrade3 /> },
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
