import React from 'react';
import { useWizard } from './WizardContext';
import { useNavigate } from 'react-router-dom';
import './ResetCaseButton.css';

export default function ResetCaseButton() {
  const { resetCase } = useWizard();
  const nav = useNavigate?.();

  return (
    <button
      className="reset-case"
      onClick={() => {
        resetCase();
        nav && nav('/wizard/step-1');
      }}
    >
      RESET CASE
    </button>
  );
}
