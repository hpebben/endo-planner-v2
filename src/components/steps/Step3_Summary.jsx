// src/components/steps/Step3_Summary.jsx
import React from 'react';

export default function Step3({ data }) {
  const {
    stage,
    wound,
    ischemia,
    infection,
    patencySegments = {},
  } = data;

  return (
    <div className="step3-summary">
      <section>
        <h3>1. Clinical Indication</h3>
        <ul>
          <li><strong>Stage:</strong> {stage || '—'}</li>
          <li><strong>Wound Grade:</strong> {wound || '—'}</li>
          <li><strong>Ischemia:</strong> {ischemia || '—'}</li>
          <li><strong>Infection:</strong> {infection || '—'}</li>
        </ul>
      </section>

      <section>
        <h3>2. Vessel Patency</h3>
        {Object.keys(patencySegments).length > 0 ? (
          <table className="patency-table">
            <thead>
              <tr>
                <th>Segment</th>
                <th>Stenosis (%)</th>
                <th>Length (cm)</th>
                <th>Calcification</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(patencySegments).map(([id, vals]) => (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{vals.severity}</td>
                  <td>{vals.length}</td>
                  <td>{vals.calcium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No vessel data has been entered yet.</p>
        )}
      </section>
    </div>
  );
}
