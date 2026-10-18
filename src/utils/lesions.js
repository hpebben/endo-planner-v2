import rawVesselData from '../assets/vessel-map.json';
import { buildPedalRoute, defaultPedalTarget, footArteryIdForVessel, getPedalVessels, pedalVesselId, PEDAL_ROUTE_CONNECTIONS } from '../data/pedalRoutes';
import { getActiveWoundLocations } from './clinicalStage';
import { positiveLength } from './lesionExtent';
import { poplitealSegmentLabel, lesionPositionLabel } from './lesionLocation';

const vesselSegments = Array.isArray( rawVesselData?.segments )
	? rawVesselData.segments
	: [];
const vesselNames = new Map(
	[...vesselSegments, ...getPedalVessels('Left'), ...getPedalVessels('Right')].map( ( segment ) => [ segment.id, segment.name ] )
);
const vesselIds = new Set( vesselNames.keys() );

const idFor = ( side, leftId, rightId = leftId ) =>
	side === 'Left' ? `Left_${ leftId }` : `Right_${ rightId }`;

export const sideFromVesselId = ( id ) => {
	const normalized = String( id || '' ).toLowerCase();
	if ( normalized.startsWith( 'left_' ) ) return 'Left';
	if ( normalized.startsWith( 'right_' ) ) return 'Right';
	return null;
};

export const vesselName = ( id ) =>
	vesselNames.get( id ) ||
	String( id || '' )
		.replace( /_/g, ' ' )
		.replace( /\b\w/g, ( character ) => character.toUpperCase() );

export const shortVesselName = ( id ) =>
	vesselName( id ).replace( /^(Left|Right) /, '' );

export const territoryFromVesselId = ( id ) => {
	const normalized = String( id || '' ).toLowerCase();
	if ( /_pedal_|metatarsal|plantar|dorsal_pedal/.test( normalized ) ) return 'pedal';
	if (
		/anterior_tib|posterior_tib|peroneal|tibioperoneal/.test( normalized )
	)
		return 'infrapopliteal';
	if ( /superficial_femoral|popliteal/.test( normalized ) )
		return 'femoropopliteal';
	if ( /iliac|common_femoral|profunda|aorta/.test( normalized ) )
		return 'inflow';
	return 'other';
};

const lengthLabel = ( value ) =>
	( {
		'<3': '<3 cm',
		'3-10': '3–10 cm',
		'10-15': '10–15 cm',
		'15-20': '15–20 cm',
		'>20': '>20 cm',
	}[ value ] ||
	value ||
	'length not entered' );

export const lesionLengthLabel = (values = {}) => positiveLength(values.measuredLengthCm) ? `${positiveLength(values.measuredLengthCm)} cm` : lengthLabel(values.length);
export const calcificationLabel = (value) => !value ? '' : value === 'none' ? 'no calcification' : `${value} calcification`;
export const lesionVesselName = (id, values = {}) => {
  const parts = poplitealSegmentLabel(id, values);
  return `${vesselName(id)}${parts ? ` (${parts})` : ''}`;
};

export const lesionLabel = ( id, values = {} ) => {
	const findings = [
		values.type,
		lesionLengthLabel( values ),
		values.calcium && `${ values.calcium } calcium`,
		lesionPositionLabel(values),
	]
		.filter( Boolean )
		.join( ', ' );
	return findings
		? `${ lesionVesselName( id, values ) } — ${ findings }`
		: lesionVesselName( id, values );
};

const territoryRank = ( id ) =>
	( {
		inflow: 0,
		femoropopliteal: 1,
		infrapopliteal: 2,
		pedal: 3,
		other: 4,
	}[ territoryFromVesselId( id ) ] );

export const getLesionOptions = ( segments = {}, targetPath = [] ) => {
	const pathOrder = new Map(
		( Array.isArray( targetPath ) ? targetPath : [] ).map(
			( id, index ) => [ id, index ]
		)
	);
	const entries = Object.entries( segments || {} ).sort(
		( [ leftId ], [ rightId ] ) => {
			const leftPathIndex = pathOrder.has( leftId )
				? pathOrder.get( leftId )
				: Number.POSITIVE_INFINITY;
			const rightPathIndex = pathOrder.has( rightId )
				? pathOrder.get( rightId )
				: Number.POSITIVE_INFINITY;
			if ( leftPathIndex !== rightPathIndex )
				return leftPathIndex - rightPathIndex;
			const leftSide = sideFromVesselId( leftId ) || '';
			const rightSide = sideFromVesselId( rightId ) || '';
			if ( leftSide !== rightSide )
				return leftSide.localeCompare( rightSide );
			const rankDifference =
				territoryRank( leftId ) - territoryRank( rightId );
			return (
				rankDifference ||
				vesselName( leftId ).localeCompare( vesselName( rightId ) )
			);
		}
	);

	return entries.map( ( [ id, values ], index ) => ( {
		value: id,
		code: `Lesion ${ index + 1 }`,
		label: `Lesion ${ index + 1 } — ${ lesionLabel( id, values ) }`,
		name: lesionVesselName( id, values ),
		side: sideFromVesselId( id ),
		territory: territoryFromVesselId( id ),
		findings: values,
	} ) );
};

