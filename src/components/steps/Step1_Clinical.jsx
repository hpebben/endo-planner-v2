import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import IconButton from '../UI/IconButton';

const stageOptions = [
  {
    key: 'I',
    label: __( 'Asymptomatic', 'endoplanner' ),
    icon: 'visibility',
    tooltip: __( 'No symptoms or functional limitation.', 'endoplanner' )
  },
  {
    key: 'IIa',
    label: __( 'Intermittent Claudication IIA', 'endoplanner' ),
    icon: 'walking',
    tooltip: __( 'Pain-free walking distance greater than 200 m.', 'endoplanner' )
  },
  {
    key: 'IIb',
    label: __( 'Intermittent Claudication IIB', 'endoplanner' ),
    icon: 'running',
    tooltip: __( 'Pain occurs after walking less than 200 m.', 'endoplanner' )
  },
  {
    key: 'III',
    label: __( 'Rest Pain', 'endoplanner' ),
    icon: 'tired',
    tooltip: __( 'Ischemic rest pain present.', 'endoplanner' )
  },
  {
    key: 'IV',
    label: __( 'Ulcer/Gangrene', 'endoplanner' ),
    icon: 'warning',
    tooltip: __( 'Tissue loss with ulceration or gangrene.', 'endoplanner' )
  },
];

const woundOptions = [
  {
    key: '0',
    label: __( 'No wound', 'endoplanner' ),
    icon: 'yes',
    tooltip: __( 'No ulceration or gangrene', 'endoplanner' )
  },
  {
    key: '1',
    label: __( 'Small ulcer', 'endoplanner' ),
    icon: 'universal-access-alt',
    tooltip: __( 'Superficial ulcer < 1 cm', 'endoplanner' )
  },
  {
    key: '2',
    label: __( 'Deep ulcer', 'endoplanner' ),
    icon: 'flag',
    tooltip: __( 'Deeper ulcer with exposed structures', 'endoplanner' )
  },
  {
    key: '3',
    label: __( 'Extensive', 'endoplanner' ),
    icon: 'shield',
    tooltip: __( 'Extensive tissue loss or gangrene', 'endoplanner' )
  },
];

const ischemiaOptions = [
  {
    key: '0',
    label: __( 'None', 'endoplanner' ),
    icon: 'yes',
    tooltip: __( 'No ischemia', 'endoplanner' )
  },
  {
    key: '1',
    label: __( 'Mild', 'endoplanner' ),
    icon: 'minus',
    tooltip: __( 'Mild reduction in perfusion', 'endoplanner' )
  },
  {
    key: '2',
    label: __( 'Moderate', 'endoplanner' ),
    icon: 'warning',
    tooltip: __( 'Significant ischemia present', 'endoplanner' )
  },
  {
    key: '3',
    label: __( 'Severe', 'endoplanner' ),
    icon: 'dismiss',
    tooltip: __( 'Severe ischemia with critical findings', 'endoplanner' )
  },
];

const infectionOptions = [
  {
    key: '0',
    label: __( 'None', 'endoplanner' ),
    icon: 'yes',
    tooltip: __( 'No infection', 'endoplanner' )
  },
  {
    key: '1',
    label: __( 'Mild', 'endoplanner' ),
    icon: 'minus',
    tooltip: __( 'Local infection only', 'endoplanner' )
  },
  {
    key: '2',
    label: __( 'Moderate', 'endoplanner' ),
    icon: 'warning',
    tooltip: __( 'Deeper or spreading infection', 'endoplanner' )
  },
  {
    key: '3',
    label: __( 'Severe', 'endoplanner' ),
    icon: 'dismiss',
    tooltip: __( 'Systemic infection or sepsis', 'endoplanner' )
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
      <h3>{ __( 'Stage', 'endoplanner' ) }</h3>
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
      <h3>{ __( 'Wound Grade', 'endoplanner' ) }</h3>
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
      <h3>{ __( 'Ischemia', 'endoplanner' ) }</h3>
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
      <h3>{ __( 'Infection', 'endoplanner' ) }</h3>
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
