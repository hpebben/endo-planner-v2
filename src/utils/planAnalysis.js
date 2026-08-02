import computePrognosis from './prognosis';
import { normalizeWireRole, WIRE_ROLES } from '../data/wireCatalog';
import {
  getLesionOptions,
  sideFromVesselId,
  territoryFromVesselId,
  vesselName,
} from './lesions';
import {
  formatScopeLabel,
  getPlanScope,
  getScopeLesionIds,
  hasPlanItemContent,
  isTargetPathScope,
  rowAppliesToLesion,
  scopeReferencesMissingLesions,
} from './planScopes';

export const TECHNIQUE_REFERENCES = {
  btkPosition: {
    label: 'Li, Varcoe, Manzi, Kum, Iida, Schmidt & Shishehbor — BTK position statement',
    url: 'https://www.jacc.org/doi/10.1016/j.jcin.2023.11.040',
  },
  crossingFailure: {
    label: 'Bernardini et al. — risk factors for antegrade CTO crossing failure',
    url: 'https://pubmed.ncbi.nlm.nih.gov/35403499/',
  },
  retrogradePopliteal: {
    label: 'Montero-Baker, Schmidt et al. — retrograde popliteal/tibioperoneal access',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18840044/',
  },
  retrogradeRegistry: {
    label: 'Schmidt et al. — 554 retrograde tibioperoneal access procedures',
    url: 'https://pubmed.ncbi.nlm.nih.gov/31488299/',
  },
  ferraresi: {
    label: 'Ferraresi, Palena, Mauri & Manzi — correct endovascular approach',
    url: 'https://pubmed.ncbi.nlm.nih.gov/24126507/',
  },
  calfPedal: {
    label: 'Manzi & Palena — calf and pedal intervention techniques',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25435656/',
  },
  distalPuncture: {
    label: 'August Ysa, Lobato, Patrone et al. — simple and complex BTA punctures',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38441118/',
  },
  shishehbor: {
    label: 'Shishehbor — retrograde tibiopedal technique',
    url: 'https://pubmed.ncbi.nlm.nih.gov/27558462/',
  },
};

const numeric = (value) => {
  const parsed = Number.parseFloat(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const hasValue = (value) => {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasValue);
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([key]) => !['id', 'lesionId', 'scope'].includes(key))
      .some(([, nested]) => hasValue(nested));
  }
  return true;
};

const isLong = (length) => ['15-20', '>20'].includes(length);
const isAtLeastModeratelyLong = (length) => ['10-15', '15-20', '>20'].includes(length);
const isOcclusion = (values = {}) => String(values.type || '').toLowerCase() === 'occlusion';
const isHeavyCalcium = (values = {}) => String(values.calcium || '').toLowerCase() === 'heavy';

const finding = (id, level, category, title, summary, extras = {}) => ({
  id,
  level,
  category,
  title,
  summary,
  details: [],
  references: [],
  ...extras,
});

const devicesInTherapyRow = (row) => [
  ['balloon', row.balloon],
  ['stent', row.stent],
].filter(([, device]) => hasValue(device));

const wireForRow = (row) => (hasValue(row?.wire) ? row.wire : null);

const wireLengthRequired = (shaftLength, deliveryMode) => {
  if (!shaftLength || !deliveryMode) return null;
  return deliveryMode === 'Over-the-wire'
    ? (shaftLength * 2) + 20
    : shaftLength + 30;
};

const availableSheathSizes = (data, lesionId = '') => approachForLesion(data, lesionId)
  .flatMap((row) => row.sheaths || [])
  .map((sheath) => numeric(sheath.frSize))
  .filter(Number.isFinite);

const approachForLesion = (data, lesionId) => {
  const lesionSide = sideFromVesselId(lesionId);
  const rows = data.accessRows || [];
  const sameSide = rows.filter((row) => row.side === lesionSide);
  return sameSide.length ? sameSide : rows;
};

