import React, { useId } from 'react';
import PropTypes from 'prop-types';
import {
  FOOT_ARTERIES, FOOT_NODES, FOOT_RAYS, FOOT_VIEWS,
  arteryPath, projectFootPoint, projectedCurve,
} from '../data/footArterialModel';

// Faint original bony/soft-tissue context, without patient pixels. The vessel
// courses and branch junctions are projected from the shared arterial model.
const tarsals = [
  { id: 'calcaneus', center: [1, 27, 33], radii: [31, 39, 25] },
  { id: 'talus', center: [0, 56, 77], radii: [24, 27, 21] },
  { id: 'navicular', center: [-16, 95, 65], radii: [23, 15, 14] },
  { id: 'cuboid', center: [31, 103, 35], radii: [15, 21, 13] },
  { id: 'medial-cuneiform', center: [-29, 116, 56], radii: [13, 16, 13] },
  { id: 'intermediate-cuneiform', center: [-7, 113, 53], radii: [9, 12, 11] },
  { id: 'lateral-cuneiform', center: [12, 110, 44], radii: [11, 13, 11] },
];

const outlines = {
  ap: [
    [-42, 25, 166], [-43, 40, 80], [-42, 65, 64], [-43, 90, 55], [-53, 128, 29], [-59, 170, 20], [-62, 215, 14],
    [-73, 259, 12], [-64, 275, 12], [-51, 272, 12], [-43, 237, 12],
    [-27, 264, 12], [-19, 281, 12], [-7, 275, 12], [-3, 244, 12],
    [10, 254, 12], [20, 268, 12], [31, 261, 12], [30, 235, 12],
    [37, 239, 12], [46, 250, 12], [55, 240, 12], [52, 218, 12],
    [60, 215, 12], [70, 228, 12], [79, 216, 12], [66, 184, 15],
    [60, 139, 28], [50, 88, 55], [43, 56, 85], [45, 26, 166],
  ],
  lateral: [
    [0, 12, 166], [0, 16, 92], [0, -6, 53], [0, -16, 22], [0, -4, -3],
    [0, 44, -3], [0, 82, 8], [0, 126, 12], [0, 192, 5], [0, 250, 4],
    [0, 272, 10], [0, 255, 24], [0, 222, 37], [0, 167, 60],
    [0, 113, 92], [0, 68, 107], [0, 68, 166],
  ],
};
const interpolate = (a, b, fraction) => a.map((value, i) => value + fraction * (b[i] - value));
const longBones = [
  { id: 'tibia', start: [-12, 28, 169], end: [-16, 36, 91], width: 13 },
  { id: 'fibula', start: [34, 25, 169], end: [41, 37, 94], width: 6 },
  ...FOOT_RAYS.flatMap((ray) => [
    { id: `metatarsal-${ray.id}`, start: ray.base, end: ray.head, width: ray.width / 2 },
    ...Array.from({ length: ray.phalanges }, (_, index) => ({
      id: `phalanx-${ray.id}-${index + 1}`,
      start: interpolate(ray.head, ray.tip, (index + 0.16) / ray.phalanges),
      end: interpolate(ray.head, ray.tip, (index + 0.88) / ray.phalanges),
      width: ray.width * (index === 0 ? 0.45 : 0.36),
    })),
  ]),
];

const projectedEllipse = (bone, viewId) => {
  const view = FOOT_VIEWS[viewId];
  const [cx, cy] = projectFootPoint(bone.center, viewId);
  const u = view.u.map((value, i) => value * bone.radii[i] * view.scale);
  const v = view.v.map((value, i) => value * bone.radii[i] * view.scale);
  const a = u.reduce((sum, value) => sum + value * value, 0);
  const b = u.reduce((sum, value, i) => sum + value * v[i], 0);
  const d = v.reduce((sum, value) => sum + value * value, 0);
  const spread = Math.hypot(a - d, 2 * b);
  return { cx, cy, rx: Math.sqrt((a + d + spread) / 2), ry: Math.sqrt((a + d - spread) / 2), angle: Math.atan2(2 * b, a - d) * 90 / Math.PI };
};
const bonePath = (bone, viewId) => {
  const [x1, y1] = projectFootPoint(bone.start, viewId);
  const [x2, y2] = projectFootPoint(bone.end, viewId);
  const length = Math.hypot(x2 - x1, y2 - y1);
  const radius = bone.width * FOOT_VIEWS[viewId].scale;
  const nx = -(y2 - y1) / length * radius, ny = (x2 - x1) / length * radius;
  const dx = (x2 - x1) / length * radius, dy = (y2 - y1) / length * radius;
  // Bulbous ends and a narrower shaft give a radiographic cortical outline.
  return `M ${x1 + nx} ${y1 + ny}
    C ${x1 + nx * 0.5 + dx} ${y1 + ny * 0.5 + dy} ${x2 + nx * 0.5 - dx} ${y2 + ny * 0.5 - dy} ${x2 + nx} ${y2 + ny}
    C ${x2 + nx + dx} ${y2 + ny + dy} ${x2 - nx + dx} ${y2 - ny + dy} ${x2 - nx} ${y2 - ny}
    C ${x2 - nx * 0.5 - dx} ${y2 - ny * 0.5 - dy} ${x1 - nx * 0.5 + dx} ${y1 - ny * 0.5 + dy} ${x1 - nx} ${y1 - ny}
    C ${x1 - nx - dx} ${y1 - ny - dy} ${x1 + nx - dx} ${y1 + ny - dy} ${x1 + nx} ${y1 + ny} Z`;
};

