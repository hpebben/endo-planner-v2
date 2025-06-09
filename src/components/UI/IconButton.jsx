import { Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

export default function IconButton({ icon, label, tooltip, isSelected, onClick }) {
  const button = (
    <button
      className={`icon-button ${ isSelected ? 'selected' : '' }`}
      onClick={onClick}
      type="button"
      aria-label={tooltip || label}
    >
      <span className={`dashicons dashicons-${icon}`}></span>
      <div className="label">{ label }</div>
    </button>
  );

  return tooltip ? <Tooltip text={tooltip}>{ button }</Tooltip> : button;
}

IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};
