// Original idealized LEFT-foot arterial model, not a patient angiogram.
// Topology: Manzi et al. RadioGraphics 2011, doi:10.1148/rg.316115511,
// Figs 3, 5, 7–10; Higashimori 2017, IntechOpen chapter 53810; see asset README.
// Drawing units are illustrative. x: medial (-) / lateral (+), y: heel to toes,
// z: plantar (low) / dorsal (high). Both views project this SAME vessel graph.

export const FOOT_NODES = {
  ataInflow: [1, 56, 160], ataAnkle: [5, 58, 101],
  dpTarsal: [1, 78, 85], dpMid: [-8, 104, 73],
  dpArcuate: [-16, 124, 62], dpDeepOrigin: [-19, 133, 54],
  ptaInflow: [-32, 22, 160], ptaCommunicating: [-31, 27, 112],
  ptaCalcaneal: [-31, 33, 82], plantarBifurcation: [-28, 68, 33],
  peronealInflow: [28, 22, 160], peronealBifurcation: [30, 28, 119],
  medialTarsal: [-40, 101, 49], medialPlantarBranch: [-42, 115, 29],
  medialPlantarSuperficial: [-47, 137, 26],
  medialInstep: [-46, 156, 23], medialHeel: [-34, 15, 22], lateralHeel: [36, 14, 23],
  lateralTarsal: [40, 103, 44], arcuateLateral: [50, 116, 32],
  lateralPlantarTurn: [44, 119, 18],
  arch4: [42, 131, 19], arch3: [25, 137, 22],
  arch2: [5, 139, 25], arch1: [-19, 138, 27],
  dorsal2: [0, 132, 55], dorsal3: [23, 128, 43], dorsal4: [41, 122, 35],
};

export const FOOT_ARTERIES = [];
const artery = (id, name, points, caliber, territory) => {
  const nodeIds = points.map((point, index) => {
    if (typeof point === 'string') return point;
    const nodeId = `${id}.${index}`;
    FOOT_NODES[nodeId] = point;
    return nodeId;
  });
  FOOT_ARTERIES.push({ id, name, nodeIds, caliber, territory });
};

artery('anterior-tibial', 'Anterior tibial artery', ['ataInflow', [3, 57, 135], 'ataAnkle'], 3.5, 'anterior');
artery('dorsalis-pedis', 'Dorsalis pedis artery', ['ataAnkle', 'dpTarsal', 'dpMid', 'dpArcuate', 'dpDeepOrigin'], 3, 'anterior');
artery('posterior-tibial', 'Posterior tibial artery', ['ptaInflow', 'ptaCommunicating', 'ptaCalcaneal', [-30, 48, 51], 'plantarBifurcation'], 3.5, 'posterior');
artery('peroneal', 'Peroneal / fibular artery', ['peronealInflow', [29, 24, 142], 'peronealBifurcation'], 2.9, 'peroneal');

// The peroneal artery terminates at the ankle, not as a fourth pedal trunk.
artery('anterior-perforating', 'Peroneal anterior perforating branch', ['peronealBifurcation', [41, 37, 117], [26, 59, 105], 'ataAnkle'], 1.25, 'peroneal');
artery('posterior-communicating', 'Peroneal–posterior tibial communicating branch', ['peronealBifurcation', [7, 23, 114], 'ptaCommunicating'], 1.1, 'peroneal');
artery('medial-malleolar', 'Anterior medial malleolar artery', ['ataAnkle', [-12, 59, 87], [-34, 53, 72]], 1.1, 'anterior');
artery('lateral-malleolar', 'Anterior lateral malleolar artery', ['ataAnkle', [26, 64, 88], [43, 47, 75]], 1.1, 'anterior');

artery('medial-tarsal', 'Medial tarsal artery', ['dpMid', [-24, 99, 64], 'medialTarsal'], 1.25, 'anterior');
artery('medial-tarsal-proximal', 'Proximal medial tarsal branch', ['dpTarsal', [-17, 76, 67], [-34, 82, 55]], 0.85, 'anterior');
artery('lateral-tarsal', 'Lateral tarsal artery', ['dpTarsal', [22, 91, 64], 'lateralTarsal', 'arcuateLateral'], 1.55, 'anterior');
artery('lateral-tarsal-cutaneous', 'Lateral tarsal cutaneous branch', ['lateralTarsal', [55, 101, 37], [61, 123, 29]], 0.8, 'anterior');
artery('arcuate', 'Arcuate artery', ['dpArcuate', 'dorsal2', 'dorsal3', 'dorsal4', 'arcuateLateral'], 1.75, 'anterior');

