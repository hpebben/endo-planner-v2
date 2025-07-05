import React from 'react';
import PropTypes from 'prop-types';
import InlineModal from './InlineModal';

export default function ReferencePopup({ isOpen, onRequestClose, figure, title, highlight }) {
  const Table4 = () => {
    const rows = [
      { stage: 1, risk: '1–3%' },
      { stage: 2, risk: '5–10%' },
      { stage: 3, risk: '15–25%' },
      { stage: 4, risk: '30–55%' },
    ];
    return (
      <table className="guideline-table">
        <thead>
          <tr>
            <th>WiFi stage</th>
            <th>1-year major amputation risk</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.stage} className={r.stage === highlight ? 'highlight' : ''}>
              <td>{r.stage}</td>
              <td>{r.risk}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const Table5 = () => {
    const rows = [
      { id: 'len10', label: 'Lesion length 10–15cm', change: '+2–5%' },
      { id: 'len20', label: 'Lesion length >20cm', change: '+5–7%' },
      { id: 'occl', label: 'Occlusion', change: '+3–5%' },
      { id: 'modcalc', label: 'Moderate calcification', change: '+1–3%' },
      { id: 'heavycalc', label: 'Heavy calcification', change: '+3–5%' },
    ];
    return (
      <table className="guideline-table">
        <thead>
          <tr>
            <th>Characteristic</th>
            <th>Risk increase</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={highlight?.includes(r.id) ? 'highlight' : ''}>
              <td>{r.label}</td>
              <td>{r.change}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

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
    switch (figure) {
      case 'table4':
        return <Table4 />;
      case 'table5':
        return <Table5 />;
      case 'figure6':
        return <Figure6 />;
      default:
        return null;
    }
  };

  return (
    <InlineModal title={title} isOpen={isOpen} onRequestClose={onRequestClose}>
      {renderFigure()}
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
  figure: PropTypes.oneOf(['table4', 'table5', 'figure6']).isRequired,
  title: PropTypes.string.isRequired,
  highlight: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};
