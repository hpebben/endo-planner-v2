import React, { createContext, useContext, useEffect, useState } from 'react';
import DEFAULTS from './Defaults';

const STORE_KEY = 'ENDOPLANNER_WIZARD_V1';
export const WizardContext = createContext();

export const useWizard = () => useContext(WizardContext);

export function WizardProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') };
    } catch {
      return DEFAULTS;
    }
  });

  // persist whenever state changes
  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }, [state]);

  const resetCase = () => {
    setState(DEFAULTS);
    localStorage.removeItem(STORE_KEY);
  };

  return (
    <WizardContext.Provider value={{ state, setState, resetCase }}>
      {children}
    </WizardContext.Provider>
  );
}
