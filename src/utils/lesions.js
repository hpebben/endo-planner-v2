import rawVesselData from '../assets/vessel-map.json';

const vesselSegments = Array.isArray( rawVesselData?.segments )
	? rawVesselData.segments
	: [];
const vesselNames = new Map(
	vesselSegments.map( ( segment ) => [ segment.id, segment.name ] )
);
const vesselIds = new Set( vesselSegments.map( ( segment ) => segment.id ) );

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
	if ( /metatarsal|plantar|dorsal_pedal/.test( normalized ) ) return 'pedal';
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

export const lesionLabel = ( id, values = {} ) => {
	const findings = [
		values.type,
		lengthLabel( values.length ),
		values.calcium && `${ values.calcium } calcium`,
	]
		.filter( Boolean )
		.join( ', ' );
	return findings
		? `${ vesselName( id ) } — ${ findings }`
		: vesselName( id );
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
		code: `L${ index + 1 }`,
		label: `L${ index + 1 } — ${ lesionLabel( id, values ) }`,
		name: vesselName( id ),
		side: sideFromVesselId( id ),
		territory: territoryFromVesselId( id ),
		findings: values,
	} ) );
};

export const TARGET_PATH_OPTIONS = [
	{
		key: 'anterior',
		shortLabel: 'Anterior tibial',
		description: 'Anterior tibial → dorsalis pedis',
	},
	{
		key: 'posterior',
		shortLabel: 'Posterior tibial',
		description: 'Posterior tibial → plantar arch',
	},
	{
		key: 'peroneal',
		shortLabel: 'Peroneal',
		description: 'Peroneal → distal collateral outflow',
	},
];

export const buildTargetArterialPath = ( side, targetKey ) => {
	if ( ! [ 'Left', 'Right' ].includes( side ) ) return [];
	const common = [
		idFor( side, 'common_femoral_artery' ),
		idFor( side, 'superficial_femoral_artery' ),
		idFor( side, 'popliteal_artery_artery' ),
	];

	if ( targetKey === 'anterior' ) {
		return [
			...common,
			idFor( side, 'anterior_tibial_artery', 'anterior_tibital_artery' ),
			idFor( side, 'dorsal_pedal_artery' ),
		];
	}
	if ( targetKey === 'posterior' ) {
		return [
			...common,
			idFor( side, 'tibioperoneal_trunk' ),
			idFor( side, 'posterior_tibial_artery' ),
			idFor( side, 'plantar_arch' ),
		];
	}
	if ( targetKey === 'peroneal' ) {
		return [
			...common,
			idFor( side, 'tibioperoneal_trunk' ),
			idFor( side, 'peroneal_artery' ),
		];
	}
	return [];
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
		const medialPlantar = idFor( side, 'medial_plantar_artery' );
		const lateralPlantar = idFor( side, 'lateral_plantar_artery' );
		const metatarsals = idFor( side, 'metatarsal_arteries' );

		addEdge( graph, commonFemoral, superficialFemoral );
		addEdge( graph, superficialFemoral, popliteal );
		addEdge( graph, popliteal, anteriorTibial );
		addEdge( graph, popliteal, tibioperoneal );
		addEdge( graph, tibioperoneal, posteriorTibial );
		addEdge( graph, tibioperoneal, peroneal );
		addEdge( graph, anteriorTibial, dorsalPedal );
		addEdge( graph, posteriorTibial, plantarArch );
		addEdge( graph, plantarArch, medialPlantar );
		addEdge( graph, plantarArch, lateralPlantar );
		addEdge( graph, plantarArch, metatarsals );
		addEdge( graph, dorsalPedal, metatarsals );
	} );
	return graph;
};

const targetPathGraph = createTargetPathGraph();

export const TARGET_ROUTE_ENDPOINT_IDS = [ ...targetPathGraph.keys() ].filter(
	( id ) =>
		[ 'infrapopliteal', 'pedal' ].includes( territoryFromVesselId( id ) ) &&
		! /tibioperoneal_trunk/.test( id.toLowerCase() )
);

export const buildTargetPathToSegment = ( side, endpointId ) => {
	if (
		! [ 'Left', 'Right' ].includes( side ) ||
		sideFromVesselId( endpointId ) !== side
	)
		return [];
	if ( ! TARGET_ROUTE_ENDPOINT_IDS.includes( endpointId ) ) return [];

	const startId = idFor( side, 'common_femoral_artery' );
	const queue = [ [ startId ] ];
	const visited = new Set( [ startId ] );
	while ( queue.length ) {
		const path = queue.shift();
		const current = path[ path.length - 1 ];
		if ( current === endpointId ) return path;
		( targetPathGraph.get( current ) || [] ).forEach( ( next ) => {
			if ( visited.has( next ) || sideFromVesselId( next ) !== side )
				return;
			visited.add( next );
			queue.push( [ ...path, next ] );
		} );
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
