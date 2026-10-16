import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import FootAngiographicModel from './FootAngiographicModel';
import { WOUND_PROJECTIONS } from '../data/woundosomeProjections';
import { getWoundZones, WOUND_ZONES } from '../data/woundosome';
import { getPedalRouteHighlights } from '../data/pedalRoutes';

export default function SelectedWoundosomeSummary({ selectedIds, targetPath = [], imagesOnly = false }) {
  const zones = getWoundZones(selectedIds);
  const right = /^Right_/.test(targetPath[0] || '');
  if (!zones.length) return null;
  return (
    <section className="selected-woundosomes" data-testid="selected-woundosomes" aria-label={__('Selected woundosomes', 'endoplanner')}>
      {!imagesOnly && <h3>{__('Selected woundosomes', 'endoplanner')}</h3>}
      <div className="selected-woundosome-views">
        {WOUND_PROJECTIONS.map((projection) => (
          <figure key={projection.id}>
            <figcaption>{projection.label.replace('left foot', right ? 'right foot' : 'left foot')}</figcaption>
            <svg viewBox={`0 0 ${projection.width} ${projection.height}`} role="img" aria-label={`${projection.label.replace('left foot', right ? 'right foot' : 'left foot')}: ${zones.map((zone) => zone.label).join(', ')}`}>
              <g transform={right ? `translate(${projection.width} 0) scale(-1 1)` : undefined}>
              <FootAngiographicModel viewId={projection.id} routeHighlights={getPedalRouteHighlights(targetPath)} />
              {zones.map((zone) => {
                const location = projection.locations[zone.id];
                if (!location) return null;
                const marker = location.marker || [location.x, location.y];
                return (
                  <g key={zone.id} className="wound-zone is-selected" style={{ '--zone-color': zone.color }} data-wound-id={zone.id}>
                    <ellipse className="wound-zone-area" cx={location.x} cy={location.y} rx={location.rx} ry={location.ry} transform={`rotate(${location.rotate || 0} ${location.x} ${location.y})`} />
                    {location.marker && <line className="wound-zone-leader" x1={location.x} y1={location.y} x2={marker[0]} y2={marker[1]} />}
                    <circle className="wound-zone-marker" cx={marker[0]} cy={marker[1]} r="17" />
                    <text transform={right ? `translate(${2 * marker[0]} 0) scale(-1 1)` : undefined} className="wound-zone-number" x={marker[0]} y={marker[1]}>{WOUND_ZONES.indexOf(zone) + 1}</text>
                  </g>
                );
              })}
              </g>
            </svg>
            <p>{projection.id === 'ap' ? __('Hallux = medial · fifth ray = lateral', 'endoplanner') : __('Dorsal above plantar · heel surfaces overlap', 'endoplanner')}</p>
          </figure>
        ))}
      </div>
      {!imagesOnly && <ul className="selected-woundosome-key">
        {zones.map((zone) => (
          <li key={zone.id} style={{ '--zone-color': zone.color }}>
            <span className="wound-zone-dot" aria-hidden="true">{WOUND_ZONES.indexOf(zone) + 1}</span>
            <span>{zone.label}</span>
          </li>
        ))}
      </ul>}
      {!imagesOnly && <p className="selected-woundosome-caption">{__('Patent reference anatomy; colors mark wound locations. Blue follows the planned pedal route. Confirm the route and wound filling on the patient’s angiography.', 'endoplanner')}</p>}
    </section>
  );
}

SelectedWoundosomeSummary.propTypes = {
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  targetPath: PropTypes.arrayOf(PropTypes.string),
  imagesOnly: PropTypes.bool,
};
