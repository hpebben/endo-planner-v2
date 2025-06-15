import { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import Step1 from './steps/Step1_Clinical';
import Step2 from './steps/Step2_Patency';
import Step3 from './steps/Step3_Summary';
import Step4 from './steps/Step4_Intervention';
import Step5 from './steps/Step5_Export';
import { ProgressBar, Button } from '@wordpress/components';

const steps = [
  { title: __( 'Clinical Indication', 'endoplanner' ), component: Step1 },
  { title: __( 'Vessel Patency', 'endoplanner' ),      component: Step2 },
  { title: __( 'Case Summary', 'endoplanner' ),        component: Step3 },
  { title: __( 'Intervention Plan', 'endoplanner' ),   component: Step4 },
  { title: __( 'Export EndoPlan', 'endoplanner' ),     component: Step5 },
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

  const next = () => setCurrent( Math.min(current + 1, steps.length - 1) );
  const prev = () => setCurrent( Math.max(current - 1, 0) );

  return (
    <div className="endo-wizard">
      <ProgressBar value={(current + 1) / steps.length} />
      <h2>{ steps[current].title }</h2>
      <StepComponent data={data} setData={setData} />
      <div className="wizard-nav">
        { current > 0 && <Button onClick={prev}>{ __( 'Back', 'endoplanner' ) }</Button> }
        { current < steps.length - 1
            ? <Button isSecondary className="stage-button" onClick={next}>{ __( 'Next', 'endoplanner' ) }</Button>
            : <Button isPrimary onClick={() => {/* handle final submit */}}>{ __( 'Finish', 'endoplanner' ) }</Button>
        }
      </div>
    </div>
  );
}
