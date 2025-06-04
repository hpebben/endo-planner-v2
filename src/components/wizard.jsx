import { useState } from 'react';
import Step1 from './steps/Step1_Clinical';
import Step2 from './steps/Step2_Patency';
import Step3 from './steps/Step3_Summary';
import Step4 from './steps/Step4_Intervention';
import Step5 from './steps/Step5_Export';
import { ProgressBar, Button } from '@wordpress/components';

const steps = [
  { title: 'Clinical Indication', component: Step1 },
  { title: 'Vessel Patency',      component: Step2 },
  { title: 'Case Summary',        component: Step3 },
  { title: 'Intervention Plan',   component: Step4 },
  { title: 'Export EndoPlan',     component: Step5 },
];

export default function Wizard() {
  const [ current, setCurrent ] = useState( 0 );
  const [ data, setData ] = useState({}); // gather all selections

  const StepComponent = steps[current].component;

  const next = () => setCurrent( Math.min(current + 1, steps.length - 1) );
  const prev = () => setCurrent( Math.max(current - 1, 0) );

  return (
    <div className="endo-wizard">
      <ProgressBar value={(current + 1) / steps.length} />
      <h2>{ steps[current].title }</h2>
      <StepComponent data={data} setData={setData} />
      <div className="wizard-nav">
        { current > 0 && <Button onClick={prev}>Back</Button> }
        { current < steps.length - 1
            ? <Button isPrimary onClick={next}>Next</Button>
            : <Button isPrimary onClick={() => {/* handle final submit */}}>Finish</Button>
        }
      </div>
    </div>
  );
}
