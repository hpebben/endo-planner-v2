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
      <div className="citation-text">
        {reference.citation}
        {reference.pubmed && (
          <> <a href={reference.pubmed} target="_blank" rel="noopener noreferrer">PubMed</a></>
        )}
      </div>
      {Array.isArray(reference.images) && reference.images.map((src, i) => (
        <img key={i} src={src} alt="Reference figure" className="ref-image" />
      ))}
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
    pubmed: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
  }),
};