export const TARGET_PATH_OPTIONS = [
	{
		key: 'anterior',
		shortLabel: 'Anterior tibial',
		description: 'Anterior tibial → dorsalis pedis → pedal branches',
	},
	{
		key: 'posterior',
		shortLabel: 'Posterior tibial',
		description: 'Posterior tibial → plantar / calcaneal branches',
	},
	{
		key: 'peroneal',
		shortLabel: 'Peroneal',
		description: 'Peroneal → perforating / calcaneal branches',
	},
];

const proximalTargetPath = (side, targetKey) => {
  if (!['Left', 'Right'].includes(side)) return [];
  const common = [idFor(side, 'common_femoral_artery'), idFor(side, 'superficial_femoral_artery'), idFor(side, 'popliteal_artery_artery')];
  if (targetKey === 'anterior') return [...common, idFor(side, 'anterior_tibial_artery', 'anterior_tibital_artery')];
  if (targetKey === 'posterior' || targetKey === 'peroneal') return [...common, idFor(side, 'tibioperoneal_trunk'), idFor(side, targetKey === 'posterior' ? 'posterior_tibial_artery' : 'peroneal_artery')];
  return [];
};

export const buildTargetArterialPath = (side, targetKey, { pedalTarget, woundLocations = [] } = {}) => {
  const proximal = proximalTargetPath(side, targetKey);
  const foot = buildPedalRoute(targetKey, pedalTarget || defaultPedalTarget(targetKey, woundLocations));
  if (!proximal.length || !foot.length) return [];
  return [...proximal, ...foot.slice(1).map((id) => pedalVesselId(side, id))];
};

const addEdge = ( graph, from, to ) => {
	if ( ! vesselIds.has( from ) || ! vesselIds.has( to ) ) return;
	if ( ! graph.has( from ) ) graph.set( from, new Set() );
	if ( ! graph.has( to ) ) graph.set( to, new Set() );
	graph.get( from ).add( to );
	graph.get( to ).add( from );
};

const createTargetPathGraph = () => {
	const graph = new Map();
	[ 'Left', 'Right' ].forEach( ( side ) => {
		const commonFemoral = idFor( side, 'common_femoral_artery' );
		const superficialFemoral = idFor( side, 'superficial_femoral_artery' );
		const popliteal = idFor( side, 'popliteal_artery_artery' );
		const anteriorTibial = idFor(
			side,
			'anterior_tibial_artery',
			'anterior_tibital_artery'
		);
		const tibioperoneal = idFor( side, 'tibioperoneal_trunk' );
		const posteriorTibial = idFor( side, 'posterior_tibial_artery' );
		const peroneal = idFor( side, 'peroneal_artery' );
		const dorsalPedal = idFor( side, 'dorsal_pedal_artery' );
		const plantarArch = idFor( side, 'plantar_arch' );
		const metatarsals = idFor( side, 'metatarsal_arteries' );

		addEdge( graph, commonFemoral, superficialFemoral );
		addEdge( graph, superficialFemoral, popliteal );
		addEdge( graph, popliteal, anteriorTibial );
		addEdge( graph, popliteal, tibioperoneal );
		addEdge( graph, tibioperoneal, posteriorTibial );
		addEdge( graph, tibioperoneal, peroneal );
    PEDAL_ROUTE_CONNECTIONS.forEach(([from, to]) => addEdge(graph, pedalVesselId(side, from), pedalVesselId(side, to)));
    // Retain the historical metatarsal-group identifier for saved cases.
    addEdge(graph, dorsalPedal, metatarsals);
    addEdge(graph, plantarArch, metatarsals);
	} );
	return graph;
};

const targetPathGraph = createTargetPathGraph();

export const TARGET_ROUTE_ENDPOINT_IDS = [ ...targetPathGraph.keys() ].filter(
	( id ) =>
		[ 'infrapopliteal', 'pedal' ].includes( territoryFromVesselId( id ) ) &&
		! /tibioperoneal_trunk/.test( id.toLowerCase() )
);

