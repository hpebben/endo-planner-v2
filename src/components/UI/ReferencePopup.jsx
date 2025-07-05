import React from 'react';
import PropTypes from 'prop-types';
import InlineModal from './InlineModal';

export default function ReferencePopup({ isOpen, onRequestClose, figure, title }) {
  const images = {
    table4:
      'https://raw.githubusercontent.com/scikit-image/scikit-image/main/skimage/data/camera.png',
    figure6:
      'https://raw.githubusercontent.com/scikit-image/scikit-image/main/skimage/data/coins.png',
  };
  return (
    <InlineModal title={title} isOpen={isOpen} onRequestClose={onRequestClose}>
      <img src={images[figure]} alt={title} style={{ maxWidth: '100%' }} />
      <div className="popup-close-row">
        <button type="button" className="circle-btn close-modal-btn" onClick={onRequestClose}>
          &times;
        </button>
      </div>
    </InlineModal>
  );
}

ReferencePopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  figure: PropTypes.oneOf(['table4', 'figure6']).isRequired,
  title: PropTypes.string.isRequired,
};
