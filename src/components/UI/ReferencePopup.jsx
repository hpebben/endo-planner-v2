import React from 'react';
import PropTypes from 'prop-types';
import InlineModal from './InlineModal';

const basePath = '/assets/guidelines';

export default function ReferencePopup({ isOpen, onRequestClose, figure, title, highlight }) {
  const Table6 = () => (
    <div className="guideline-figure">
      <figure>
        <img src={`${basePath}/table_vi.png`} alt="Table VI" />
      </figure>
      <figure>
        <img src={`${basePath}/figure7.png`} alt="Figure 7" />
      </figure>
      <figure>
        <img src={`${basePath}/figure8.png`} alt="Figure 8" />
        <figcaption>
          Table VI and Kaplan–Meier curves (Figures 7 &amp; 8) from the CLTI guidelines. Percentages are visually estimated from the curves.
          <br />
          Table/Figure reproduced from: Conte MS, Bradbury AW, Kolh P, et al. Global vascular guidelines on the management of chronic limb-threatening ischemia. J Vasc Surg. 2019;69(6S):3S-125S. PDF
        </figcaption>
      </figure>
    </div>
  );

  const Table5 = () => (
    <figure className="guideline-figure">
      <img src={`${basePath}/table5.png`} alt="Table 5" />
      <figcaption>
        Table 5: Factors increasing amputation risk.
        <br />
        Table/Figure reproduced from: Conte MS, Bradbury AW, Kolh P, et al. Global vascular guidelines on the management of chronic limb-threatening ischemia. J Vasc Surg. 2019;69(6S):3S-125S. PDF
      </figcaption>
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

  const Table54 = () => (
    <figure className="guideline-figure">
      <img src={`${basePath}/table5_4.png`} alt="Table 5.4" />
      <figcaption>
        Table 5.4: Descriptive summary of GLASS stages.
        <br />
        Table/Figure reproduced from: Conte MS, Bradbury AW, Kolh P, et al. Global vascular guidelines on the management of chronic limb-threatening ischemia. J Vasc Surg. 2019;69(6S):3S-125S. PDF
      </figcaption>
    </figure>
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