export const buildTargetPathToSegment = (side, endpointId, { targetKey = '', woundLocations = [] } = {}) => {
  if (!['Left', 'Right'].includes(side) || sideFromVesselId(endpointId) !== side || !TARGET_ROUTE_ENDPOINT_IDS.includes(endpointId)) return [];
  const artery = footArteryIdForVessel(endpointId);
  if (artery) {
    const rootKey = artery === 'anterior-tibial' || artery === 'dorsalis-pedis' ? 'anterior' : artery === 'posterior-tibial' ? 'posterior' : artery === 'peroneal' ? 'peroneal' : '';
    const preferredKey = targetKey || rootKey || (/plantar|medial-calcaneal/.test(artery) ? 'posterior' : /lateral-calcaneal|perforating/.test(artery) ? 'peroneal' : 'anterior');
    return buildTargetArterialPath(side, preferredKey, {
      pedalTarget: rootKey ? undefined : artery,
      woundLocations,
    });
  }
  // Legacy grouped endpoint, no invented individual digital target.
  if (/metatarsal_arteries/.test(endpointId)) {
    return [...proximalTargetPath(side, 'anterior'), idFor(side, 'dorsal_pedal_artery'), endpointId];
  }
  return [];
};

export const validateTargetArterialPath = ( path = [] ) => {
	const ids = Array.isArray( path ) ? path.filter( Boolean ) : [];
	if ( ! ids.length )
		return { isValid: false, reason: 'Select a target arterial path.' };
	const sides = [
		...new Set( ids.map( sideFromVesselId ).filter( Boolean ) ),
	];
	if (
		sides.length !== 1 ||
		ids.some( ( id ) => ! sideFromVesselId( id ) )
	) {
		return {
			isValid: false,
			reason: 'The target path must remain on one treated limb.',
		};
	}
	const side = sides[ 0 ];
  if (new Set(ids).size !== ids.length) return { isValid: false, side, reason: 'The target path must not repeat an arterial segment.' };
	if ( ids[ 0 ] !== idFor( side, 'common_femoral_artery' ) ) {
		return {
			isValid: false,
			side,
			reason: 'The route must begin at the common femoral artery.',
		};
	}
	const disconnectedIndex = ids.findIndex(
		( id, index ) =>
			index > 0 && ! targetPathGraph.get( ids[ index - 1 ] )?.has( id )
	);
	if ( disconnectedIndex >= 0 ) {
		return {
			isValid: false,
			side,
			reason: `${ shortVesselName(
				ids[ disconnectedIndex - 1 ]
			) } does not connect directly to ${ shortVesselName(
				ids[ disconnectedIndex ]
			) } on the arterial map.`,
		};
	}
	const includesFemoropopliteal = ids.some(
		( id ) => territoryFromVesselId( id ) === 'femoropopliteal'
	);
	const includesCruralTarget = ids.some(
		( id ) =>
			territoryFromVesselId( id ) === 'infrapopliteal' &&
			! /tibioperoneal_trunk/.test( id.toLowerCase() )
	);
	if ( ! includesFemoropopliteal || ! includesCruralTarget ) {
		return {
			isValid: false,
			side,
			reason: 'The route must include the femoropopliteal segment and an anterior tibial, posterior tibial or peroneal target.',
		};
	}
	return {
		isValid: true,
		side,
		endpointId: ids[ ids.length - 1 ],
		reason: '',
	};
};

export const inferTargetPathKey = ( path = [] ) => {
	const joined = ( Array.isArray( path ) ? path : [] )
		.join( ' ' )
		.toLowerCase();
	if ( joined.includes( 'anterior_tib' ) ) return 'anterior';
	if ( joined.includes( 'posterior_tib' ) ) return 'posterior';
	if ( joined.includes( 'peroneal' ) ) return 'peroneal';
	return '';
};

export const formatTargetArterialPath = ( path = [] ) =>
	( Array.isArray( path ) ? path : [] ).map( shortVesselName ).join( ' → ' );


export const upgradeLegacyTargetPath = (data = {}) => {
  const path = data.targetArterialPath || [];
  if (!path.length) return data;
  const side = sideFromVesselId(path[0]), targetKey = inferTargetPathKey(path);
  if (!side || !targetKey) return data;
  const endpoint = path[path.length - 1];
  const endArtery = footArteryIdForVessel(endpoint);
  const endsAtInflow = ['anterior-tibial', 'posterior-tibial', 'peroneal', 'dorsalis-pedis'].includes(endArtery);
  const oldArchJump = path.some((id, index) => /plantar_arch/.test(id) && /posterior_tibial_artery/.test(path[index - 1] || ''));
  if (!endsAtInflow && !oldArchJump) return data;
  // Do not silently repair a disconnected or cross-limb proximal route.
  const expected = proximalTargetPath(side, targetKey);
  if (expected.some((id, index) => path[index] !== id)) return data;
  const rebuilt = buildTargetArterialPath(side, targetKey, {
    pedalTarget: endsAtInflow ? undefined : endArtery || 'plantar-arch',
    woundLocations: getActiveWoundLocations(data),
  });
  return rebuilt.length ? { ...data, targetArterialPath: rebuilt, targetArterialPathKey: targetKey, targetArterialPathSide: side } : data;
};
