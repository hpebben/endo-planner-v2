import React from 'react';
import PropTypes from 'prop-types';
import InlineModal from './InlineModal';

export default function ReferenceModal({ isOpen, onRequestClose, reference }) {
  if (!isOpen || !reference) return null;

  return (
    <InlineModal
      title={`Reference ${reference.number}`}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      <div className="citation-text">{reference.citation}</div>
      <ul className="reference-links">
        {reference.pdf && (
          <li>PDF: {reference.pdf}</li>
        )}
        {reference.pubmed && (
          <li>PubMed: {reference.pubmed}</li>
        )}
      </ul>
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={onRequestClose}>
          &times;
        </button>
      </div>
    </InlineModal>
  );
}

ReferenceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  reference: PropTypes.shape({
    number: PropTypes.number,
    citation: PropTypes.string,
    pdf: PropTypes.string,
    pubmed: PropTypes.string,
  }),
};
