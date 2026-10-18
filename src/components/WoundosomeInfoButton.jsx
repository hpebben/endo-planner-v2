import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import InlineModal from './UI/InlineModal';
import { FOOT_ANATOMY_REFERENCE, WOUNDOSOME_REFERENCE } from '../data/woundosome';

export default function WoundosomeInfoButton({ anatomy = false }) {
  const [open, setOpen] = useState(false);
  const title = anatomy ? __('Woundosome anatomy information', 'endoplanner') : __('Woundosome guidance and references', 'endoplanner');
  return <>
    <button type="button" className="woundosome-info-button" aria-label={title} title={title} aria-haspopup="dialog" onClick={() => setOpen(true)}><span aria-hidden="true">i</span></button>
    <InlineModal title={title} className="woundosome-info-dialog" isOpen={open} onRequestClose={() => setOpen(false)}>
      <p>{anatomy
        ? __('Original angiographic-style reference model based on Manzi et al. (RadioGraphics, 2011). All black arteries are patent; colors mark wound locations. Both views show the same classical arterial configuration, including the pedal–plantar loop. Individual branching and wound supply vary.', 'endoplanner')
        : __('Confirm the true feeding artery with AP and lateral oblique foot angiography. A patent pedal arch or robust collaterals may make indirect revascularization effective; multi-zone wounds may require more than one inflow route.', 'endoplanner')}</p>
      {!anatomy && <p>{__('The images show reference anatomy. Colors mark selected wound locations; blue follows the planned pedal route. Confirm continuity and wound filling on the patient’s angiography.', 'endoplanner')}</p>}
      <div className="woundosome-references">
        {(anatomy ? [FOOT_ANATOMY_REFERENCE] : [FOOT_ANATOMY_REFERENCE, WOUNDOSOME_REFERENCE]).map((reference) => <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer">{reference.label}</a>)}
      </div>
      <button type="button" className="planner-nav-btn woundosome-info-close" onClick={() => setOpen(false)}>{__('Close', 'endoplanner')}</button>
    </InlineModal>
  </>;
}

WoundosomeInfoButton.propTypes = { anatomy: PropTypes.bool };
