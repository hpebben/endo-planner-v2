import { FOOT_ARTERIES, FOOT_NODES, FOOT_RAYS, FOOT_VIEWS, arteryPath, projectFootPoint } from './footArterialModel';

const artery = (id) => FOOT_ARTERIES.find((segment) => segment.id === id);
const nodes = (id) => artery(id).nodeIds.map((nodeId) => FOOT_NODES[nodeId]);
const ends = (id) => [artery(id).nodeIds[0], artery(id).nodeIds.at(-1)];
const reachable = (start, segments = FOOT_ARTERIES) => {
  const edges = new Map();
  segments.forEach((segment) => segment.nodeIds.slice(1).forEach((next, i) => {
    const previous = segment.nodeIds[i];
    edges.set(previous, [...(edges.get(previous) || []), next]);
    edges.set(next, [...(edges.get(next) || []), previous]);
  }));
  const visited = new Set([start]), queue = [start];
  for (let i = 0; i < queue.length; i += 1) {
    (edges.get(queue[i]) || []).forEach((next) => {
      if (!visited.has(next)) { visited.add(next); queue.push(next); }
    });
  }
  return visited;
};

// Anatomical invariants from Manzi's anterior/posterior/peroneal anatomy and
// pedal–plantar loop. These guard clinically meaningful errors, not styling.
describe('patent reference arterial anatomy', () => {
  test('has no isolated vessels, duplicated IDs or undefined junctions', () => {
    expect(new Set(FOOT_ARTERIES.map((segment) => segment.id)).size).toBe(FOOT_ARTERIES.length);
    FOOT_ARTERIES.forEach((segment) => {
      expect(segment.caliber).toBeGreaterThan(0);
      segment.nodeIds.forEach((id) => expect(FOOT_NODES[id]).toHaveLength(3));
    });
    const connected = reachable('ataInflow');
    Object.keys(FOOT_NODES).forEach((id) => expect(connected.has(id)).toBe(true));
  });

  test('continues ATA into DP and connects DP to LPA through a complete pedal–plantar loop', () => {
    expect(ends('anterior-tibial')[1]).toBe(ends('dorsalis-pedis')[0]);
    expect(ends('dorsalis-pedis')[1]).toBe(ends('deep-plantar')[0]);
    expect(ends('deep-plantar')[1]).toBe(ends('plantar-arch')[1]);
    expect(ends('lateral-plantar')[1]).toBe(ends('plantar-arch')[0]);
    const loop = reachable('ataInflow', FOOT_ARTERIES.filter((segment) => [
      'anterior-tibial', 'dorsalis-pedis', 'deep-plantar', 'plantar-arch', 'lateral-plantar', 'posterior-tibial',
    ].includes(segment.id)));
    expect(loop.has('ptaInflow')).toBe(true);
  });

  test('dives through the proximal first interspace rather than connecting at the toe tips', () => {
    const deep = nodes('deep-plantar');
    const firstBase = FOOT_RAYS[0].base, secondBase = FOOT_RAYS[1].base;
    deep.forEach(([x, y]) => {
      expect(x).toBeGreaterThan(firstBase[0]);
      expect(x).toBeLessThan(secondBase[0]);
      expect(y).toBeLessThan(FOOT_RAYS[0].head[1] - 60);
    });
    expect(deep[0][2]).toBeGreaterThan(deep.at(-1)[2]);
  });

  test('branches PTA to both plantar arteries and turns LPA medially into the arch', () => {
    const bifurcation = ends('posterior-tibial')[1];
    expect(ends('medial-plantar')[0]).toBe(bifurcation);
    expect(ends('lateral-plantar')[0]).toBe(bifurcation);
    const lateral = nodes('lateral-plantar'), arch = nodes('plantar-arch');
    expect(lateral[0][0]).toBeLessThan(0);
    expect(lateral.at(-1)[0]).toBeGreaterThan(30);
    expect(arch[0][0]).toBeGreaterThan(arch.at(-1)[0]);
    arch.forEach((point) => expect(point[1]).toBeLessThan(155));
  });

  test('places the arcuate near the metatarsal bases and joins it to lateral tarsal', () => {
    expect(ends('arcuate')[0]).toBe('dpArcuate');
    expect(ends('arcuate')[1]).toBe(ends('lateral-tarsal')[1]);
    nodes('arcuate').forEach((point) => expect(point[1]).toBeLessThan(145));
    [2, 3, 4].forEach((number) => expect(artery('arcuate').nodeIds).toContain(ends(`dorsal-metatarsal-${number}`)[0]));
    expect(ends('dorsal-metatarsal-1')[0]).toBe('dpDeepOrigin');
  });

  test('provides four dorsal/plantar metatarsal courses with proximal and distal connections', () => {
    [1, 2, 3, 4].forEach((number) => {
      const dorsal = nodes(`dorsal-metatarsal-${number}`);
      const plantar = nodes(`plantar-metatarsal-${number}`);
      expect(dorsal.at(-1)[1]).toBeGreaterThan(190);
      dorsal.forEach((point, i) => expect(point[2]).toBeGreaterThan(plantar[i][2]));
      expect(ends(`distal-perforator-${number}`)).toEqual([`dma${number}Head`, `pma${number}Head`]);
      if (number > 1) expect(ends(`proximal-perforator-${number}`)).toEqual([
        ends(`dorsal-metatarsal-${number}`)[0], ends(`plantar-metatarsal-${number}`)[0],
      ]);
    });
  });

  test('has independent continuous dorsal and plantar supply to both sides of all five toes', () => {
    ['dorsal', 'plantar'].forEach((surface) => {
      const supply = reachable(surface === 'dorsal' ? 'ataInflow' : 'ptaInflow', FOOT_ARTERIES.filter((segment) => segment.territory === (surface === 'dorsal' ? 'anterior' : 'posterior')));
      [1, 2, 3, 4, 5].forEach((number) => ['medial', 'lateral'].forEach((side) => {
        expect(supply.has(`${surface}Digit${number}${side}`)).toBe(true);
        const segment = nodes(`${surface}-digital-${number}-${side}`);
        if (number < 5) expect(segment[0][1]).toBeGreaterThan(190);
      }));
    });
  });

  test('supplies the outer fifth toe from fourth DMA dorsally and LPA plantarly', () => {
    const dorsalOrigin = ends('dorsal-digital-5-lateral')[0];
    expect(artery('dorsal-metatarsal-4').nodeIds).toContain(dorsalOrigin);
    expect(artery('arcuate').nodeIds).not.toContain(dorsalOrigin);
    expect(ends('plantar-digital-5-lateral')[0]).toBe(ends('lateral-plantar')[1]);
  });

  test('distinguishes medial plantar superficial/tarsal and deep/first-metatarsal connections', () => {
    expect(ends('medial-plantar-deep')).toEqual(['medialPlantarBranch', 'pma1Mid']);
    expect(ends('tarsal-plantar-connection')).toEqual(['medialTarsal', 'medialPlantarSuperficial']);
    expect(artery('medial-plantar-superficial').nodeIds).toContain('medialPlantarSuperficial');
    expect(artery('plantar-arch').nodeIds).not.toContain('medialPlantarSuperficial');
  });

  test('keeps peroneal at the ankle and gives the correct independent heel origins', () => {
    expect(nodes('peroneal').at(-1)[1]).toBeLessThan(40);
    expect(ends('medial-calcaneal')[0]).toBe('ptaCalcaneal');
    expect(ends('lateral-calcaneal')[0]).toBe('peronealBifurcation');
    expect(FOOT_NODES.medialHeel[0]).toBeLessThan(0);
    expect(FOOT_NODES.lateralHeel[0]).toBeGreaterThan(0);
    expect(ends('anterior-perforating')[1]).toBe('ataAnkle');
    expect(ends('posterior-communicating')[1]).toBe('ptaCommunicating');
  });

  test('projects the entire shared artery graph into both uncropped fields with orthonormal axes', () => {
    const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
    Object.entries(FOOT_VIEWS).forEach(([viewId, view]) => {
      expect(dot(view.u, view.u)).toBeCloseTo(1);
      expect(dot(view.v, view.v)).toBeCloseTo(1);
      expect(dot(view.u, view.v)).toBeCloseTo(0);
      FOOT_ARTERIES.forEach((segment) => {
        expect(arteryPath(segment, viewId)).not.toMatch(/NaN|undefined/);
        segment.nodeIds.forEach((id) => {
          const [x, y] = projectFootPoint(FOOT_NODES[id], viewId);
          expect(x).toBeGreaterThan(0);
          expect(x).toBeLessThan(view.width);
          expect(y).toBeGreaterThan(0);
          expect(y).toBeLessThan(view.height);
        });
      });
    });
  });
});
