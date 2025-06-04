// src/components/UI/SliderModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, RangeControl, Button } from '@wordpress/components';

export default function SliderModal({ isOpen, onClose, segment, values, onSave }) {
  const [severity, setSeverity] = useState(values.severity || 0);
  const [length, setLength]     = useState(values.length   || 0);
  const [calcium, setCalcium]   = useState(values.calcium || 'none');

  // sync when values change
  useEffect(() => {
    setSeverity(values.severity || 0);
    setLength(values.length || 0);
    setCalcium(values.calcium || 'none');
  }, [values]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal title={`Edit ${segment}`} onRequestClose={onClose}>
      <RangeControl
        label="Degree of Stenosis (%)"
        value={severity}
        onChange={setSeverity}
        min={0}
        max={100}
      />

      <RangeControl
        label="Lesion Length (cm)"
        value={length}
        onChange={setLength}
        min={0}
        max={30}
      />

      <div className="calcium-controls" style={{ margin: '1em 0' }}>
        <strong>Calcification:</strong>{' '}
        <Button
          isSecondary
          isPressed={calcium === 'none'}
          onClick={() => setCalcium('none')}
        >
          None
        </Button>{' '}
        <Button
          isSecondary
          isPressed={calcium === 'moderate'}
          onClick={() => setCalcium('moderate')}
        >
          Moderate
        </Button>{' '}
        <Button
          isSecondary
          isPressed={calcium === 'heavy'}
          onClick={() => setCalcium('heavy')}
        >
          Heavy
        </Button>
      </div>

      <div className="modal-actions" style={{ textAlign: 'right' }}>
        <Button isSecondary onClick={onClose} style={{ marginRight: '0.5em' }}>
          Cancel
        </Button>
        <Button
          isPrimary
          onClick={() => onSave({ severity, length, calcium })}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}