export const analyzePlan = (data = {}) => {
  const findings = [];
  const targetPath = data.targetArterialPath || [];
  const lesions = getLesionOptions(data.patencySegments || {}, targetPath);
  const lesionIds = new Set(lesions.map((lesion) => lesion.value));
  const navRows = data.navRows || [];
  const therapyRows = data.therapyRows || [];
  navRows.forEach((row, index) => {
    if (!hasPlanItemContent(row) || getPlanScope(row)) return;
    findings.push(finding(
      `nav-${row.id || index}-unlinked`,
      'error',
      'compatibility',
      'Navigation strategy has no procedural scope',
      'Move this wire/catheter row to PATH, a lesion, or a combined treatment zone.',
    ));
  });

  therapyRows.forEach((row, index) => {
    if (!hasPlanItemContent(row) || getPlanScope(row)) return;
    findings.push(finding(
      `therapy-${row.id || index}-unlinked`,
      'error',
      'compatibility',
      'Therapy has no lesion or treatment-zone scope',
      'Move this balloon, stent or adjunctive device to a lesion or combined treatment zone.',
    ));
  });

  [...navRows, ...therapyRows].forEach((row, index) => {
    if (!hasPlanItemContent(row)) return;
    const missingIds = scopeReferencesMissingLesions(row, [...lesionIds]);
    if (!missingIds.length) return;
    findings.push(finding(
      `missing-lesion-${row.id || index}`,
      'error',
      'compatibility',
      'A linked lesion no longer exists',
      `${missingIds.map(vesselName).join(', ')} was removed from the anatomy. Move or remove the corresponding plan row.`,
    ));
  });

  [...navRows, ...therapyRows].forEach((row, index) => {
    const scopedLesionIds = getScopeLesionIds(row);
    const sides = [...new Set(scopedLesionIds.map(sideFromVesselId).filter(Boolean))];
    if (sides.length <= 1) return;
    findings.push(finding(
      `mixed-side-scope-${row.id || index}`,
      'error',
      'compatibility',
      'A treatment scope crosses left and right limbs',
      'Create separate lesion or treatment-zone rows for each limb.',
    ));
  });

  navRows.forEach((row, index) => {
    if (!hasPlanItemContent(row) || !isTargetPathScope(row)) return;
    if (!targetPath.length) {
      findings.push(finding(
        `path-scope-${row.id || index}-missing`,
        'error',
        'compatibility',
        'PATH-scoped device has no target arterial path',
        'Select a target arterial path or move this navigation row to a lesion.',
      ));
    }
    const role = normalizeWireRole(row.wire?.role || row.wire?.type);
    if (role === WIRE_ROLES.CTO) {
      findings.push(finding(
        `path-cto-${row.id || index}`,
        'error',
        'compatibility',
        'CTO crossing wire needs a lesion-specific scope',
        'Move the dedicated CTO wire from PATH to the occlusion or combined crossing zone. PATH is intended for support/exchange wires and route-level catheters.',
      ));
    }
  });

  therapyRows.forEach((row, index) => {
    if (!hasPlanItemContent(row) || !isTargetPathScope(row)) return;
    findings.push(finding(
      `path-therapy-${row.id || index}`,
      'error',
      'compatibility',
      'Therapy cannot use a whole-path scope',
      'Move the balloon, stent or adjunctive device to a lesion or a combined treatment zone.',
    ));
  });

  therapyRows.forEach((row, rowIndex) => {
    const scopedLesionIds = getScopeLesionIds(row);
    if (!scopedLesionIds.length) return;
    const scopeLabel = formatScopeLabel(row, lesions);
    const primaryLesionId = scopedLesionIds[0];
    const linkedWires = navRows
      .filter((navRow) => scopedLesionIds.some((lesionId) => rowAppliesToLesion(navRow, lesionId, targetPath)))
      .map(wireForRow)
      .filter(Boolean);

    devicesInTherapyRow(row).forEach(([deviceType, device]) => {
      const deviceLabel = deviceType === 'balloon' ? 'Balloon' : 'Stent';
      const matchingWires = linkedWires.filter((wire) => wire.platform === device.platform);
      const sheathSizes = availableSheathSizes(data, primaryLesionId);
      const largestSheath = sheathSizes.length ? Math.max(...sheathSizes) : null;
      if (device.platform && !matchingWires.length) {
        findings.push(finding(
          `${row.id || rowIndex}-${deviceType}-platform`,
          'error',
          'compatibility',
          `${deviceLabel} platform has no matching scoped wire`,
          `${scopeLabel} uses a ${device.platform}-inch ${deviceType}, but no ${device.platform}-inch wire is linked to that lesion/zone or its target path.`,
        ));
      }

      const minimumSheath = numeric(device.minimumSheathFr);
      if (minimumSheath && largestSheath && largestSheath < minimumSheath) {
        findings.push(finding(
          `${row.id || rowIndex}-${deviceType}-sheath`,
          'error',
          'compatibility',
          `${deviceLabel} requires a larger sheath`,
          `Recorded minimum introducer profile is ${minimumSheath} Fr; the largest planned sheath is ${largestSheath} Fr.`,
        ));
      } else if (minimumSheath && !largestSheath) {
        findings.push(finding(
          `${row.id || rowIndex}-${deviceType}-no-sheath`,
          'error',
          'compatibility',
          `${deviceLabel} sheath compatibility cannot be completed`,
          `The device requires at least ${minimumSheath} Fr, but no sheath size is recorded.`,
        ));
      } else if (!minimumSheath) {
        findings.push(finding(
          `${row.id || rowIndex}-${deviceType}-profile-unverified`,
          'warning',
          'compatibility',
          `${deviceLabel} introducer profile is unverified`,
          'Enter the product IFU minimum sheath size to complete sheath compatibility validation.',
        ));
      }

      const shaftLength = numeric(device.shaft);
      const requiredWireLength = wireLengthRequired(shaftLength, device.deliveryMode);
      if (requiredWireLength && matchingWires.length) {
        const longestWire = Math.max(...matchingWires.map((wire) => numeric(wire.length) || 0));
        if (longestWire < requiredWireLength) {
          findings.push(finding(
            `${row.id || rowIndex}-${deviceType}-working-length`,
            'error',
            'compatibility',
            `${deviceLabel} and wire working lengths are incompatible`,
            `${device.deliveryMode} delivery on a ${shaftLength} cm shaft needs approximately ${requiredWireLength} cm of wire for controlled exchange; the longest matching wire is ${longestWire} cm. Confirm the selected product IFU.`,
          ));
        }
      } else if (shaftLength && !device.deliveryMode) {
        findings.push(finding(
          `${row.id || rowIndex}-${deviceType}-delivery-mode`,
          'warning',
          'compatibility',
          `${deviceLabel} delivery mode is not recorded`,
          'Choose rapid-exchange or over-the-wire to validate wire versus shaft working length.',
        ));
      }

      const territories = scopedLesionIds.map(territoryFromVesselId);
      const territory = territories.includes('pedal')
        ? 'pedal'
        : territories.includes('infrapopliteal') ? 'infrapopliteal' : territories[0];
      const accessRows = approachForLesion(data, primaryLesionId);
      const contralateral = accessRows.some((access) => (
        access.side && sideFromVesselId(primaryLesionId) && access.side !== sideFromVesselId(primaryLesionId)
      ));
      if (shaftLength && shaftLength <= 80 && (contralateral || ['infrapopliteal', 'pedal'].includes(territory))) {
        findings.push(finding(
          `${row.id || rowIndex}-${deviceType}-reach`,
          'warning',
          'compatibility',
          `${deviceLabel} shaft may not reach the target`,
          `An ${shaftLength} cm shaft may be insufficient for ${contralateral ? 'contralateral crossover' : territory} treatment. Confirm patient-specific access-to-lesion distance and usable sheath/catheter length.`,
        ));
      }
    });
  });

  lesions.forEach((lesion) => {
    const values = lesion.findings || {};
    const linkedNav = navRows.filter((row) => rowAppliesToLesion(row, lesion.value, targetPath));
    const linkedTherapy = therapyRows.filter((row) => rowAppliesToLesion(row, lesion.value, targetPath));
    const roles = linkedNav
      .map((row) => normalizeWireRole(row.wire?.role || row.wire?.type))
      .filter(Boolean);
    const accessRows = approachForLesion(data, lesion.value);
    const onlyAntegrade = accessRows.length > 0 && accessRows.every((row) => row.approach === 'Antegrade');
    const complexFemoropopliteal = lesion.territory === 'femoropopliteal'
      && isLong(values.length)
      && isHeavyCalcium(values);
    const complexBtK = ['infrapopliteal', 'pedal'].includes(lesion.territory)
      && isOcclusion(values)
      && isAtLeastModeratelyLong(values.length)
      && isHeavyCalcium(values);

    if (complexFemoropopliteal && onlyAntegrade) {
      findings.push(finding(
        `retrograde-fp-${lesion.value}`,
        'recommendation',
        'technique',
        'Pre-plan a retrograde bailout for this complex femoropopliteal lesion',
        `${lesion.name} is a long, heavily calcified ${isOcclusion(values) ? 'occlusion' : 'lesion'}—features that can make crossing and device delivery difficult—while the plan contains only antegrade access.`,
        {
          details: [
            'Confirm a patent distal landing/access segment with duplex and angiography before committing to puncture.',
            'Select the safest usable distal access according to the target: distal SFA/popliteal for femoropopliteal disease, or a superficial anterior/posterior tibial or pedal artery when appropriate. Use ultrasound guidance and the lowest-profile micropuncture/sheathless setup that provides adequate support.',
            'Cross the distal cap with a support catheter and controlled wire escalation. Establish antegrade continuity with rendezvous, wire externalisation, or a limited antegrade/retrograde dissection-re-entry technique; perform definitive therapy from the platform that gives the best control.',
            'Before removing retrograde access, document inline flow and access-vessel integrity; use low-profile haemostasis appropriate to the punctured artery.',
          ],
          references: [
            TECHNIQUE_REFERENCES.crossingFailure,
            TECHNIQUE_REFERENCES.retrogradePopliteal,
            TECHNIQUE_REFERENCES.retrogradeRegistry,
          ],
        },
      ));
    }

    if (complexBtK && onlyAntegrade) {
      findings.push(finding(
        `retrograde-btk-${lesion.value}`,
        'recommendation',
        'technique',
        'Define a secondary tibiopedal or distal access strategy',
        `${lesion.name} is a long/calcified BTK or pedal CTO and only an antegrade approach is recorded.`,
        {
          details: [
            'Start from the intended target arterial path and preserve the best remaining runoff/access artery.',
            'If antegrade wire escalation fails, consider ultrasound-guided retrograde anterior tibial/dorsalis pedis or posterior tibial access; peroneal and more distal BTA punctures require greater expertise and should be reserved for selected anatomy.',
            'Use a 21 G micropuncture/low-profile or sheathless technique where feasible, vasodilator and anticoagulation protocols appropriate to the case, and a support catheter for controlled retrograde crossing.',
            'Plan how the channels will be connected before puncture: rendezvous, SAFARI/externalisation, pedal-plantar loop, or a limited re-entry strategy according to anatomy.',
          ],
          references: [
            TECHNIQUE_REFERENCES.btkPosition,
            TECHNIQUE_REFERENCES.ferraresi,
            TECHNIQUE_REFERENCES.calfPedal,
            TECHNIQUE_REFERENCES.distalPuncture,
            TECHNIQUE_REFERENCES.shishehbor,
          ],
        },
      ));
    }

    if (isOcclusion(values) && linkedNav.length && !roles.includes(WIRE_ROLES.CTO)) {
      findings.push(finding(
        `wire-escalation-${lesion.value}`,
        'recommendation',
        'technique',
        'Add an explicit CTO wire-escalation plan',
        `A wire is linked to the ${lesion.name} occlusion, but no dedicated CTO crossing wire is recorded.`,
        {
          details: [
            'Distinguish the tasks: a workhorse wire for controlled navigation, a polymer-jacketed/hydrophilic wire for low-friction tracking or a deliberate loop, and a dedicated CTO wire for directional control or cap penetration.',
            'Escalate tip force only with adequate catheter support and orthogonal imaging. After crossing, exchange high-penetration or polymer-jacketed wires for a safer workhorse/support wire before device delivery when feasible.',
          ],
          references: [TECHNIQUE_REFERENCES.btkPosition],
        },
      ));
    }

    if (roles.includes(WIRE_ROLES.SUPPORT) && roles.every((role) => role === WIRE_ROLES.SUPPORT) && isOcclusion(values)) {
      findings.push(finding(
        `support-only-${lesion.value}`,
        'warning',
        'technique',
        'A support/exchange wire is the only recorded CTO wire',
        'Support wires are principally for rail strength and device delivery. Record the actual crossing wire or crossing sequence separately.',
      ));
    }

    if (isHeavyCalcium(values) && linkedTherapy.length) {
      const specialText = linkedTherapy.map((row) => row.device || '').join(' ').toLowerCase();
      const hasCalciumStrategy = /shockwave|scoring|atherectomy/.test(specialText);
      if (!hasCalciumStrategy) {
        findings.push(finding(
          `calcium-prep-${lesion.value}`,
          'recommendation',
          'technique',
          'Document calcium modification and bailout strategy',
          `${lesion.name} is heavily calcified, but no dedicated calcium-modification strategy is recorded. Consider whether prolonged appropriately sized angioplasty, scoring/cutting technology, intravascular lithotripsy, or atherectomy is appropriate, and define the dissection/recoil bailout plan.`,
          { references: [TECHNIQUE_REFERENCES.btkPosition] },
        ));
      }
    }
  });

  const wifi = computePrognosis(data);
  if (wifi.isComplete && wifi.wifiStage >= 3 && !(data.targetArterialPath || []).length) {
    findings.push(finding(
      'target-path-missing',
      'recommendation',
      'anatomy',
      'Select an explicit target arterial path',
      'Moderate/advanced limb threat is recorded, but the intended inline route to the foot is not. Select the path before relying on GLASS or angiosome-oriented recommendations.',
      { references: [TECHNIQUE_REFERENCES.btkPosition, TECHNIQUE_REFERENCES.calfPedal] },
    ));
  }

  const seen = new Set();
  return findings.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export const getBlockingPlanFindings = (data = {}) => analyzePlan(data)
  .filter((item) => item.level === 'error');

export { hasValue, wireLengthRequired };
