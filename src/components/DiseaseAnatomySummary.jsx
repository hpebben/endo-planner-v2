import React from 'react';
import PropTypes from 'prop-types';
import VesselMap from './VesselMap';

export default function DiseaseAnatomySummary({ data }) {
  const lesions = data.patencySegments || {};
  const targetPath = data.targetArterialPath || [];
  if (!Object.keys(lesions).length && !targetPath.length) return null;
  return (
    <figure className="summary-disease-visual" data-testid="summary-disease-visual">
      <div role="img" aria-label="Selected disease anatomy: red lesion outlines and extent, blue target arterial path">
        <VesselMap selectedSegments={Object.keys(lesions)} lesions={lesions} targetSegments={targetPath} readOnly />
      </div>
      <figcaption><span className="summary-map-key summary-map-key--red" />Lesion outline / estimated extent<br /><span className="summary-map-key summary-map-key--blue" />Target arterial path</figcaption>
    </figure>
  );
}
DiseaseAnatomySummary.propTypes = { data: PropTypes.object.isRequired };
