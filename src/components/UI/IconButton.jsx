export default function IconButton({ icon, label, isSelected, onClick }) {
  return (
    <button
      className={`icon-button ${ isSelected ? 'selected' : '' }`}
      onClick={onClick}
      type="button"
    >
      <span className={`dashicons dashicons-${icon}`}></span>
      <div className="label">{ label }</div>
    </button>
  );
}
