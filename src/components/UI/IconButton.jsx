import { Tooltip } from '@wordpress/components';

export default function IconButton({ icon, label, tooltip, isSelected, onClick }) {
  const button = (
    <button
      className={`icon-button ${ isSelected ? 'selected' : '' }`}
      onClick={onClick}
      type="button"
    >
      <span className={`dashicons dashicons-${icon}`}></span>
      <div className="label">{ label }</div>
    </button>
  );

  return tooltip ? <Tooltip text={tooltip}>{button}</Tooltip> : button;
}
