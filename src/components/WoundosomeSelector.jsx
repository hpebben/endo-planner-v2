import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import {
  getWoundosomeAdvice,
  WOUNDOSOME_REFERENCE,
  WOUND_ZONES,
} from '../data/woundosome';
import { WOUND_PROJECTIONS } from '../data/woundosomeProjections';
import apAngiogram from '../assets/woundosome/foot-angiogram-ap.png';
import lateralAngiogram from '../assets/woundosome/foot-angiogram-lateral.png';

const ANGIOGRAMS = { ap: apAngiogram, lateral: lateralAngiogram };

export default function WoundosomeSelector({ value = [], onChange }) {
  const [inspected, setInspected] = useState('');
  const selected = new Set(value);
  const advice = getWoundosomeAdvice(value);

  const toggle = (id) => {
    const next = selected.has(id)
      ? value.filter((zoneId) => zoneId !== id)
      : [...value, id];
    onChange(next);
  };

  const onKeyDown = (event, id) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggle(id);
  };

  return (
    <section className="woundosome-selector" data-testid="woundosome-selector">
      <div className="woundosome-heading">
        <div>
          <h2 className="section-title">{__('Wound location (woundosome)', 'endoplanner')}</h2>
          <p className="section-subtitle">
            {__('Select every ulcer or gangrene location on the angiograms or in the color key. Matching colors and numbers identify the same location in both projections.', 'endoplanner')}
          </p>
        </div>
        {value.length > 0 && (
          <button type="button" className="woundosome-clear" onClick={() => onChange([])}>
            {__('Clear', 'endoplanner')}
          </button>
        )}
      </div>

      <div className="woundosome-projections">
        {WOUND_PROJECTIONS.map((projection) => (
          <figure className="woundosome-projection" key={projection.id}>
            <figcaption>{projection.label}</figcaption>
            <svg
              className="woundosome-map"
              viewBox={`0 0 ${projection.width} ${projection.height}`}
              role="group"
              aria-label={`${projection.label} foot angiogram — wound locations`}
              data-testid={`woundosome-${projection.id}`}
            >
              <image
                href={ANGIOGRAMS[projection.id]}
                width={projection.width}
                height={projection.height}
                aria-hidden="true"
                preserveAspectRatio="none"
              />
              {WOUND_ZONES.map((zone, index) => {
                const location = projection.locations[zone.id];
                if (!location) return null;
                const marker = location.marker || [location.x, location.y];
                const isSelected = selected.has(zone.id);
                const isInspected = inspected === zone.id;
                return (
                  <g
                    key={zone.id}
                    role="checkbox"
                    aria-label={`${zone.label} — ${projection.label}`}
                    aria-checked={isSelected}
                    tabIndex="0"
                    className={`wound-zone${isSelected ? ' is-selected' : ''}${isInspected ? ' is-inspected' : ''}`}
                    style={{ '--zone-color': zone.color }}
                    data-testid={`wound-zone-${projection.id}-${zone.id}`}
                    onClick={() => toggle(zone.id)}
                    onKeyDown={(event) => onKeyDown(event, zone.id)}
                    onMouseEnter={() => setInspected(zone.id)}
                    onMouseLeave={() => setInspected('')}
                    onFocus={() => setInspected(zone.id)}
                    onBlur={() => setInspected('')}
                  >
                    <ellipse
                      className="wound-zone-area"
                      cx={location.x}
                      cy={location.y}
                      rx={location.rx}
                      ry={location.ry}
                      transform={`rotate(${location.rotate || 0} ${location.x} ${location.y})`}
                    />
                    {location.marker && (
                      <line
                        className="wound-zone-leader"
                        x1={location.x}
                        y1={location.y}
                        x2={marker[0]}
                        y2={marker[1]}
                      />
                    )}
                    <circle className="wound-zone-hit" cx={marker[0]} cy={marker[1]} r="22" />
                    <circle className="wound-zone-marker" cx={marker[0]} cy={marker[1]} r="14" />
                    <text x={marker[0]} y={marker[1]} className="wound-zone-number" aria-hidden="true">{index + 1}</text>
                    <title>{`${zone.label}${isSelected ? ' — selected' : ''}`}</title>
                  </g>
                );
              })}
            </svg>
          </figure>
        ))}
      </div>

      <p className="woundosome-image-caption">
        {__('Reference left-foot angiograms: Patrone et al. (2024), Fig. 3A–B, © The Author(s). Colors mark approximate projected wound locations; dorsal/plantar and medial/lateral tissues can overlap in these views.', 'endoplanner')}
      </p>
      <div className="woundosome-zone-list" aria-label={__('Wound locations', 'endoplanner')}>
        {WOUND_ZONES.map((zone, index) => (
          <button
            type="button"
            key={zone.id}
            className={`${selected.has(zone.id) ? 'is-selected' : ''}${inspected === zone.id ? ' is-inspected' : ''}`}
            style={{ '--zone-color': zone.color }}
            aria-pressed={selected.has(zone.id)}
            onClick={() => toggle(zone.id)}
            onMouseEnter={() => setInspected(zone.id)}
            onMouseLeave={() => setInspected('')}
            onFocus={() => setInspected(zone.id)}
            onBlur={() => setInspected('')}
          >
            <span className="wound-zone-dot" aria-hidden="true">{index + 1}</span>
            <span>{zone.label}</span>
            {selected.has(zone.id) && <span className="wound-zone-check" aria-hidden="true">✓</span>}
          </button>
        ))}
      </div>

      <div className="woundosome-advice" aria-live="polite">
        {advice.zones.length ? (
          <>
            <strong>{__('TAP revascularization to consider', 'endoplanner')}</strong>
            <p>{advice.primaryLabels.join(' + ')}</p>
            <ul>
              {advice.routes.map((route) => <li key={route}>{route}</li>)}
            </ul>
            {advice.alternativeLabels.length > 0 && (
              <p>
                <b>{__('Collateral/alternative route to assess', 'endoplanner')}:</b>{' '}
                {advice.alternativeLabels.join(' + ')}
              </p>
            )}
            <p className="woundosome-caution">
              {__('Confirm the true feeding artery with AP and lateral foot angiography. A patent pedal arch or robust collaterals may make indirect revascularization effective; multi-zone wounds may require more than one inflow route.', 'endoplanner')}
            </p>
          </>
        ) : (
          <p>{__('Select at least one wound location to generate a TAP consideration.', 'endoplanner')}</p>
        )}
        <a href={WOUNDOSOME_REFERENCE.url} target="_blank" rel="noreferrer">
          {WOUNDOSOME_REFERENCE.label}
        </a>
      </div>
    </section>
  );
}

WoundosomeSelector.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};