artery('medial-plantar', 'Medial plantar artery', ['plantarBifurcation', [-39, 91, 30], 'medialPlantarBranch'], 2, 'posterior');
artery('medial-plantar-superficial', 'Medial plantar superficial branch', ['medialPlantarBranch', 'medialPlantarSuperficial', 'medialInstep', [-49, 179, 20]], 1.2, 'posterior');
artery('tarsal-plantar-connection', 'Medial tarsal–medial plantar superficial connection (Manzi: deep pedal arch)', ['medialTarsal', [-44, 117, 37], 'medialPlantarSuperficial'], 0.9, 'connection');
artery('lateral-plantar', 'Lateral plantar artery', ['plantarBifurcation', [-9, 91, 23], [19, 108, 19], 'lateralPlantarTurn'], 2.65, 'posterior');
artery('plantar-arch', 'Deep plantar arch', ['lateralPlantarTurn', 'arch4', 'arch3', 'arch2', 'arch1'], 2.1, 'posterior');
// Large first-space perforator; do not place this connection at the toe tips.
artery('deep-plantar', 'Deep plantar / deep perforating artery', ['dpDeepOrigin', [-19, 135, 40], 'arch1'], 1.85, 'connection');

artery('medial-calcaneal', 'Posterior tibial medial calcaneal branch', ['ptaCalcaneal', [-38, 28, 55], 'medialHeel'], 1.6, 'posterior');
artery('medial-calcaneal-posterior', 'Medial calcaneal posterior branch', ['medialHeel', [-31, -4, 21], [-22, -13, 14]], 0.9, 'posterior');
artery('medial-calcaneal-plantar', 'Medial calcaneal plantar branch', ['medialHeel', [-30, 27, 8], [-18, 45, 9]], 0.9, 'posterior');
artery('medial-calcaneal-malleolar', 'Medial calcaneal malleolar branch', ['ptaCalcaneal', [-41, 40, 60], [-39, 55, 41]], 0.9, 'posterior');
artery('lateral-calcaneal', 'Peroneal lateral calcaneal branch', ['peronealBifurcation', [35, 24, 78], [39, 26, 45], 'lateralHeel'], 1.6, 'peroneal');
artery('lateral-calcaneal-posterior', 'Lateral calcaneal posterior branch', ['lateralHeel', [30, -5, 22], [22, -13, 14]], 0.9, 'peroneal');
artery('lateral-calcaneal-plantar', 'Lateral calcaneal plantar branch', ['lateralHeel', [35, 39, 10], [22, 58, 9]], 0.9, 'peroneal');

export const FOOT_RAYS = [
  { id: 1, base: [-29, 123, 56], head: [-45, 216, 23], tip: [-60, 265, 12], width: 13, phalanges: 2 },
  { id: 2, base: [-7, 122, 53], head: [-13, 224, 23], tip: [-14, 270, 12], width: 9, phalanges: 3 },
  { id: 3, base: [12, 119, 43], head: [15, 219, 22], tip: [22, 255, 12], width: 8, phalanges: 3 },
  { id: 4, base: [29, 114, 35], head: [35, 209, 21], tip: [46, 239, 12], width: 7.5, phalanges: 3 },
  { id: 5, base: [46, 106, 30], head: [52, 193, 20], tip: [65, 215, 12], width: 7, phalanges: 3 },
];

// Four intermetatarsal courses. The proper digital arteries bifurcate near
// the metatarsal heads, not proximally at the plantar arch.
const spaces = [
  { id: 1, dorsal: 'dpDeepOrigin', plantar: 'arch1', mid: [-27, 174], head: [-30, 218], rays: [1, 2] },
  { id: 2, dorsal: 'dorsal2', plantar: 'arch2', mid: [0, 179], head: [0, 218], rays: [2, 3] },
  { id: 3, dorsal: 'dorsal3', plantar: 'arch3', mid: [24, 174], head: [25, 210], rays: [3, 4] },
  { id: 4, dorsal: 'dorsal4', plantar: 'arch4', mid: [44, 163], head: [44, 196], rays: [4, 5] },
];
spaces.forEach((space) => {
  const dorsalMid = `dma${space.id}Mid`, plantarMid = `pma${space.id}Mid`;
  const dorsalHead = `dma${space.id}Head`, plantarHead = `pma${space.id}Head`;
  FOOT_NODES[dorsalMid] = [...space.mid, 37];
  FOOT_NODES[plantarMid] = [...space.mid, 15];
  FOOT_NODES[dorsalHead] = [...space.head, 24];
  FOOT_NODES[plantarHead] = [...space.head, 10];
  artery(`dorsal-metatarsal-${space.id}`, `${space.id === 1 ? 'First' : space.id} dorsal metatarsal artery`, [space.dorsal, dorsalMid, dorsalHead], 1.4, 'anterior');
  artery(`plantar-metatarsal-${space.id}`, `${space.id === 1 ? 'First' : space.id} plantar metatarsal artery`, [space.plantar, plantarMid, plantarHead], 1.45, 'posterior');
  // The first-space proximal connection is already the deep plantar artery.
  if (space.id > 1) artery(`proximal-perforator-${space.id}`, `Proximal intermetatarsal perforator ${space.id}`, [space.dorsal, space.plantar], 0.75, 'connection');
  artery(`distal-perforator-${space.id}`, `Distal intermetatarsal perforator ${space.id}`, [dorsalHead, plantarHead], 0.7, 'connection');
  space.rays.forEach((rayId, sideIndex) => {
    const ray = FOOT_RAYS[rayId - 1];
    const side = sideIndex === 0 ? 'lateral' : 'medial';
    const offset = side === 'lateral' ? ray.width / 2 + 2 : -ray.width / 2 - 2;
    ['dorsal', 'plantar'].forEach((surface) => {
      const z = surface === 'dorsal' ? 20 : 8;
      const endId = `${surface}Digit${rayId}${side}`;
      FOOT_NODES[endId] = [ray.tip[0] + offset, ray.tip[1] - 1, z];
      artery(`${surface}-digital-${rayId}-${side}`, `${surface === 'dorsal' ? 'Dorsal' : 'Proper plantar'} digital artery, toe ${rayId}, ${side}`, [surface === 'dorsal' ? dorsalHead : plantarHead, [ray.head[0] + offset, ray.head[1] + 11, z], endId], 0.85, surface === 'dorsal' ? 'anterior' : 'posterior');
    });
  });
});

