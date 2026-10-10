import React, { useEffect, useId, useState } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import {
  classifyPat,
  getPatMeasurementError,
  PAT_ARTERIES,
  PAT_CATEGORIES,
  PAT_REFERENCES,
  patCategoryLabel,
} from '../data/pedalAccelerationTime';

export default function PedalAccelerationTime({ value = [], onChange }) {
  const fieldId = useId();
  const [expanded, setExpanded] = useState(value.length > 0);
  useEffect(() => {
    if (value.length > 0) setExpanded(true);
  }, [value.length]);
  const update = (index, key, next) => onChange(value.map((row, rowIndex) => (
    rowIndex === index ? { ...row, [key]: next } : row
  )));
  const add = () => onChange([
    ...value,
    { id: `pat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, artery: '', milliseconds: '' },
  ]);

  return (
    <section className="pat-assessment" data-testid="pat-assessment">
      <button
        type="button"
        className="pat-toggle"
        aria-expanded={expanded}
        aria-controls={`${fieldId}-content`}
        onClick={() => setExpanded(!expanded)}
      >
        <span>
          <strong>{__('Pedal acceleration time (PAT)', 'endoplanner')}</strong>
          <span className="pat-optional">{__('Optional', 'endoplanner')}</span>
        </span>
        <span aria-hidden="true">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div id={`${fieldId}-content`} className="pat-content">
          <p className="pat-description">
            {__('Record the time from systolic onset to peak flow in a pedal artery of the case limb. The category is calculated automatically; PAT complements the WIfI ischemia assessment.', 'endoplanner')}
          </p>
          {value.map((row, index) => {
            const result = classifyPat(row.milliseconds);
            const error = getPatMeasurementError(row);
            return (
              <div className="pat-measurement" key={row.id || index} data-testid="pat-measurement">
                <div className="pat-field">
                  <label htmlFor={`${fieldId}-artery-${index}`}>{__('Artery measured', 'endoplanner')}</label>
                  <select
                    id={`${fieldId}-artery-${index}`}
                    value={row.artery || ''}
                    onChange={(event) => update(index, 'artery', event.target.value)}
                  >
                    <option value="">{__('Choose artery…', 'endoplanner')}</option>
                    {PAT_ARTERIES.map((artery) => <option value={artery.id} key={artery.id}>{artery.label}</option>)}
                  </select>
                </div>
                <label htmlFor={`${fieldId}-ms-${index}`}>
                  {__('PAT (ms)', 'endoplanner')}
                  <input
                    id={`${fieldId}-ms-${index}`}
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    placeholder="e.g. 160"
                    value={row.milliseconds ?? ''}
                    onChange={(event) => update(index, 'milliseconds', event.target.value)}
                    aria-describedby={`${fieldId}-status-${index}`}
                  />
                </label>
                <div className="pat-result" id={`${fieldId}-status-${index}`} aria-live="polite">
                  <span className="pat-field-label">{__('PAT category', 'endoplanner')}</span>
                  <span className={`pat-category pat-category--${result?.tone || 'empty'}`}>
                    {result ? patCategoryLabel(result) : __('Enter PAT to classify', 'endoplanner')}
                  </span>
                  {result?.category && <small>{result.range}</small>}
                  {error && <small className="pat-error">{error}</small>}
                </div>
                <button
                  type="button"
                  className="pat-remove"
                  aria-label={`Remove PAT measurement ${index + 1}`}
                  onClick={() => onChange(value.filter((_, rowIndex) => rowIndex !== index))}
                >×</button>
              </div>
            );
          })}
          <button type="button" className="pat-add" onClick={add}>
            {value.length ? __('+ Add another artery', 'endoplanner') : __('+ Add PAT measurement', 'endoplanner')}
          </button>
          <details className="pat-reference">
            <summary>{__('Category ranges & references', 'endoplanner')}</summary>
            <div className="pat-range-list">
              {PAT_CATEGORIES.map((category) => (
                <span key={category.category} className={`pat-category pat-category--${category.tone}`}>
                  {`${category.category}: ${category.range} · ${category.label}`}
                </span>
              ))}
            </div>
            <p>{__('Exactly 225 ms is left unassigned by the published 181–224 / >225 ms ranges and is shown as a boundary value. Confirm the category against your local vascular-laboratory protocol.', 'endoplanner')}</p>
            {PAT_REFERENCES.map((reference) => (
              <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer">{reference.label}</a>
            ))}
          </details>
        </div>
      )}
    </section>
  );
}

PedalAccelerationTime.propTypes = {
  value: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func.isRequired,
};
