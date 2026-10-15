import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

const findingOrder = { error: 0, warning: 1, recommendation: 2, info: 3 };

export default function RecommendationsPanel({ findings }) {
  const sorted = [...findings].sort((a, b) => findingOrder[a.level] - findingOrder[b.level]);
  return (
    <div className="summary-card recommendations-card" data-testid="recommendations-considerations">
      <div className="card-title">{__('Recommendations & Considerations', 'endoplanner')}</div>
      <p className="recommendations-intro">
        {__('Compatibility checks use the recorded platform, sheath profile and working lengths. Technique recommendations respond to the entered anatomy and remain contingent on source imaging and product IFUs.', 'endoplanner')}
      </p>
      {sorted.length ? (
        <div className="recommendations-list">
          {sorted.map((item) => (
            <article key={item.id} className={`recommendation-item recommendation-item--${item.level}`}>
              <div className="recommendation-badge">{item.level === 'error' ? __('Incompatible', 'endoplanner') : item.level}</div>
              <h4>{item.title}</h4>
              <p>{item.summary}</p>
              {(item.details.length > 0 || item.references.length > 0) && (
                <details>
                  <summary>{__('Technique notes and sources', 'endoplanner')}</summary>
                  {item.details.length > 0 && (
                    <ol>{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ol>
                  )}
                  {item.references.length > 0 && (
                    <ul className="recommendation-references">
                      {item.references.map((reference) => (
                        <li key={reference.url}>
                          <a href={reference.url} target="_blank" rel="noreferrer">{reference.label}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </details>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="recommendations-clear">{__('No incompatibilities or anatomy-triggered considerations were identified from the recorded data.', 'endoplanner')}</p>
      )}
    </div>
  );
}

RecommendationsPanel.propTypes = {
  findings: PropTypes.arrayOf(PropTypes.object).isRequired,
};
