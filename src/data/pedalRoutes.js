import { FOOT_ARTERIES } from './footArterialModel';
import { getWoundZones } from './woundosome';

// The route graph and the two foot views share the same named junctions.
// Connections are anatomical possibilities, not observations of patient patency.
const roots = { anterior: 'anterior-tibial', posterior: 'posterior-tibial', peroneal: 'peroneal' };
const rootIds = new Set(Object.values(roots));
const aliases = {
  'anterior-tibial': 'anterior_tibial_artery',
  'posterior-tibial': 'posterior_tibial_artery',
  peroneal: 'peroneal_artery',
  'dorsalis-pedis': 'dorsal_pedal_artery',
  'medial-plantar': 'medial_plantar_artery',
  'lateral-plantar': 'lateral_plantar_artery',
  'plantar-arch': 'plantar_arch',
};

export const pedalVesselId = (side, arteryId) => {
  if (!['Left', 'Right'].includes(side)) return '';
  if (side === 'Right' && arteryId === 'anterior-tibial') return 'Right_anterior_tibital_artery';
  return `${side}_${aliases[arteryId] || `pedal_${arteryId.replace(/-/g, '_')}`}`;
};

export const getPedalVessels = (side) => FOOT_ARTERIES.map((artery) => ({
  id: pedalVesselId(side, artery.id),
  name: `${side} ${artery.name.charAt(0).toLowerCase()}${artery.name.slice(1)}`,
  arteryId: artery.id,
}));

const byVesselId = new Map(['Left', 'Right'].flatMap(getPedalVessels).map((vessel) => [vessel.id, vessel]));
export const footArteryIdForVessel = (id) => byVesselId.get(id)?.arteryId || '';

const graph = new Map(FOOT_ARTERIES.map((artery) => [artery.id, []]));
FOOT_ARTERIES.forEach((artery) => {
  FOOT_ARTERIES.forEach((other) => {
    if (artery.id !== other.id && artery.nodeIds.some((node) => other.nodeIds.includes(node))) graph.get(artery.id).push(other.id);
  });
});

export const PEDAL_ROUTE_CONNECTIONS = FOOT_ARTERIES.flatMap((artery) => (
  graph.get(artery.id).map((other) => [artery.id, other])
));

const defaultTargets = { anterior: 'arcuate', posterior: 'plantar-arch', peroneal: 'anterior-perforating' };
const woundTargets = {
  'dorsal-toes': ['arcuate', 'dorsal-metatarsal-1', 'dorsal-metatarsal-2', 'dorsal-metatarsal-3', 'dorsal-metatarsal-4'],
  'hallux-first-ray': ['dorsal-metatarsal-1', 'medial-plantar-deep', 'plantar-metatarsal-1', 'dorsal-digital-1-medial', 'dorsal-digital-1-lateral', 'plantar-digital-1-medial', 'plantar-digital-1-lateral'],
  dorsum: ['lateral-tarsal', 'medial-tarsal'],
  'lateral-ankle': ['anterior-perforating', 'lateral-malleolar'],
  'plantar-toes': ['plantar-arch', 'plantar-metatarsal-1', 'plantar-metatarsal-2', 'plantar-metatarsal-3', 'plantar-metatarsal-4'],
  'medial-plantar': ['medial-plantar-superficial', 'medial-plantar'],
  'lateral-plantar': ['lateral-plantar', 'plantar-digital-5-lateral'],
  'medial-heel': ['medial-calcaneal'],
  'lateral-heel': ['lateral-calcaneal'],
};

export const buildPedalRoute = (targetKey, endpointArteryId) => {
  const start = roots[targetKey];
  if (!start || !graph.has(endpointArteryId) || rootIds.has(endpointArteryId)) return [];
  const queue = [[start]], visited = new Set([start]);
  while (queue.length) {
    const path = queue.shift(), current = path[path.length - 1];
    if (current === endpointArteryId) return path.filter((id, index) => {
      if (index === 0 || index === path.length - 1) return true;
      const previous = FOOT_ARTERIES.find((artery) => artery.id === path[index - 1]);
      const next = FOOT_ARTERIES.find((artery) => artery.id === path[index + 1]);
      const artery = FOOT_ARTERIES.find((item) => item.id === id);
      return !artery.nodeIds.some((node) => previous.nodeIds.includes(node) && next.nodeIds.includes(node));
    });
    (graph.get(current) || []).forEach((next) => {
      // Stay on the chosen tibial/peroneal inflow. A communicating branch
      // does not silently change the proximal target artery.
      if (visited.has(next) || (rootIds.has(next) && next !== start)) return;
      visited.add(next);
      queue.push([...path, next]);
    });
  }
  return [];
};

const relatedTargets = (targetKey, selectedWounds) => new Set(getWoundZones(selectedWounds)
  .filter((zone) => zone.primaryTapKeys.includes(targetKey))
  .flatMap((zone) => woundTargets[zone.id] || []));

export const getPedalTargetOptions = (targetKey, selectedWounds = []) => {
  const suggested = relatedTargets(targetKey, selectedWounds);
  return FOOT_ARTERIES
    .filter((artery) => !rootIds.has(artery.id) && artery.id !== 'dorsalis-pedis' && buildPedalRoute(targetKey, artery.id).length)
    .map((artery) => ({
      value: artery.id,
      label: artery.name,
      suggested: suggested.has(artery.id),
      group: suggested.has(artery.id) ? 'Woundosome targets to assess' : /digital/.test(artery.id) ? 'Digital branches' : /metatarsal/.test(artery.id) ? 'Metatarsal arteries' : 'Other pedal and ankle branches',
    }));
};

export const defaultPedalTarget = (targetKey, selectedWounds = []) => {
  const options = getPedalTargetOptions(targetKey, selectedWounds);
  const sameInflow = targetKey === 'posterior' ? 'posterior' : targetKey === 'peroneal' ? 'peroneal' : 'anterior';
  return options.find((option) => option.suggested && FOOT_ARTERIES.find((artery) => artery.id === option.value)?.territory === sameInflow)?.value
    || defaultTargets[targetKey] || '';
};

export const getPedalRouteHighlights = (targetPath = []) => {
  const route = targetPath.map(footArteryIdForVessel).filter(Boolean);
  const result = {};
  route.forEach((id, index) => {
    const artery = FOOT_ARTERIES.find((item) => item.id === id);
    const previous = FOOT_ARTERIES.find((item) => item.id === route[index - 1]);
    const next = FOOT_ARTERIES.find((item) => item.id === route[index + 1]);
    const start = previous ? artery.nodeIds.findIndex((node) => previous.nodeIds.includes(node)) : 0;
    const end = next ? artery.nodeIds.findIndex((node) => next.nodeIds.includes(node)) : start === artery.nodeIds.length - 1 ? 0 : artery.nodeIds.length - 1;
    if (start < 0 || end < 0 || start === end) return;
    result[id] = [Math.min(start, end), Math.max(start, end)];
  });
  return result;
};
