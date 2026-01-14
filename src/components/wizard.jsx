import { useState, useEffect } from 'react';
import DEFAULTS from './Defaults';
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
  const [ data, setData ] = useState(DEFAULTS); // gather all selections

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('endoplannerState');
    if (saved) {
      try {
        const { step, data: savedData } = JSON.parse(saved);
        if (savedData) setData({ ...DEFAULTS, ...savedData });
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

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    if (current !== steps.length - 1) {
      return undefined;
    }

    let rafId;
    let attempts = 0;
    const maxAttempts = 8;

    const scrollToElementWithOffset = (element, offset) => {
      if (!element) {
        return;
      }
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    };

    const resolveStickyOffset = () => {
      const header = document.querySelector(
        '.site-header, header.site-header, .wp-site-blocks > header, header'
      );
      if (!header) {
        return 80;
      }
      const style = window.getComputedStyle(header);
      const height = header.getBoundingClientRect().height;
      if (style.position === 'fixed' || style.position === 'sticky') {
        return height || 80;
      }
      return height || 80;
    };

    const focusCaseSummary = () => {
      const summary =
        document.querySelector('#case-summary') ||
        document.querySelector('.case-summary');

      if (!summary) {
        attempts += 1;
        if (attempts <= maxAttempts) {
          rafId = requestAnimationFrame(focusCaseSummary);
        }
        return;
      }

      let target =
        summary.querySelector('.case-summary__title') ||
        summary.querySelector('h2, h3');

      if (!target) {
        return;
      }

      const existingTabIndex = target.getAttribute('tabindex');
      if (existingTabIndex === null) {
        target.setAttribute('tabindex', '-1');
      }

      target.focus({ preventScroll: true });
      scrollToElementWithOffset(target, resolveStickyOffset());

      if (existingTabIndex === null) {
        setTimeout(() => {
          if (target.isConnected) {
            target.removeAttribute('tabindex');
          }
        }, 1000);
      }
    };

    rafId = requestAnimationFrame(focusCaseSummary);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [current]);

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
          <button
            type="button"
            className="stage-btn planner-nav-btn wizard-back"
            onClick={prev}
          >
            { __( 'Back', 'endoplanner' ) }
          </button>
        ) }
        { current < steps.length - 1 ? (
          <button
            type="button"
            className="stage-btn planner-nav-btn wizard-next"
            onClick={ next }
          >
            { __( 'Next', 'endoplanner' ) }
          </button>
        ) : (
          <button
            type="button"
            id="export-pdf-btn"
            className="stage-btn planner-nav-btn wizard-finish"
            onClick={ exportCaseSummaryToPDF }
          >
            { __( 'Export PDF', 'endoplanner' ) }
          </button>
        ) }
      </div>
    </div>
  );
}
