import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

export default function InlineModal({ title, isOpen, onRequestClose, children }) {
  const modalRef = useRef(null);
  const prevFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    prevFocusRef.current = document.activeElement;

    const focusTimer = setTimeout(() => {
      if (modalRef.current) modalRef.current.focus();
    }, 0);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onRequestClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      if (prevFocusRef.current && typeof prevFocusRef.current.focus === 'function') {
        prevFocusRef.current.focus();
      }
    };
  }, [isOpen, onRequestClose]);

  if (!isOpen) return null;

  const modal = (
    <div
      className="inline-modal-overlay"
      onMouseDown={onRequestClose}
      onClick={onRequestClose}
    >
      <div
        className="inline-modal centered"
        role="dialog"
        aria-modal="true"
        tabIndex="-1"
        ref={modalRef}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        {title ? <div className="modal-header">{title}</div> : null}
        {children}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

InlineModal.propTypes = {
  title: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
