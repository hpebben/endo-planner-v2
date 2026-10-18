import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import InlineModal from './UI/InlineModal';
import StarredDeviceChoices from './UI/StarredDeviceChoices';
import CatalogProductPicker from './UI/CatalogProductPicker';
import { SHEATH_CATALOG } from '../data/deviceCatalog';

const normalize = (input = {}) => ({ ...input, product: input.product || '', size: input.size ?? input.frSize ?? '', frSize: input.size ?? input.frSize ?? '' });

export default function SheathModal({ isOpen, anchor, onRequestClose, values = {}, onSave, preferredProfiles = [] }) {
  const [form, setForm] = useState(() => normalize(values));
  useEffect(() => setForm(normalize(values)), [values]);
  const commit = (next) => { const normalized = normalize(next); setForm(normalized); onSave(normalized); };
  return <InlineModal title={__('Sheath', 'endoplanner')} isOpen={isOpen} anchor={anchor} onRequestClose={onRequestClose}>
    <StarredDeviceChoices profiles={preferredProfiles} onSelect={commit} />
    <CatalogProductPicker
      catalog={SHEATH_CATALOG}
      form={form}
      onChange={commit}
      preferredProfiles={preferredProfiles.map(normalize)}
      productLegend={__('Product | sheath Fr | working length | guidewire compatibility', 'endoplanner')}
      filters={[
        { field: 'category', label: __('Sheath category', 'endoplanner'), testId: 'filter-sheath-category' },
        { field: 'size', label: __('French size', 'endoplanner'), testId: 'filter-sheath-size' },
        { field: 'length', label: __('Working length', 'endoplanner'), testId: 'filter-length' },
        { field: 'platform', label: __('Guidewire compatibility', 'endoplanner'), testId: 'filter-platform' },
        { field: 'shape', label: __('Shape', 'endoplanner'), testId: 'filter-sheath-shape' },
        { field: 'coating', label: __('Coating', 'endoplanner'), testId: 'filter-sheath-coating' },
      ]}
    />
    <p className="wire-catalog-note">{__('Standard, reinforced and special-access sheaths. Published ranges allow manual entry; confirm the chosen size, length and device compatibility in the current product IFU.', 'endoplanner')}</p>
    <div className="popup-close-row"><button type="button" className="planner-nav-btn wire-done-btn" onClick={onRequestClose}>{__('Done', 'endoplanner')}</button></div>
  </InlineModal>;
}

SheathModal.propTypes = { isOpen: PropTypes.bool.isRequired, anchor: PropTypes.object, onRequestClose: PropTypes.func.isRequired, values: PropTypes.object, onSave: PropTypes.func.isRequired, preferredProfiles: PropTypes.arrayOf(PropTypes.object) };
