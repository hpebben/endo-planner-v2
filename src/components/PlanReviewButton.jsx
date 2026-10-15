import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import InlineModal from './UI/InlineModal';
import DeviceGlyph from './UI/DeviceGlyph';
import PlanRecommendations from './PlanRecommendations';
import { getVisualPlanItems } from '../utils/visualPlan';

export default function PlanReviewButton({ option, description, navRows, therapyRows, findings }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const errors = findings.filter((item) => item.level === 'error').length;
  const warnings = findings.filter((item) => item.level === 'warning').length;
  const severity = errors ? 'error' : warnings ? 'warning' : 'recommendation';
  const status = errors ? __('Incompatible', 'endoplanner') : warnings ? __('Warning', 'endoplanner') : __('Recommendations', 'endoplanner');
  const items = getVisualPlanItems(navRows, therapyRows);
  return (
    <>
      <button
        type="button"
        className={`plan-review-button plan-review-button--${severity}`}
        aria-label={`${__('Plan summary & recommendations', 'endoplanner')} · ${status}${findings.length ? ` (${findings.length})` : ''}`}
        aria-haspopup="dialog"
        title={`${__('Plan summary & recommendations', 'endoplanner')} · ${status}`}
        onClick={() => setOpen(true)}
        data-testid="plan-review-button"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M9 2h6v4H9zM8 11h8M8 15h8M8 19h5" /></svg>
        <span>{__('Review plan', 'endoplanner')}</span>
        {findings.length > 0 && <span className="plan-review-count">{findings.length}</span>}
      </button>
      <InlineModal className="plan-review-modal" isOpen={open} onRequestClose={close} title={__('Plan summary & recommendations', 'endoplanner')}>
        <div className="plan-review-content" data-testid="plan-review-content">
          <div className="plan-review-heading">
            <div><strong>{option ? `${option.code} · ${option.label}` : __('Case plan', 'endoplanner')}</strong>{description && <p>{description}</p>}</div>
            <button type="button" className="plan-review-close" onClick={close} aria-label={__('Close plan review', 'endoplanner')}>×</button>
          </div>
          {option && (
            <section className="plan-review-devices">
              <h3>{__('Selected devices for this plan', 'endoplanner')}</h3>
              {items.length ? <ul>{items.map((item, index) => <li key={`${item.type}-${index}`}><DeviceGlyph type={item.type} /><span>{item.label}</span></li>)}</ul> : <p>{__('No devices selected for this lesion yet.', 'endoplanner')}</p>}
            </section>
          )}
          <p className="plan-review-case-note">{__('Checks below cover the whole case, including other lesions, shared support, access and closure.', 'endoplanner')}</p>
          <PlanRecommendations findings={findings} />
        </div>
      </InlineModal>
    </>
  );
}

PlanReviewButton.propTypes = {
  option: PropTypes.object,
  description: PropTypes.string,
  navRows: PropTypes.arrayOf(PropTypes.object).isRequired,
  therapyRows: PropTypes.arrayOf(PropTypes.object).isRequired,
  findings: PropTypes.arrayOf(PropTypes.object).isRequired,
};
