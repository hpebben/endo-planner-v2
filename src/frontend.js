import React from 'react';
import { createRoot } from 'react-dom/client';
import Wizard from './components/wizard';
// Import default and named exports in case the file exports differently
import * as WizardContextModule from './components/WizardContext';

const PREFS_UI_BUILD_STAMP = '2026-01-27-1900';
const PLANNER_DEBUG = typeof window !== 'undefined' && window.PLANNER_DEBUG === true;
const logBoot = (message, details = {}) => {
  if (PLANNER_DEBUG && typeof console !== 'undefined' && console.log) {
    console.log('[PlannerBoot]', message, {
      file: 'src/frontend.js',
      buildStamp: PREFS_UI_BUILD_STAMP,
      ...details,
    });
  }
};

logBoot('entrypoint loaded');

if (typeof window !== 'undefined') {
  window.EndoPlannerPrefsBuildStamp = PREFS_UI_BUILD_STAMP;
  if (!window.__PREFS_UI_BUILD_STAMP_LOGGED__ && typeof console !== 'undefined') {
    window.__PREFS_UI_BUILD_STAMP_LOGGED__ = true;
    console.log(`PREFS_UI_BUILD_STAMP: ${PREFS_UI_BUILD_STAMP}`);
  }
}

// Support both default and named export styles
const WizardProvider =
        WizardContextModule?.WizardProvider   // named export
     || WizardContextModule?.default          // default export
     || (() => { throw new Error('WizardProvider not found'); });

const renderFallback = (container, err) => {
  if (!container) {
    return;
  }
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  container.innerHTML = `
    <div class="endoplanner-fallback" role="alert" style="padding:16px;border:1px solid #d63638;background:#fff5f5;color:#1d2327;">
      <strong>Planner failed to load.</strong>
      <div>Please refresh the page or contact support if the issue persists.</div>
      ${PLANNER_DEBUG ? `<div style="margin-top:8px;font-size:12px;color:#50575e;">${errorMessage}</div>` : ''}
    </div>
  `;
};

const mount = () => {
  const containers = document.querySelectorAll('.endoplanner-root');

  if (!containers.length) {
    console.error(
      '[EndoPlanner] .endoplanner-root not found – ' +
        'ensure the div exists **after** the block markup is rendered.'
    );
    return;
  }

  logBoot('before mount', { containers: containers.length });

  containers.forEach((container) => {
    if (container.dataset.epInitialized) return;
    try {
      createRoot(container).render(
        <WizardProvider>
          <Wizard />
        </WizardProvider>
      );
      container.dataset.epInitialized = 'true';
      logBoot('after mount', { containerId: container.id || null });
    } catch (err) {
      console.error('Error rendering EndoPlanner wizard:', err);
      renderFallback(container, err);
    }
  });
};

const safeMount = () => {
  try {
    mount();
  } catch (error) {
    console.error('[PlannerBoot] mount failed', error);
    const containers = document.querySelectorAll('.endoplanner-root');
    containers.forEach((container) => renderFallback(container, error));
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeMount);
} else {
  safeMount();
}
