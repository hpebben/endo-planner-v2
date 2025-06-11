import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';
import { useState } from 'react';

const stageOptions = [
  {
    key: 'I',
    label: __( 'Asymptomatic', 'endoplanner' ),
  },
  {
    key: 'IIa',
    label: __( 'Intermittent Claudication IIA', 'endoplanner' ),
  },
  {
    key: 'IIb',
    label: __( 'Intermittent Claudication IIB', 'endoplanner' ),
  },
  {
    key: 'III',
    label: __( 'Rest Pain', 'endoplanner' ),
  },
  {
    key: 'IV',
    label: __( 'Ulcer/Gangrene', 'endoplanner' ),
  },
];

const woundOptions = [
  {
    key: '0',
    label: __( 'No wound', 'endoplanner' ),
  },
  {
    key: '1',
    label: __( 'Small ulcer', 'endoplanner' ),
  },
  {
    key: '2',
    label: __( 'Deep ulcer', 'endoplanner' ),
  },
  {
    key: '3',
    label: __( 'Extensive', 'endoplanner' ),
  },
];

const ischemiaOptions = [
  {
    key: '0',
    label: __( 'None', 'endoplanner' ),
  },
  {
    key: '1',
    label: __( 'Mild', 'endoplanner' ),
  },
  {
    key: '2',
    label: __( 'Moderate', 'endoplanner' ),
  },
  {
    key: '3',
    label: __( 'Severe', 'endoplanner' ),
  },
];

const infectionOptions = [
  {
    key: '0',
    label: __( 'None', 'endoplanner' ),
  },
  {
    key: '1',
    label: __( 'Mild', 'endoplanner' ),
  },
  {
    key: '2',
    label: __( 'Moderate', 'endoplanner' ),
  },
  {
    key: '3',
    label: __( 'Severe', 'endoplanner' ),
  },
];

export default function Step1({ data, setData }) {
  const blockProps = useBlockProps();

  const [selectedStage, setSelectedStage] = useState(data.stage || '');
  const [selectedWound, setSelectedWound] = useState(data.wound || '');
  const [selectedIschemia, setSelectedIschemia] = useState(data.ischemia || '');
  const [selectedInfection, setSelectedInfection] = useState(data.infection || '');

  const selectStage = (key) => {
    setSelectedStage(key);
    setData({ ...data, stage: key });
  };

  const selectWound = (key) => {
    setSelectedWound(key);
    setData({ ...data, wound: key });
  };

  const selectIschemia = (key) => {
    setSelectedIschemia(key);
    setData({ ...data, ischemia: key });
  };

  const selectInfection = (key) => {
    setSelectedInfection(key);
    setData({ ...data, infection: key });
  };

  return (
    <div className="clinical-center">
      <div {...blockProps}>
      <div className="step-group">
        <h3>{ __( 'Stage', 'endoplanner' ) }</h3>
        { stageOptions.map((o) => (
          <Button
            key={o.key}
            className="step-button"
            isSecondary
            isPressed={ selectedStage === o.key }
            onClick={() => selectStage(o.key)}
          >
            { o.label }
          </Button>
        )) }
      </div>

      <div className="step-group">
        <h3>{ __( 'Wound Grade', 'endoplanner' ) }</h3>
        { woundOptions.map((o) => (
          <Button
            key={o.key}
            className="step-button"
            isSecondary
            isPressed={ selectedWound === o.key }
            onClick={() => selectWound(o.key)}
          >
            { o.label }
          </Button>
        )) }
      </div>

      <div className="step-group">
        <h3>{ __( 'Ischemia', 'endoplanner' ) }</h3>
        { ischemiaOptions.map((o) => (
          <Button
            key={o.key}
            className="step-button"
            isSecondary
            isPressed={ selectedIschemia === o.key }
            onClick={() => selectIschemia(o.key)}
          >
            { o.label }
          </Button>
        )) }
      </div>

      <div className="step-group">
        <h3>{ __( 'Infection', 'endoplanner' ) }</h3>
        { infectionOptions.map((o) => (
          <Button
            key={o.key}
            className="step-button"
            isSecondary
            isPressed={ selectedInfection === o.key }
            onClick={() => selectInfection(o.key)}
          >
            { o.label }
          </Button>
        )) }
      </div>
      </div>
    </div>
  );
}

Step1.propTypes = {
  data: PropTypes.object.isRequired,
  setData: PropTypes.func.isRequired,
};
