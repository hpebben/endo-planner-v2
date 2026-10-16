import { fullDeviceLabel } from './deviceLabel';
import { getLesionOptions } from './lesions';
import { getPlanScope, formatScopeLabel } from './planScopes';

const definitions = [
  ['access', 'Access & introducers', 'Needles and sheaths'],
  ['wires', 'Guidewires', 'Crossing, support and exchange'],
  ['catheters', 'Catheters & support', 'Diagnostic and crossing catheters'],
  ['balloons', 'Balloons', 'Crossing, vessel preparation and treatment'],
  ['stents', 'Stents & stent grafts', 'Selected implants'],
  ['adjuncts', 'Adjunctive devices', 'Special crossing and treatment devices'],
  ['closure', 'Closure & haemostasis', 'Closure devices and recorded methods'],
];
const hasSelection = (value) => {
  if (typeof value === 'string') return Boolean(value.trim());
  return value && typeof value === 'object' && Object.entries(value).some(([key, field]) => !['id', 'label'].includes(key) && field !== '' && field !== null && field !== undefined);
};
const useful = (value) => value && value !== 'Product not specified' ? String(value).trim() : '';
const normal = (value) => String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();

export const materialDetails = (kind, input) => {
  const value = typeof input === 'string' ? { product: input } : input;
  const name = useful(value.product || value.specific || value.name);
  const generic = { needle: 'Access needle', sheath: 'Introducer sheath', wire: 'Guidewire', catheter: 'Catheter', balloon: 'Balloon', stent: 'Stent / stent graft', special: 'Adjunctive device', closure: 'Closure device', method: 'Haemostasis method' }[kind];
  const sizes = [
    value.frSize || value.size,
    value.diameter && value.length ? `${value.diameter} x ${value.length} mm` : value.diameter ? `diameter ${value.diameter} mm` : value.length,
    value.platform && `${value.platform}-inch`,
  ].filter(Boolean);
  const details = [
    value.shaft && `Shaft ${value.shaft}`,
    value.minimumSheathFr && `Minimum sheath ${value.minimumSheathFr}`,
    value.deliveryMode,
    value.material,
    value.type,
    value.role,
    value.category,
    value.functionalRole,
    value.ctoProfile,
  ].filter(Boolean);
  const missing = [];
  if (kind === 'needle' && !value.size) missing.push('Gauge not recorded');
  if (kind === 'sheath' && !value.frSize && !value.size) missing.push('French size not recorded');
  if (['needle', 'sheath', 'wire', 'catheter'].includes(kind) && !value.length) missing.push('Length not recorded');
  if (['wire', 'balloon', 'stent'].includes(kind) && !value.platform) missing.push('Wire platform not recorded');
  if (['balloon', 'stent'].includes(kind) && (!value.diameter || !value.length)) missing.push('Diameter / treatment length not recorded');
  if (['balloon', 'stent'].includes(kind) && !value.shaft) missing.push('Shaft length not recorded');
  if (['wire', 'catheter', 'balloon', 'stent', 'special', 'closure'].includes(kind) && !name) missing.push('Product not recorded');
  return { name: name || generic, sizes: [...new Set(sizes)], details: [...new Set(details)], missing, kind, profile: value };
};

// One row per distinct selected configuration. Occurrences are planned uses,
// never an inferred count of disposable devices. Quantities are confirmed by
// the operator/assistant; no preferred, unused or stock devices are inserted.
export const buildMaterialsList = (data = {}) => {
  const groups = definitions.map(([id, title, subtitle]) => ({ id, title, subtitle, items: [] }));
  const seen = new Map();
  const add = (groupId, kind, value, usage) => {
    if (!hasSelection(value)) return;
    const item = materialDetails(kind, value);
    const canonical = { ...item.profile, product: useful(item.profile.product || item.profile.specific || item.profile.name), size: item.profile.frSize || item.profile.size || '' };
    ['id', 'label', 'specific', 'name', 'frSize', 'role', 'functionalRole', 'technique', 'category'].forEach((key) => delete canonical[key]);
    const key = `${kind}:${Object.keys(canonical).sort().filter((field) => canonical[field] !== '' && canonical[field] !== null && canonical[field] !== undefined).map((field) => `${field}=${normal(canonical[field])}`).join('|')}`;
    if (seen.has(key)) {
      const existing = seen.get(key);
      existing.occurrences += 1;
      if (!existing.uses.includes(usage)) existing.uses.push(usage);
      existing.details = [...new Set([...existing.details, ...item.details])];
      return;
    }
    const entry = { ...item, uses: [usage], occurrences: 1, fullLabel: fullDeviceLabel(value) };
    seen.set(key, entry);
    groups.find((group) => group.id === groupId).items.push(entry);
  };
  (data.accessRows || []).forEach((row, index) => {
    const usage = `Access ${index + 1}: ${[row.approach, row.side, row.vessel].filter(Boolean).join(' ') || 'site not recorded'}`;
    (row.needles || []).forEach((value) => add('access', 'needle', value, usage));
    (row.sheaths || []).forEach((value) => add('access', 'sheath', value, usage));
    (row.catheters || []).forEach((value) => add('catheters', 'catheter', value, usage));
  });
  const lesionIds = new Set(Object.keys(data.patencySegments || {}));
  const lesions = getLesionOptions(data.patencySegments || {}, data.targetArterialPath || []);
  const linked = (row) => {
    const scope = getPlanScope(row);
    return scope && (scope.type === 'targetPath' ? (data.targetArterialPath || []).length > 0 : scope.ids.every((id) => lesionIds.has(id)));
  };
  const scopeText = (row) => {
    const scope = getPlanScope(row);
    return scope.type === 'targetPath' ? 'PATH: shared route' : formatScopeLabel(row, lesions);
  };
  (data.navRows || []).filter(linked).forEach((row) => {
    const usage = `Crossing / support - ${scopeText(row)}`;
    add('wires', 'wire', row.wire, usage);
    add('catheters', 'catheter', row.catheter, usage);
    add('balloons', 'balloon', row.balloon, usage);
    add('adjuncts', 'special', row.device, usage);
  });
  (data.therapyRows || []).filter(linked).forEach((row) => {
    const usage = `Treatment - ${scopeText(row)}`;
    add('balloons', 'balloon', row.balloon, usage);
    add('stents', 'stent', row.stent, usage);
    add('adjuncts', 'special', row.device, usage);
  });
  (data.closureRows || []).forEach((row, index) => {
    if (row.method === 'Closure device') add('closure', 'closure', row.device, `Closure ${index + 1}`);
    else if (row.method) add('closure', 'method', row.method, `Closure ${index + 1}`);
  });
  return groups.filter((group) => group.items.length);
};
