// src/components/steps/Step3_Summary.jsx
import React from 'react';
import { __ } from '@wordpress/i18n';

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
        <h3>{ __( '1. Clinical Indication', 'endoplanner' ) }</h3>
        <ul>
          <li><strong>{ __( 'Stage:', 'endoplanner' ) }</strong> {stage || '—'}</li>
          <li><strong>{ __( 'Wound Grade:', 'endoplanner' ) }</strong> {wound || '—'}</li>
          <li><strong>{ __( 'Ischemia:', 'endoplanner' ) }</strong> {ischemia || '—'}</li>
          <li><strong>{ __( 'Infection:', 'endoplanner' ) }</strong> {infection || '—'}</li>
        </ul>
      </section>

      <section>
        <h3>{ __( '2. Vessel Patency', 'endoplanner' ) }</h3>
        {Object.keys(patencySegments).length > 0 ? (
          <table className="patency-table">
            <thead>
              <tr>
                <th>{ __( 'Segment', 'endoplanner' ) }</th>
                <th>{ __( 'Stenosis (%)', 'endoplanner' ) }</th>
                <th>{ __( 'Length (cm)', 'endoplanner' ) }</th>
                <th>{ __( 'Calcification', 'endoplanner' ) }</th>
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
          <p>{ __( 'No vessel data has been entered yet.', 'endoplanner' ) }</p>
        )}
      </section>
    </div>
  );
}
