// src/components/steps/Step5_Export.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    const clinical = data.clinical || {};
    [
      `${__( 'Stage', 'endoplanner' )}: ${data.stage || '-'}`,
      `${__( 'Wound', 'endoplanner' )}: ${clinical.wound || '-'}`,
      `${__( 'Ischemia', 'endoplanner' )}: ${clinical.ischemia || '-'}`,
      `${__( 'Infection', 'endoplanner' )}: ${clinical.infection || '-'}`,
    ].forEach((line) => { doc.text(line, 60, (y += 16)); });
    y += 10;

    doc.setFontSize(14);
    doc.text(__( '2. Disease Anatomy', 'endoplanner' ), 40, y);
    y += 10;
    if (data.patencySegments && Object.keys(data.patencySegments).length) {
      const rows = Object.entries(data.patencySegments).map(([id, v]) => [
        id,
        v.type,
        v.length,
        v.calcium,
      ]);
      autoTable(doc, {
        startY: y,
        head: [
          [
            __('Segment', 'endoplanner'),
            __('Type', 'endoplanner'),
            __('Length (cm)', 'endoplanner'),
            __('Calcification', 'endoplanner'),
          ],
        ],
        body: rows,
      });
      y = doc.lastAutoTable.finalY + 10;
    } else {
      doc.text(__( '- No data entered', 'endoplanner' ), 60, (y += 16));
      y += 10;
    }

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
    </div>
  );
}

Step5.propTypes = {
  data: PropTypes.shape({
    stage: PropTypes.string,
    clinical: PropTypes.shape({
      wound: PropTypes.string,
      ischemia: PropTypes.string,
      infection: PropTypes.string,
    }),
    patencySegments: PropTypes.objectOf(
      PropTypes.shape({
        type: PropTypes.string,
        length: PropTypes.string,
        calcium: PropTypes.string,
      })
    ),
    interventions: PropTypes.arrayOf(PropTypes.string),
    interventionNotes: PropTypes.string,
  }).isRequired,
};
