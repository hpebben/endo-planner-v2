import React from 'react';
import { useWizard } from './WizardContext';

export default function ResetCaseButton() {
  const { resetCase } = useWizard();

  return (
    <button
      className="reset-case"
      onClick={() => {
        resetCase();
        localStorage.removeItem('endoplannerState');
        window.location.reload();
      }}
    >
      RESET CASE
    </button>
  );
}
