import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import {
  getWoundosomeAdvice,
  WOUNDOSOME_REFERENCE,
  WOUND_ZONES,
} from '../data/woundosome';

const ZONE_SHAPES = {
  'dorsal-toes': <path d="M48 35 C57 19 77 13 94 19 L119 31 L114 54 L60 57 Z" />,
  'hallux-first-ray': <path d="M36 39 C39 19 54 8 67 14 L73 56 L51 66 Z" />,
  dorsum: <path d="M54 61 L113 57 L105 128 L54 132 L43 91 Z" />,
  'lateral-ankle': <path d="M105 128 L119 118 L124 157 L105 166 L96 143 Z" />,
  'plantar-toes': <path d="M218 31 C235 14 267 14 288 31 L281 57 L222 57 Z" />,
  'medial-plantar': <path d="M214 62 L245 58 L247 139 L220 151 L205 112 Z" />,
  'lateral-plantar': <path d="M249 59 L282 59 L290 124 L274 153 L247 139 Z" />,
  'medial-heel': <path d="M221 151 L247 141 L252 195 L226 207 L209 184 Z" />,
  'lateral-heel': <path d="M249 141 L274 154 L279 188 L259 207 L252 195 Z" />,
};

const zoneClassName = (selected) => `wound-zone${selected ? ' is-selected' : ''}`;

export default function WoundosomeSelector({ value = [], onChange }) {
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
            {__('Select every ulcer or gangrene location. The suggested TAP aims for direct wound-bed perfusion and does not replace angiographic assessment of pedal branches, arch and collaterals.', 'endoplanner')}
          </p>
        </div>
        {value.length > 0 && (
          <button type="button" className="woundosome-clear" onClick={() => onChange([])}>
            {__('Clear', 'endoplanner')}
          </button>
        )}
      </div>

      <div className="woundosome-layout">
        <svg
          className="woundosome-map"
          viewBox="0 0 330 230"
          role="group"
          aria-label={__('Simplified dorsal and plantar wound location map', 'endoplanner')}
        >
          <text x="80" y="224" textAnchor="middle">{__('Dorsal', 'endoplanner')}</text>
          <text x="250" y="224" textAnchor="middle">{__('Plantar', 'endoplanner')}</text>
          <path className="foot-outline" d="M36 39 C39 14 58 2 75 17 C91 11 120 25 123 43 C126 63 112 92 118 124 C125 166 106 207 80 211 C52 215 28 186 37 150 C44 122 34 98 31 76 C28 60 30 48 36 39 Z" />
          <path className="foot-outline" d="M207 42 C212 16 232 4 250 18 C267 11 292 27 294 46 C296 67 282 95 288 126 C295 166 279 207 253 211 C225 215 200 188 207 151 C213 121 202 98 200 77 C198 62 201 50 207 42 Z" />
          {WOUND_ZONES.map((zone) => (
            <g
              key={zone.id}
              role="checkbox"
              aria-label={zone.label}
              aria-checked={selected.has(zone.id)}
              tabIndex="0"
              className={zoneClassName(selected.has(zone.id))}
              onClick={() => toggle(zone.id)}
              onKeyDown={(event) => onKeyDown(event, zone.id)}
            >
              {ZONE_SHAPES[zone.id]}
              <title>{zone.label}</title>
            </g>
          ))}
        </svg>

        <div className="woundosome-zone-list" aria-label={__('Wound locations', 'endoplanner')}>
          {WOUND_ZONES.map((zone) => (
            <button
              type="button"
              key={zone.id}
              className={selected.has(zone.id) ? 'is-selected' : ''}
              aria-pressed={selected.has(zone.id)}
              onClick={() => toggle(zone.id)}
            >
              <span className={`wound-zone-dot wound-zone-dot--${zone.view}`} aria-hidden="true" />
              {zone.label}
            </button>
          ))}
        </div>
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
