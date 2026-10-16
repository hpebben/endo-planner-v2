import { getPlanScope, scopeKey } from './planScopes';
import { fullDeviceLabel } from './deviceLabel';

const hasValue = (value) => {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value)) return value.some(hasValue);
  if (typeof value === 'object') return Object.values(value).some(hasValue);
  return true;
};

const firstValue = (value, keys) => keys.map((key) => value?.[key]).find(hasValue) || '';

export const compactDeviceLabel = (type, value) => {
  if (!hasValue(value)) return '';
  if (typeof value === 'string') return value;

  if (type === 'wire') {
    return firstValue(value, ['product', 'role', 'type']) || [value.platform, value.length].filter(Boolean).join(' · ');
  }
  if (type === 'catheter') {
    return firstValue(value, ['specific', 'product', 'name']) || [value.size, value.length].filter(Boolean).join(' · ');
  }
  if (type === 'balloon' || type === 'stent') {
    const dimensions = [value.diameter, value.length].filter(Boolean).join(' × ');
    const product = value.product && value.product !== 'Product not specified' ? value.product : '';
    if (product && dimensions) return `${product} · ${dimensions} mm`;
    if (product) return product;
    if (dimensions) return `${dimensions} mm`;
    return firstValue(value, ['type', 'material', 'platform']);
  }

  return firstValue(value, ['product', 'name', 'label', 'type']);
};

export const getVisualPlanItems = (navigationRows = [], therapyRows = []) => {
  const items = [];
  (navigationRows || []).forEach((row) => {
    [
      ['wire', row.wire],
      ['catheter', row.catheter],
      ['balloon', row.balloon],
      ['special', row.device],
    ].forEach(([type, value]) => {
      const label = compactDeviceLabel(type, value);
      if (label) items.push({ type, label, details: fullDeviceLabel(value) });
    });
  });
  (therapyRows || []).forEach((row) => {
    [
      ['balloon', row.balloon],
      ['stent', row.stent],
      ['special', row.device],
    ].forEach(([type, value]) => {
      const label = compactDeviceLabel(type, value);
      if (label) items.push({ type, label, details: fullDeviceLabel(value) });
    });
  });
  return items;
};

export const rowsForPlanScope = (rows = [], scope) => {
  const targetKey = scopeKey(scope);
  return (rows || []).filter((row) => scopeKey(getPlanScope(row) || {}) === targetKey);
};