const labels = {
  ap: [
    { text: 'ATA', node: 'ataInflow', box: [12, 34, 60, 26] },
    { text: 'PTA', node: 'ptaInflow', box: [12, 80, 60, 26] },
    { text: 'Peroneal', node: 'peronealInflow', box: [386, 24, 96, 26] },
    { text: 'Dorsalis pedis', node: 'dpMid', box: [10, 208, 125, 26] },
    { text: 'Medial plantar', node: 'medialPlantarBranch', box: [10, 322, 128, 26] },
    { text: 'Lateral plantar', node: 'lateralPlantarTurn', box: [362, 248, 128, 26] },
    { text: 'Arcuate', node: 'dorsal3', box: [368, 320, 122, 26] },
    { text: 'Plantar arch', node: 'arch2', box: [368, 368, 122, 26] },
    { text: 'Deep plantar', node: 'deep-plantar.1', box: [10, 376, 125, 26] },
    { text: '1st dorsal MT', node: 'dma1Mid', box: [10, 428, 125, 26] },
  ],
  lateral: [
    { text: 'ATA', node: 'ataInflow', box: [368, 35, 60, 26] },
    { text: 'PTA', node: 'ptaInflow', box: [12, 30, 60, 26] },
    { text: 'Peroneal', node: 'peronealInflow', box: [164, 10, 95, 26] },
    { text: 'Dorsalis pedis', node: 'dpMid', box: [406, 185, 125, 26] },
    { text: 'Medial plantar', node: 'medialPlantarBranch', box: [10, 190, 130, 26] },
    { text: 'Lateral plantar', node: 'lateralPlantarTurn', box: [235, 535, 130, 26] },
    { text: 'Plantar arch', node: 'arch2', box: [423, 535, 134, 26] },
    { text: 'Deep plantar', node: 'deep-plantar.1', box: [409, 281, 135, 26] },
    { text: 'Arcuate', node: 'dorsal3', box: [20, 505, 142, 26] },
    { text: 'Medial calcaneal', node: 'medialHeel', box: [8, 251, 144, 26] },
    { text: 'Lateral calcaneal', node: 'lateralHeel', box: [10, 461, 145, 26] },
  ],
};

export default function FootAngiographicModel({ viewId, showLabels = false }) {
  const instance = useId().replace(/:/g, '');
  const prefix = `foot-model-${instance}-${viewId}`;
  const view = FOOT_VIEWS[viewId];
  return (
    <g className="foot-angiographic-model" data-testid={`foot-anatomy-${viewId}`} aria-hidden="true">
      <defs>
        <radialGradient id={`${prefix}-field`}><stop offset="0" stopColor="#eef0f2" /><stop offset="1" stopColor="#cbd0d4" /></radialGradient>
        <linearGradient id={`${prefix}-bone`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f5f6f7" /><stop offset="0.48" stopColor="#d9dee2" /><stop offset="1" stopColor="#f1f3f4" /></linearGradient>
        <filter id={`${prefix}-grain`}><feTurbulence type="fractalNoise" baseFrequency="0.64" numOctaves="2" seed="17" /><feColorMatrix type="saturate" values="0" /></filter>
      </defs>
      <rect width={view.width} height={view.height} fill={`url(#${prefix}-field)`} />
      <rect width={view.width} height={view.height} filter={`url(#${prefix}-grain)`} opacity="0.035" />
      <path d={projectedCurve(outlines[viewId], viewId, true)} className="foot-soft-tissue" />
      <g className="foot-bones" fill={`url(#${prefix}-bone)`}>
        {tarsals.map((bone) => {
          const { cx, cy, rx, ry, angle } = projectedEllipse(bone, viewId);
          return <ellipse key={bone.id} data-bone={bone.id} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${angle} ${cx} ${cy})`} />;
        })}
        {longBones.map((bone) => <path key={bone.id} data-bone={bone.id} d={bonePath(bone, viewId)} />)}
      </g>
      <g className="foot-arteries">
        {FOOT_ARTERIES.map((segment) => (
          <path
            key={segment.id}
            data-artery-id={segment.id}
            data-territory={segment.territory}
            data-patency="patent"
            d={arteryPath(segment, viewId)}
            strokeWidth={segment.caliber}
            className="foot-artery"
          >
            <title>{segment.name}</title>
          </path>
        ))}
      </g>
      {showLabels && (
        <g className="foot-artery-labels" data-testid={`foot-artery-labels-${viewId}`}>
          {labels[viewId].map((label) => {
            const [x, y, width, height] = label.box;
            const anchor = projectFootPoint(FOOT_NODES[label.node], viewId);
            return (
              <g key={label.text}>
                <line x1={x + width / 2} y1={y + height / 2} x2={anchor[0]} y2={anchor[1]} />
                <circle cx={anchor[0]} cy={anchor[1]} r="2.5" />
                <rect x={x} y={y} width={width} height={height} rx="4" />
                <text x={x + width / 2} y={y + height / 2}>{label.text}</text>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
}

FootAngiographicModel.propTypes = {
  viewId: PropTypes.oneOf(['ap', 'lateral']).isRequired,
  showLabels: PropTypes.bool,
};
