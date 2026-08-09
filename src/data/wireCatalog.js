export const WIRE_ROLES = {
  WORKHORSE: 'Workhorse',
  JACKETED: 'Polymer-jacketed / hydrophilic',
  CTO: 'CTO crossing',
  SUPPORT: 'Support / exchange',
};

export const CTO_PROFILES = {
  SLIDING: 'Jacketed / sliding',
  TORQUE: 'Torque-controlled / directional',
  PENETRATION: 'Penetration',
  HIGH_PENETRATION: 'High penetration',
};

const ROLE_ALIASES = {
  Glidewire: WIRE_ROLES.JACKETED,
  'CTO wire': WIRE_ROLES.CTO,
  'Support wire': WIRE_ROLES.SUPPORT,
};

export const normalizeWireRole = (value) => ROLE_ALIASES[value] || value || '';

export const WIRE_ROLE_INFO = {
  [WIRE_ROLES.WORKHORSE]: {
    purpose: 'Controlled navigation, branch selection and safer device delivery after crossing.',
    design: 'Low-to-moderate tip force with balanced torque, tactile feedback and support.',
    caution: 'May lack the lubricity or penetration needed for resistant chronic occlusions.',
  },
  [WIRE_ROLES.JACKETED]: {
    purpose: 'Low-friction tracking through tortuosity, soft plaque or a deliberately created loop/subintimal plane.',
    design: 'Hydrophilic coating and, for many products, a polymer jacket that reduces friction and tactile feedback.',
    caution: 'Can preferentially enter branches or an extraplaque plane. Confirm tip position frequently and exchange after crossing when appropriate.',
  },
  [WIRE_ROLES.CTO]: {
    purpose: 'Directional control, drilling or penetration of resistant CTO caps and body.',
    design: 'Specialty construction with progressively greater torque response and/or tip force.',
    caution: 'Escalate only with support-catheter control and orthogonal imaging; higher penetration increases perforation risk.',
  },
  [WIRE_ROLES.SUPPORT]: {
    purpose: 'Exchange and rail support for delivery of balloons, stents and other devices.',
    design: 'Stiffer shaft and/or supportive tip geometry rather than a primary lesion-crossing design.',
    caution: 'Do not document this as the sole crossing wire for a CTO unless it was genuinely used to cross.',
  },
};

const BOTH_TECHNIQUES = [
  'Intraluminal tracking',
  'Limited sub-intimal dissection and re-entry',
  'Limited subintimal dissection and re-entry',
  // Retain compatibility with cases saved by release 1.6.166.
  'Intimal Tracking',
];

