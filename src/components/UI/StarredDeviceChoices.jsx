import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

export default function StarredDeviceChoices({ profiles = [], onSelect }) {
  if (!profiles.length) return null;
  const label = (profile) => typeof profile === 'string' ? profile : [
    profile.product || profile.specific,
    profile.platform && `${profile.platform}″`,
    profile.frSize || profile.size,
    profile.diameter && `${profile.diameter} mm`,
    profile.length,
    profile.role || profile.type,
  ].filter(Boolean).join(' · ') || profile.category || __('Saved device', 'endoplanner');
  return (
    <div className="starred-device-choices" aria-label={__('Starred device choices', 'endoplanner')}>
      <strong>{__('Starred choices', 'endoplanner')}</strong>
      {profiles.map((profile, index) => (
        <button type="button" key={index} aria-label={`${__('Choose starred device', 'endoplanner')}: ${label(profile)}`} onClick={() => onSelect(profile)}>
          <span aria-hidden="true">★</span> {label(profile)}
        </button>
      ))}
    </div>
  );
}

StarredDeviceChoices.propTypes = {
  profiles: PropTypes.array,
  onSelect: PropTypes.func.isRequired,
};
