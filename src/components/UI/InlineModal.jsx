import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

export default function InlineModal({ title, isOpen, onRequestClose, children }) {
  const ref = useRef(null);
  const prevFocus = useRef(null);

  useEffect(() => {
    if (isOpen) {
      prevFocus.current = document.activeElement;
      setTimeout(() => ref.current?.focus(), 0);
    }
    return () => {
      if (isOpen) prevFocus.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="inline-modal-overlay" onClick={onRequestClose}>
      <div
        className="inline-modal centered"
        onClick={(e) => e.stopPropagation()}
        ref={ref}
        tabIndex="-1"
      >
        <div className="modal-header">{title}</div>
        {children}
      </div>
    </div>
  );
}

InlineModal.propTypes = {
  title: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