const wire = (
  manufacturer,
  name,
  platform,
  lengths,
  role,
  options = {},
) => ({
  id: `${manufacturer}-${name}-${platform}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  manufacturer,
  name,
  platform,
  lengths,
  role,
  techniques: options.techniques || BOTH_TECHNIQUES,
  ctoProfile: options.ctoProfile || '',
  purpose: options.purpose || WIRE_ROLE_INFO[role].purpose,
  design: options.design || WIRE_ROLE_INFO[role].design,
  caution: options.caution || WIRE_ROLE_INFO[role].caution,
  label: `${manufacturer} — ${name}`,
});

const workhorse = (...args) => wire(...args, WIRE_ROLES.WORKHORSE);
const jacketed = (...args) => wire(...args, WIRE_ROLES.JACKETED);
const support = (...args) => wire(...args, WIRE_ROLES.SUPPORT);
const cto = (manufacturer, name, platform, lengths, ctoProfile) => wire(
  manufacturer,
  name,
  platform,
  lengths,
  WIRE_ROLES.CTO,
  { ctoProfile },
);

// Product availability and exact IFU specifications vary by market. This
// catalogue provides functional filtering; the selected product IFU remains
// authoritative for tip load, coating, usable length and device compatibility.
export const WIRE_CATALOG = [
  jacketed('Terumo', 'Radifocus Glidewire Advantage', '0.014', [180, 300]),
  jacketed('Terumo', 'Radifocus Glidewire Advantage Track', '0.014', [180, 300]),
  workhorse('Medtronic', 'Cougar LS', '0.014', [190, 300]),
  workhorse('Medtronic', 'Cougar XT', '0.014', [190, 300]),
  workhorse('Medtronic', 'Intuition', '0.014', [180, 300]),
  workhorse('Medtronic', 'Nitrex', '0.014', [180, 300]),
  workhorse('Medtronic', 'Zinger Light', '0.014', [180, 300]),
  workhorse('Boston Scientific', 'Thruway', '0.014', [190, 300]),
  workhorse('Boston Scientific', 'Platinum Plus', '0.014', [180, 260, 300]),
  workhorse('Cordis', 'Stabilizer', '0.014', [180, 300]),

  jacketed('Terumo', 'Radifocus Glidewire Advantage', '0.018', [180, 300]),
  jacketed('Terumo', 'Radifocus Glidewire Advantage Track', '0.018', [180, 300]),
  jacketed('Terumo', 'Radifocus Guide Wire M', '0.018', [180, 260, 300]),
  jacketed('Cook Medical', 'Roadrunner UniGlide', '0.018', [180, 260]),
  jacketed('Merit Medical', 'Splash Hydrophilic Guide Wire', '0.018', [180, 260]),
  workhorse('Medtronic', 'Nitrex', '0.018', [180, 300]),
  workhorse('Boston Scientific', 'Thruway', '0.018', [190, 300]),
  workhorse('Boston Scientific', 'Platinum Plus', '0.018', [180, 260, 300]),
  support('Merit Medical', 'InQwire PTFE Coated', '0.018', [180, 260]),

  jacketed('Terumo', 'Radifocus Guide Wire M', '0.035', [180, 260, 300]),
  jacketed('Terumo', 'Radifocus Glidewire Advantage', '0.035', [180, 260]),
  jacketed('Cook Medical', 'Roadrunner PC', '0.035', [180, 260]),
  jacketed('Cook Medical', 'Roadrunner UniGlide', '0.035', [180, 260]),
  jacketed('Merit Medical', 'Splash Hydrophilic Guide Wire', '0.035', [180, 260]),
  jacketed('Medtronic', 'Wholey Guidewire System', '0.035', [175, 260, 300]),

  cto('Cook Medical', 'Approach CTO', '0.014', [190, 300], CTO_PROFILES.PENETRATION),
  cto('Asahi Intecc', 'Gladius MG PV', '0.014', [200, 300], CTO_PROFILES.SLIDING),
  cto('Asahi Intecc', 'Halberd', '0.014', [200, 235, 300], CTO_PROFILES.TORQUE),
  cto('Asahi Intecc', 'Astato XS 20', '0.014', [180, 300], CTO_PROFILES.HIGH_PENETRATION),
  cto('Asahi Intecc', 'Astato XS 40', '0.014', [200, 300], CTO_PROFILES.HIGH_PENETRATION),
  cto('Medtronic', 'ProVia 3', '0.014', [180, 300], CTO_PROFILES.PENETRATION),
  cto('Medtronic', 'ProVia 6', '0.014', [180, 300], CTO_PROFILES.PENETRATION),
  cto('Medtronic', 'ProVia 9', '0.014', [180, 300], CTO_PROFILES.PENETRATION),
  cto('Medtronic', 'ProVia 12', '0.014', [180, 300], CTO_PROFILES.HIGH_PENETRATION),
  cto('Abbott', 'Hi-Torque Proceed', '0.014', [190, 300], CTO_PROFILES.PENETRATION),
  cto('Abbott', 'Hi-Torque Winn 40', '0.014', [190, 300], CTO_PROFILES.PENETRATION),
  cto('Abbott', 'Hi-Torque Winn 80', '0.014', [190, 300], CTO_PROFILES.PENETRATION),
  cto('Abbott', 'Hi-Torque Winn 200', '0.014', [190, 300], CTO_PROFILES.HIGH_PENETRATION),
  cto('Boston Scientific', 'V-14 ControlWire', '0.014', [182, 300], CTO_PROFILES.TORQUE),
  cto('Boston Scientific', 'Victory 14', '0.014', [195, 300], CTO_PROFILES.PENETRATION),

  cto('Asahi Intecc', 'Gaia PV', '0.018', [200, 235, 300], CTO_PROFILES.TORQUE),
  cto('Asahi Intecc', 'Gladius', '0.018', [200, 235, 300], CTO_PROFILES.SLIDING),
  cto('Asahi Intecc', 'Gladius MG PV', '0.018', [200, 300], CTO_PROFILES.SLIDING),
  cto('Asahi Intecc', 'Halberd', '0.018', [200, 235, 300], CTO_PROFILES.TORQUE),
  cto('Asahi Intecc', 'Astato 30', '0.018', [180, 300], CTO_PROFILES.HIGH_PENETRATION),
  cto('Abbott', 'Hi-Torque Connect 250T', '0.018', [145, 195, 300], CTO_PROFILES.TORQUE),
  cto('Boston Scientific', 'V-18 ControlWire', '0.018', [200, 300], CTO_PROFILES.TORQUE),
  cto('Boston Scientific', 'Victory 18', '0.018', [195, 300], CTO_PROFILES.PENETRATION),
  jacketed('Cordis', 'Jindo Steerable Guidewire', '0.035', [180, 300]),

  support('Abbott', 'Hi-Torque Spartacore 14', '0.014', [190, 300]),
  support('Cordis', 'ATW Eco Pacs', '0.014', [195, 300]),
  support('Boston Scientific', 'Platinum Plus', '0.014', [180, 260, 300]),
  support('Abbott', 'Hi-Torque Steelcore 18', '0.018', [190, 300]),
  support('Abbott', 'Hi-Torque Steelcore 18 LT', '0.018', [190, 300]),
  support('Medtronic', 'Nitrex', '0.018', [180, 300]),
  support('Boston Scientific', 'Platinum Plus', '0.018', [180, 260, 300]),
  support('Cook Medical', 'Classic Bentson', '0.018', [180, 260]),
  support('Cook Medical', 'Roadrunner Extra-Support', '0.018', [180, 270, 300]),
  support('Cook Medical', 'Amplatz Extra Stiff', '0.035', [180, 260, 300]),
  support('Cook Medical', 'Amplatz Stiff', '0.035', [180, 260]),
  support('Boston Scientific', 'Amplatz Super Stiff', '0.035', [180, 260]),
  support('Cook Medical', 'Amplatz Ultra Stiff', '0.035', [180, 260]),
  support('Boston Scientific', 'Back-up Meier', '0.035', [185, 300]),
  support('Cook Medical', 'Classic Rosen', '0.035', [180, 260]),
  support('Cook Medical', 'Lunderquist', '0.035', [180, 260, 300]),
  support('Medtronic', 'Nitrex Flexible Shaft', '0.035', [180, 260]),
  support('Medtronic', 'Nitrex Stiff Shaft', '0.035', [180, 260, 300]),
  support('Abbott', 'Hi-Torque Supra Core 35', '0.035', [190, 300]),
  support('Abbott', 'Hi-Torque Versacore', '0.035', [175, 260, 300]),
  support('Cordis', 'Storq', '0.035', [180, 300]),
];

const numericLength = (value) => Number.parseInt(String(value || '').replace(/[^0-9]/g, ''), 10);

const matchesFilters = (item, {
  platform = '',
  length = '',
  role = '',
  category = '',
  technique = '',
  ctoProfile = '',
} = {}) => {
  const selectedLength = numericLength(length);
  const selectedRole = normalizeWireRole(role || category);
  return (
    (!platform || item.platform === platform) &&
    (!selectedRole || item.role === selectedRole) &&
    (!selectedLength || item.lengths.includes(selectedLength)) &&
    (!technique || item.techniques.includes(technique)) &&
    (!ctoProfile || item.ctoProfile === ctoProfile)
  );
};

const preferredProductOrder = (preferredProducts = []) => new Map(
  preferredProducts.filter(Boolean).map((product, index) => [product, index]),
);

const sortByPreference = (preferredOrder) => (a, b) => {
  const aPreferred = preferredOrder.has(a.label) ? preferredOrder.get(a.label) : Infinity;
  const bPreferred = preferredOrder.has(b.label) ? preferredOrder.get(b.label) : Infinity;
  if (aPreferred !== bPreferred) return aPreferred - bPreferred;
  return a.label.localeCompare(b.label);
};

export const getWireLengthOptions = (platform, role = '', ctoProfile = '') => {
  const normalizedRole = normalizeWireRole(role);
  if (!platform) return [];
  return [...new Set(
    WIRE_CATALOG
      .filter((item) => (
        item.platform === platform &&
        (!normalizedRole || item.role === normalizedRole) &&
        (!ctoProfile || item.ctoProfile === ctoProfile)
      ))
      .flatMap((item) => item.lengths),
  )].sort((a, b) => a - b).map((length) => `${length} cm`);
};

export const getWireProductOptions = (
  filters = {},
  preferredProducts = [],
) => {
  const preferredOrder = preferredProductOrder(preferredProducts);
  const matchingProducts = new Map();

  WIRE_CATALOG
    .filter((item) => matchesFilters(item, filters))
    .forEach((item) => {
      if (!matchingProducts.has(item.label)) matchingProducts.set(item.label, []);
      matchingProducts.get(item.label).push(item);
    });

  return [...matchingProducts.entries()]
    .map(([label, variants]) => ({ label, variants }))
    .sort((a, b) => sortByPreference(preferredOrder)(a.variants[0], b.variants[0]))
    .map(({ label, variants }) => ({
      label,
      specs: `${[...new Set(variants.map((item) => item.platform))].join('/')} | L ${[...new Set(variants.flatMap((item) => item.lengths))].sort((a, b) => a - b).join('/')} cm | ${[...new Set(variants.map((item) => item.role))].join('/')}`,
      value: label,
      preferred: preferredOrder.has(label),
    }));
};

export const getWireProductVariants = (label, filters = {}) => WIRE_CATALOG.filter((item) => (
  item.label === label && matchesFilters(item, filters)
));

export const getWirePlatformsForProduct = (label, filters = {}) => [...new Set(
  getWireProductVariants(label, { ...filters, platform: '' }).map((item) => item.platform),
)].sort();

export const getWireLengthsForProduct = (label, filters = {}) => [...new Set(
  getWireProductVariants(label, { ...filters, length: '' }).flatMap((item) => item.lengths),
)].sort((a, b) => a - b).map((length) => `${length} cm`);

export const getWireRolesForProduct = (label, filters = {}) => [...new Set(
  getWireProductVariants(label, { ...filters, role: '', category: '' }).map((item) => item.role),
)];

export const getWireByLabel = (label, platform = '') => WIRE_CATALOG.find((item) => (
  item.label === label && (!platform || item.platform === platform)
)) || null;

const wireFilterValues = {
  platform: (item) => [item.platform],
  length: (item) => item.lengths.map((length) => `${length} cm`),
  role: (item) => [item.role],
  technique: (item) => item.techniques,
  ctoProfile: (item) => [item.ctoProfile].filter(Boolean),
};

export const getWireFilterOptions = (form = {}, field) => {
  const getter = wireFilterValues[field];
  if (!getter) return [];
  const selectedProduct = getWireByLabel(form.product);
  const candidates = WIRE_CATALOG.filter((item) => (
    (!selectedProduct || item.label === form.product) &&
    matchesFilters(item, {
      ...form,
      [field]: '',
      category: field === 'role' ? '' : form.category,
    })
  ));
  const values = [...new Set(candidates.flatMap(getter).filter(Boolean))];
  return values.sort((left, right) => {
    const leftNumber = Number.parseFloat(left);
    const rightNumber = Number.parseFloat(right);
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return leftNumber - rightNumber;
    return left.localeCompare(right);
  });
};

export const reconcileWireProduct = (form = {}, productLabel) => {
  const next = { ...form, product: productLabel };
  const variants = getWireProductVariants(productLabel);
  if (!variants.length) return next;
  ['platform', 'length', 'role', 'technique', 'ctoProfile'].forEach((field) => {
    const available = getWireFilterOptions({ ...next, product: productLabel }, field);
    if (next[field] && !available.includes(next[field])) next[field] = '';
    if (!next[field] && available.length === 1) next[field] = available[0];
  });
  return next;
};
