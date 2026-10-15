import React, { useEffect, useId, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

export default function InlineModal({ title, isOpen, onRequestClose, children, className = '' }) {
  const modalRef = useRef(null);
  const prevFocusRef = useRef(null);
  const titleId = useId();

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
      if (event.key === 'Tab' && modalRef.current) {
        const elements = [...modalRef.current.querySelectorAll('button, a[href], input, select, textarea, summary, [tabindex="0"]')]
          .filter((element) => !element.disabled && element.getClientRects().length);
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first) {
          event.preventDefault();
          modalRef.current.focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === modalRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
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
        className={`inline-modal centered ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex="-1"
        ref={modalRef}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        {title ? <div className="modal-header" id={titleId}>{title}</div> : null}
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
  className: PropTypes.string,
};
