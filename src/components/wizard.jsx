import React, { useState, useEffect } from 'react';
import DEFAULTS from './Defaults';
import exportCaseSummaryToPDF from '../utils/exportCaseSummaryToPDF';
import { __ } from '@wordpress/i18n';
import Step1 from './steps/Step1_Clinical';
import Step2 from './steps/Step2_Patency';
import Step3 from './steps/Step4_Intervention';
import Step4 from './steps/Step3_Summary';
import { ProgressBar } from '@wordpress/components';
import { migratePlanRowScopes } from '../utils/planScopes';
import { validateCaseStep } from '../utils/caseValidation';

const STORAGE_KEY = 'endoplannerState';
const SCHEMA_VERSION = 4;

const steps = [
  { title: __('Clinical indication', 'endoplanner'), component: Step1 },
  { title: __('Disease anatomy', 'endoplanner'), component: Step2 },
  { title: __('Intervention plan', 'endoplanner'), component: Step3 },
  { title: __('Case summary', 'endoplanner'), component: Step4 },
];

const validateStep = (step, data) => validateCaseStep(step, data, __);

export default function Wizard() {
  const [current, setCurrent] = useState(0);
  const [data, setData] = useState(DEFAULTS);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (![2, 3, SCHEMA_VERSION].includes(parsed.schemaVersion)) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      if (parsed.data) {
        const migratedData = { ...DEFAULTS, ...parsed.data };
        if (parsed.schemaVersion === 2) {
          const lesionIds = Object.keys(migratedData.patencySegments || {});
          if (lesionIds.length === 1) {
            migratedData.navRows = (migratedData.navRows || []).map((row) => ({
              ...row,
              lesionId: row.lesionId || lesionIds[0],
            }));
            migratedData.therapyRows = (migratedData.therapyRows || []).map((row) => ({
              ...row,
              lesionId: row.lesionId || lesionIds[0],
            }));
          }
        }
        const lesionIds = Object.keys(migratedData.patencySegments || {});
        const defaultLesionId = lesionIds.length === 1 ? lesionIds[0] : '';
        migratedData.navRows = migratePlanRowScopes(migratedData.navRows || [], {
          defaultLesionId,
          targetPath: migratedData.targetArterialPath || [],
          rowType: 'navigation',
        });
        migratedData.therapyRows = migratePlanRowScopes(migratedData.therapyRows || [], {
          defaultLesionId,
          targetPath: migratedData.targetArterialPath || [],
          rowType: 'therapy',
        });
        setData(migratedData);
      }
      if (typeof parsed.step === 'number') {
        setCurrent(Math.min(Math.max(parsed.step, 0), steps.length - 1));
      }
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        step: current,
        data,
      }),
    );
  }, [current, data]);

  useEffect(() => {
    setValidationErrors([]);
  }, [current, data]);

  useEffect(() => {
    if (typeof document === 'undefined' || current !== steps.length - 1) return undefined;

    let rafId;
    const focusCaseSummary = () => {
      const title = document.querySelector('.case-summary__title');
      if (!title) return;
      title.setAttribute('tabindex', '-1');
      title.focus({ preventScroll: true });
      title.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    rafId = requestAnimationFrame(focusCaseSummary);
    return () => cancelAnimationFrame(rafId);
  }, [current]);

  const StepComponent = steps[current].component;
  const setStep = (index) => {
    if (typeof index === 'number') {
      setCurrent(Math.min(Math.max(index, 0), steps.length - 1));
    }
  };

  const next = () => {
    const errors = validateStep(current, data);
    if (errors.length) {
      setValidationErrors(errors);
      return;
    }
    setCurrent((value) => Math.min(value + 1, steps.length - 1));
  };

  const previous = () => setCurrent((value) => Math.max(value - 1, 0));

  return (
    <div className="endo-wizard">
      <div className="wizard-step-label" aria-live="polite">
        {`${current + 1} / ${steps.length} — ${steps[current].title}`}
      </div>
      <ProgressBar value={(current + 1) / steps.length} />
      <div className="wizard-content">
        {current !== steps.length - 1 && <h2>{steps[current].title}</h2>}
        <StepComponent data={data} setData={setData} setStep={setStep} />
      </div>

      {validationErrors.length > 0 && (
        <div className="wizard-validation" role="alert">
          <strong>{__('Complete this step before continuing:', 'endoplanner')}</strong>
          <ul>
            {validationErrors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        </div>
      )}

      <div className="wizard-nav">
        {current > 0 && (
          <button
            type="button"
            className="stage-btn planner-nav-btn wizard-back"
            onClick={previous}
          >
            {__('Back', 'endoplanner')}
          </button>
        )}
        {current < steps.length - 1 ? (
          <button
            type="button"
            className="stage-btn planner-nav-btn wizard-next"
            onClick={next}
          >
            {__('Next', 'endoplanner')}
          </button>
        ) : (
          <button
            type="button"
            id="export-pdf-btn"
            className="stage-btn planner-nav-btn wizard-finish"
            onClick={() => exportCaseSummaryToPDF(data)}
          >
            {__('Export PDF', 'endoplanner')}
          </button>
        )}
      </div>
    </div>
  );
}

export { validateStep, SCHEMA_VERSION };
