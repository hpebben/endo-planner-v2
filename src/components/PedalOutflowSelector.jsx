import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { footArteryIdForVessel, getPedalTargetOptions } from '../data/pedalRoutes';

export default function PedalOutflowSelector({ targetKey, targetPath, selectedWounds, onChange }) {
  const options = getPedalTargetOptions(targetKey, selectedWounds);
  if (!options.length) return null;
  const selected = footArteryIdForVessel(targetPath[targetPath.length - 1]);
  const groups = [...new Set(options.map((option) => option.group))].sort((a, b) => Number(b === 'Woundosome targets to assess') - Number(a === 'Woundosome targets to assess'));
  return (
    <div className="pedal-outflow-selector" data-testid="pedal-outflow-selector">
      <label>
        <span>{__('Pedal outflow target', 'endoplanner')}</span>
        <select value={options.some((option) => option.value === selected) ? selected : ''} onChange={(event) => onChange(event.target.value)}>
          <option value="" disabled>{__('Choose the artery beyond tibial inflow', 'endoplanner')}</option>
          {groups.map((group) => <optgroup key={group} label={group}>{options.filter((option) => option.group === group).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</optgroup>)}
        </select>
      </label>
      <p>{__('Choose the intended pedal, metatarsal, digital or heel branch. Woundosome suggestions identify routes to assess; confirm continuity and wound-bed filling on angiography.', 'endoplanner')}</p>
    </div>
  );
}

PedalOutflowSelector.propTypes = {
  targetKey: PropTypes.string.isRequired,
  targetPath: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedWounds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};
