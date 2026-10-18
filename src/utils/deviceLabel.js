export const fullDeviceLabel = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  const dimensions = value.diameter && value.length ? `${value.diameter} × ${value.length} mm` : value.length;
  return [...new Set([
    value.product, value.specific, value.name, value.category,
    value.platform && `${value.platform}-inch`, value.frSize || value.size,
    dimensions, value.shaft && `shaft ${value.shaft}`,
    value.functionalRole || value.role, value.type, value.material,
    value.deliveryMode, value.ctoProfile, value.technique, value.tipShape, value.shape, value.coating,
    value.minimumSheathFr && `minimum sheath ${value.minimumSheathFr}`,
  ].filter(Boolean))].join(' · ');
};
