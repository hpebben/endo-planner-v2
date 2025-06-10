// src/components/steps/Step2_Patency.jsx

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';
import SliderModal from '../UI/SliderModal';
import VesselMap from '../components/VesselMap';

// List every <g id="..."> exactly as it appears in the SVG
const vesselSegments = [
  { id: 'Aorta', name: __( 'Aorta', 'endoplanner' ) },
  { id: 'Left_iliac', name: __( 'Left Iliac', 'endoplanner' ) },
  { id: 'Right_iliac', name: __( 'Right Iliac', 'endoplanner' ) },
  { id: 'Left_femoral', name: __( 'Left Femoral', 'endoplanner' ) },
  { id: 'Right_femoral', name: __( 'Right Femoral', 'endoplanner' ) },
];

export default function Step2({ data, setData }) {
  const blockProps = useBlockProps();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState(null);
  const segments = data.patencySegments || {};

  // refs for each vessel segment
  const segmentRefs = useMemo(() => {
    const refs = {};
    vesselSegments.forEach((seg) => {
      refs[seg.id] = React.createRef();
    });
    return refs;
  }, []);

  const segmentColors = useMemo(() => {
    const colors = {};
    vesselSegments.forEach((seg) => {
      const vals = segments[seg.id] || { severity: 0 };
      colors[seg.id] =
        vals.severity >= 100 ? '#d63638' :
        vals.severity > 0   ? '#f5a623' :
                              '#7fc241';
    });
    return colors;
  }, [segments]);

  const handleSegmentClick = (id) => {
    setActiveSegment(id);
    setModalOpen(true);
  };

  // Called when user clicks “Save” in the SliderModal
  const handleSave = (values) => {
    const updated = {
      ...segments,
      [activeSegment]: values,
    };
    setData({ ...data, patencySegments: updated });
    setModalOpen(false);
    setActiveSegment(null);
  };

  return (
    <div {...blockProps} className="vessel-patency-container">
      <div className="vessel-map-center">
        <VesselMap
          segmentRefs={segmentRefs}
          segmentColors={segmentColors}
          onSegmentClick={handleSegmentClick}
        />
      </div>
      <SliderModal
          isOpen={modalOpen}
          segment={activeSegment}
          values={segments[activeSegment] || {
            severity: 0,
            length: 0,
            calcium: 'none',
          }}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />

      <aside className="patency-summary-sidebar">
        <h4>{ __( 'Selected Vessel Data', 'endoplanner' ) }</h4>
        <ul>
          {Object.entries(segments).map(([id, vals]) => (
            <li key={id}>
              <strong>{vesselSegments.find((s) => s.id === id)?.name || id}</strong>
              : {vals.severity}% stenosis, {vals.length} cm, {vals.calcium}{' '}
              <Button
                isSecondary
                onClick={() => {
                  setActiveSegment(id);
                  setModalOpen(true);
                }}
              >
                { __( 'Edit', 'endoplanner' ) }
              </Button>
            </li>
          ))}
          {Object.keys(segments).length === 0 && (
            <li>{ __( 'No segments set yet.', 'endoplanner' ) }</li>
          )}
        </ul>
      </aside>
    </div>
  );
}

Step2.propTypes = {
  data: PropTypes.shape({
    patencySegments: PropTypes.objectOf(
      PropTypes.shape({
        severity: PropTypes.number,
        length: PropTypes.number,
        calcium: PropTypes.string,
      })
    ),
  }).isRequired,
  setData: PropTypes.func.isRequired,
};
