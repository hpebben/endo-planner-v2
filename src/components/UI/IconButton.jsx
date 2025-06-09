import PropTypes from 'prop-types';

export default function IconButton({ icon, label, tooltip, isSelected, onClick }) {
  return (
    <button
      className={`icon-button ${ isSelected ? 'selected' : '' }`}
      onClick={onClick}
      type="button"
      title={tooltip}
      aria-label={tooltip || label}
    >
      <span className={`dashicons dashicons-${icon}`}></span>
      <div className="label">{ label }</div>
    </button>
  );
}

IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};
