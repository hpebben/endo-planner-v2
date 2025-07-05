import React from 'react';
import PropTypes from 'prop-types';
import InlineModal from './InlineModal';

export default function ReferencePopup({ isOpen, onRequestClose, figure, title, highlight }) {
  const Table6 = () => {
    const rows = [
      { stage: 1, cat: "Very Low", amp: "1–3%", mort: "5–10%" },
      { stage: 2, cat: "Low", amp: "5–10%", mort: "10–15%" },
      { stage: 3, cat: "Moderate", amp: "15–25%", mort: "15–30%" },
      { stage: 4, cat: "High", amp: "30–55%", mort: "25–40%" },
    ];
    return (
      <table className="guideline-table">
        <thead>
          <tr>
            <th>WIfI stage</th>
            <th>Risk category</th>
            <th>1-year major amputation</th>
            <th>1-year mortality</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.stage} className={r.stage === highlight ? "highlight" : ""}>
              <td>{r.stage}</td>
              <td>{r.cat}</td>
              <td>{r.amp}</td>
              <td>{r.mort}</td>
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

  const Table54 = () => (
    <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1rem 0' }}>
      <caption style={{ captionSide: 'bottom', textAlign: 'left', fontStyle: 'italic', fontSize: '0.9em' }}>
        Table 5.4: Descriptive summary of Global Limb Anatomic Staging System (GLASS) stages of infrainguinal arterial disease.
        <br />
        Source: <a href="https://esvs.org/wp-content/uploads/2021/08/CLTI-Guidelines-ESVS-SVS-WFVS.pdf" target="_blank">Global Vascular Guidelines on the Management of Chronic Limb-Threatening Ischemia (CLTI). J Vasc Surg. 2019;69(6S):3S-125S.</a>
      </caption>
      <thead>
        <tr style={{ background: '#f2f2f2' }}>
          <th style={{ padding: '8px', border: '1px solid #ccc' }}>GLASS Stage</th>
          <th style={{ padding: '8px', border: '1px solid #ccc' }}>Estimated Technical Failure Rate (%)</th>
          <th style={{ padding: '8px', border: '1px solid #ccc' }}>1-year Limb-Based Patency (%)</th>
          <th style={{ padding: '8px', border: '1px solid #ccc' }}>Risk Category</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: '8px', border: '1px solid #ccc' }}>I (Low)</td>
          <td style={{ padding: '8px', border: '1px solid #ccc' }}>2–5</td>
          <td style={{ padding: '8px', border: '1px solid #ccc' }}>85–90</td>
          <td style={{ padding: '8px', border: '1px solid #ccc' }}>Low</td>
        </tr>
        <tr>
          <td style={{ padding: '8px', border: '1px solid #ccc' }}>II (Moderate)</td>
          <td style={{ padding: '8px', border: '1px solid #ccc' }}>6–15</td>
          <td style={{ padding: '8px', border: '1px solid #ccc' }}>75–85</td>
          <td style={{ padding: '8px', border: '1px solid #ccc' }}>Moderate</td>
        </tr>
        <tr>
          <td style={{ padding: '8px', border: '1px solid #ccc' }}>III (High)</td>
          <td style={{ padding: '8px', border: '1px solid #ccc' }}>16–25</td>
          <td style={{ padding: '8px', border: '1px solid #ccc' }}>&lt;65</td>
          <td style={{ padding: '8px', border: '1px solid #ccc' }}>High</td>
        </tr>
      </tbody>
    </table>
  );

  const renderFigure = () => {
    switch (figure) {
      case 'table6':
        return <Table6 />;
      case 'table54':
        return <Table54 />;
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
  figure: PropTypes.oneOf(['table6', 'table5', 'table54', 'figure6']).isRequired,
  title: PropTypes.string.isRequired,
  highlight: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};