artery('medial-plantar-deep', 'Medial plantar deep branch to the first plantar metatarsal artery', ['medialPlantarBranch', [-35, 146, 22], 'pma1Mid'], 1.2, 'posterior');
// The exposed medial hallux and lateral fifth-toe margins complete the
// digital supply; they are not an invented fifth intermetatarsal space.
[['dorsal', 1, 'medial', 'dma1Head'], ['plantar', 1, 'medial', 'pma1Head'],
  ['dorsal', 5, 'lateral', 'arcuateLateral'], ['plantar', 5, 'lateral', 'lateralPlantarTurn']].forEach(([surface, rayId, side, origin]) => {
  const ray = FOOT_RAYS[rayId - 1];
  const offset = (side === 'medial' ? -1 : 1) * (ray.width / 2 + 2);
  const z = surface === 'dorsal' ? 20 : 8;
  const endId = `${surface}Digit${rayId}${side}`;
  FOOT_NODES[endId] = [ray.tip[0] + offset, ray.tip[1] - 1, z];
  const route = rayId === 5
    ? [origin, [57, 151, z + 3], [ray.head[0] + offset, ray.head[1] + 8, z], endId]
    : [origin, [-49, 231, z], [-61, 247, z], endId];
  artery(`${surface}-digital-${rayId}-${side}`, `${surface === 'dorsal' ? 'Dorsal' : 'Proper plantar'} digital artery, toe ${rayId}, ${side}`, route, 0.85, surface === 'dorsal' ? 'anterior' : 'posterior');
});

const radians = (degrees) => degrees * Math.PI / 180;
const apTilt = radians(30), obliquity = radians(15), elevation = radians(12), imageRotation = radians(25);
const lateralU = [Math.sin(obliquity), Math.cos(obliquity), 0];
const lateralV = [Math.sin(elevation) * Math.cos(obliquity), -Math.sin(elevation) * Math.sin(obliquity), -Math.cos(elevation)];
const rotateAxes = (u, v, theta) => ({
  u: u.map((value, i) => value * Math.cos(theta) - v[i] * Math.sin(theta)),
  v: u.map((value, i) => value * Math.sin(theta) + v[i] * Math.cos(theta)),
});
export const FOOT_VIEWS = {
  ap: { width: 500, height: 580, origin: [250, 115], scale: 1.75, u: [1, 0, 0], v: [0, Math.cos(apTilt), -Math.sin(apTilt)] },
  lateral: { width: 580, height: 580, origin: [80, 310], scale: 1.7, ...rotateAxes(lateralU, lateralV, imageRotation) },
};
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
export const projectFootPoint = (point, viewId) => {
  const view = FOOT_VIEWS[viewId];
  return [view.origin[0] + view.scale * dot(point, view.u), view.origin[1] + view.scale * dot(point, view.v)];
};
const format = (value) => Number(value.toFixed(2));
export const projectedCurve = (points, viewId, close = false) => {
  const projected = points.map((point) => projectFootPoint(point, viewId));
  if (!projected.length) return '';
  let path = `M ${projected[0].map(format).join(' ')}`;
  for (let i = 0; i < projected.length - 1; i += 1) {
    const p0 = projected[Math.max(0, i - 1)], p1 = projected[i];
    const p2 = projected[i + 1], p3 = projected[Math.min(projected.length - 1, i + 2)];
    const c1 = p1.map((value, axis) => value + (p2[axis] - p0[axis]) / 6);
    const c2 = p2.map((value, axis) => value - (p3[axis] - p1[axis]) / 6);
    path += ` C ${[...c1, ...c2, ...p2].map(format).join(' ')}`;
  }
  return path + (close ? ' Z' : '');
};
export const arteryPath = (arterialSegment, viewId) => projectedCurve(arterialSegment.nodeIds.map((id) => FOOT_NODES[id]), viewId);
