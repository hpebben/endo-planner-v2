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
      <ul className="reference-links">
        {reference.pubmed && (
          <li>
            <a href={reference.pubmed} target="_blank" rel="noopener noreferrer">
              PubMed
            </a>
          </li>
        )}
        {reference.fulltext && (
          <li>
            <a href={reference.fulltext} target="_blank" rel="noopener noreferrer">
              Full text
            </a>
          </li>
        )}
      </ul>
      {reference.html && (
        <div
          className="guideline-table-wrapper"
          dangerouslySetInnerHTML={{ __html: reference.html }}
        />
      )}
      {Array.isArray(reference.images) && (
        <div className="ref-images-row">
          {reference.images.map((src, i) => (
            <figure key={`i${i}`}>
              <img
                src={src}
                alt="Reference figure"
                className={`ref-image ${reference.imageClass || ''}`}
              />
              {reference.captions && reference.captions[i] && (
                <figcaption>{reference.captions[i]}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
      <div className="citation-text">{reference.citation}</div>
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
    fulltext: PropTypes.string,
    html: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    captions: PropTypes.arrayOf(PropTypes.string),
    imageClass: PropTypes.string,
  }),
};
