import React from 'react';
import PropTypes from 'prop-types';
import InlineModal from './InlineModal';

const referenceMap = {
  table6:
    'https://raw.githubusercontent.com/openvascular/endo-planner-assets/main/table_vi.png',
  table5:
    'https://raw.githubusercontent.com/openvascular/endo-planner-assets/main/table5.png',
  table54:
    'https://raw.githubusercontent.com/openvascular/endo-planner-assets/main/table5_4.png',
  'glass-table':
    'https://raw.githubusercontent.com/openvascular/endo-planner-assets/main/glass-table.png',
};

export default function ReferencePopup({ isOpen, onRequestClose, figure, title, highlight, citation, page, link }) {
  const imgFile = referenceMap[figure];
  const [missing, setMissing] = React.useState(false);

  const ImageFigure = () => (
    <figure className="guideline-figure">
      {imgFile && !missing ? (
        <img src={imgFile} alt={title} onError={() => setMissing(true)} />
      ) : (
        <div className="missing-ref">
          Please upload a screenshot of {title}
          {page ? ` from page ${page}` : ''}
          {citation ? ` of ${citation}` : ''} here.
        </div>
      )}
    </figure>
  );

  const Figure6 = () => {
    const rows = [
      { stage: 'I', success: '95–98%', patency: '80–90%' },
      { stage: 'II', success: '85–90%', patency: '60–70%' },
      { stage: 'III', success: '65–80%', patency: '40–55%' },
    ];
    return (
      <table className="guideline-table">
        <thead>
          <tr>
            <th>GLASS stage</th>
            <th>Technical success</th>
            <th>1-year primary patency</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.stage} className={r.stage === highlight ? 'highlight' : ''}>
              <td>{r.stage}</td>
              <td>{r.success}</td>
              <td>{r.patency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderFigure = () => {
    if (figure === 'figure6') return <Figure6 />;
    return <ImageFigure />;
  };

  return (
    <InlineModal title={title} isOpen={isOpen} onRequestClose={onRequestClose}>
      {renderFigure()}
      {citation && <div className="citation-text">{citation}</div>}
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
  figure: PropTypes.oneOf(['table6', 'table5', 'table54', 'figure6', 'glass-table', 'tasc-table']).isRequired,
  title: PropTypes.string.isRequired,
  highlight: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  citation: PropTypes.string,
  page: PropTypes.string,
  link: PropTypes.string,
};
