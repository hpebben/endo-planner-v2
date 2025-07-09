import { useState, useEffect } from 'react';
import exportCaseSummaryToPDF from '../utils/exportCaseSummaryToPDF';
import { __ } from '@wordpress/i18n';
import Step1 from './steps/Step1_Clinical';
import Step2 from './steps/Step2_Patency';
import Step3 from './steps/Step4_Intervention';
import Step4 from './steps/Step3_Summary';
import { ProgressBar, Button } from '@wordpress/components';

const steps = [
  { title: __( 'Clinical indication', 'endoplanner' ), component: Step1 },
  { title: __( 'Disease anatomy', 'endoplanner' ),      component: Step2 },
  { title: __( 'Intervention plan', 'endoplanner' ),   component: Step3 },
  { title: __( 'Case summary', 'endoplanner' ),        component: Step4 },
];

export default function Wizard() {
  const [ current, setCurrent ] = useState( 0 );
  const [ data, setData ] = useState({}); // gather all selections

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('endoplannerState');
    if (saved) {
      try {
        const { step, data: savedData } = JSON.parse(saved);
        if (savedData) setData(savedData);
        if (typeof step === 'number') setCurrent(step);
      } catch (e) {
        /* ignore */
      }
    }
  }, []);

  // Persist progress
  useEffect(() => {
    localStorage.setItem(
      'endoplannerState',
      JSON.stringify({ step: current, data })
    );
  }, [current, data]);

  const StepComponent = steps[current].component;
  const setStep = (idx) => {
    if (typeof idx === 'number') {
      setCurrent(Math.min(Math.max(idx, 0), steps.length - 1));
    }
  };

  const next = () => setCurrent( Math.min(current + 1, steps.length - 1) );
  const prev = () => setCurrent( Math.max(current - 1, 0) );

  return (
    <div className="endo-wizard">
      <ProgressBar value={(current + 1) / steps.length} />
      <div className="wizard-content">
        <h2>{ steps[current].title }</h2>
        <StepComponent data={data} setData={setData} setStep={setStep} />
      </div>
      <div className="wizard-nav">
        { current > 0 && (
          <button type="button" className="stage-btn wizard-back" onClick={prev}>
            { __( 'Back', 'endoplanner' ) }
          </button>
        ) }
        { current < steps.length - 1 ? (
          <button
            type="button"
            className="stage-btn wizard-next"
            onClick={ next }
          >
            { __( 'Next', 'endoplanner' ) }
          </button>
        ) : (
          <button
            type="button"
            id="export-pdf-btn"
            className="stage-btn wizard-finish"
            onClick={ exportCaseSummaryToPDF }
          >
            { __( 'Export PDF', 'endoplanner' ) }
          </button>
        ) }
      </div>
    </div>
  );
}
