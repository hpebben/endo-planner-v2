// src/components/steps/Step5_Export.jsx
import React from 'react';
import { Button } from '@wordpress/components';
import jsPDF from 'jspdf';

export default function Step5({ data }) {
  const handleExport = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 40;

    doc.setFontSize(18);
    doc.text('EndoPlanner Report', 40, y);
    y += 30;

    doc.setFontSize(14);
    doc.text('1. Clinical Indication', 40, y);
    y += 20;
    [
      `Stage: ${data.stage || '-'}`,
      `Wound: ${data.wound || '-'}`,
      `Ischemia: ${data.ischemia || '-'}`,
      `Infection: ${data.infection || '-'}`,
    ].forEach((line) => { doc.text(line, 60, (y += 16)); });
    y += 10;

    doc.setFontSize(14);
    doc.text('2. Vessel Patency', 40, y);
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
      doc.text('- No data entered', 60, (y += 16));
    }
    y += 10;

    doc.setFontSize(14);
    doc.text('4. Planned Interventions', 40, y);
    y += 20;
    if (data.interventions && data.interventions.length) {
      data.interventions.forEach((key) => {
        doc.text(`- ${key}`, 60, (y += 16));
      });
    } else {
      doc.text('- None selected', 60, (y += 16));
    }
    y += 10;

    if (data.interventionNotes) {
      doc.setFontSize(14);
      doc.text('Notes:', 40, y);
      y += 20;
      doc.setFontSize(12);
      doc.text(data.interventionNotes, 60, y);
    }

    doc.save('EndoPlanner_Report.pdf');
  };

  return (
    <div className="step5-export">
      <h3>5. Review & Export</h3>
      <Button isPrimary onClick={handleExport}>
        Download PDF
      </Button>
    </div>
  );
}
