// src/components/steps/Step5_Export.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { jsPDF } from 'jspdf';

export default function Step5({ data }) {
  const handleExport = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 40;

    doc.setFontSize(18);
    doc.text(__( 'EndoPlanner Report', 'endoplanner' ), 40, y);
    y += 30;

    doc.setFontSize(14);
    doc.text(__( '1. Clinical Indication', 'endoplanner' ), 40, y);
    y += 20;
    [
      `${__( 'Stage', 'endoplanner' )}: ${data.stage || '-'}`,
      `${__( 'Wound', 'endoplanner' )}: ${data.wound || '-'}`,
      `${__( 'Ischemia', 'endoplanner' )}: ${data.ischemia || '-'}`,
      `${__( 'Infection', 'endoplanner' )}: ${data.infection || '-'}`,
    ].forEach((line) => { doc.text(line, 60, (y += 16)); });
    y += 10;

    doc.setFontSize(14);
    doc.text(__( '2. Vessel Patency', 'endoplanner' ), 40, y);
    y += 20;
    if (data.patencySegments) {
      Object.entries(data.patencySegments).forEach(([id, v]) => {
        doc.text(
          `${id}: ${v.severity}% stenosis, ${v.length} cm, ${v.calcium}`,
          60,
          (y += 16)
        );
      });
    } else {
      doc.text(__( '- No data entered', 'endoplanner' ), 60, (y += 16));
    }
    y += 10;

    doc.setFontSize(14);
    doc.text(__( '4. Planned Interventions', 'endoplanner' ), 40, y);
    y += 20;
    if (data.interventions && data.interventions.length) {
      data.interventions.forEach((key) => {
        doc.text(`- ${key}`, 60, (y += 16));
      });
    } else {
      doc.text(__( '- None selected', 'endoplanner' ), 60, (y += 16));
    }
    y += 10;

    if (data.interventionNotes) {
      doc.setFontSize(14);
      doc.text(__( 'Notes:', 'endoplanner' ), 40, y);
      y += 20;
      doc.setFontSize(12);
      doc.text(data.interventionNotes, 60, y);
    }

    doc.save(__( 'EndoPlanner_Report.pdf', 'endoplanner' ));
  };

  return (
    <div className="step5-export">
      <h3>{ __( '5. Review & Export', 'endoplanner' ) }</h3>
      <Button isPrimary onClick={handleExport}>
        { __( 'Download PDF', 'endoplanner' ) }
      </Button>
    </div>
  );
}

Step5.propTypes = {
  data: PropTypes.shape({
    stage: PropTypes.string,
    wound: PropTypes.string,
    ischemia: PropTypes.string,
    infection: PropTypes.string,
    patencySegments: PropTypes.objectOf(
      PropTypes.shape({
        severity: PropTypes.number,
        length: PropTypes.number,
        calcium: PropTypes.string,
      })
    ),
    interventions: PropTypes.arrayOf(PropTypes.string),
    interventionNotes: PropTypes.string,
  }).isRequired,
};
