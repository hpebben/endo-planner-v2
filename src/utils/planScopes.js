import { sideFromVesselId } from './lesions';

export const TARGET_PATH_SCOPE_ID = 'primary';
export const PLAN_METADATA_KEYS = new Set( [ 'id', 'lesionId', 'scope' ] );

const uniqueIds = ( ids = [] ) => [
	...new Set( ( Array.isArray( ids ) ? ids : [ ids ] ).filter( Boolean ) ),
];

export const createLesionScope = ( ids ) => {
	const normalizedIds = uniqueIds( ids );
	if ( ! normalizedIds.length ) return null;
	return {
		type: normalizedIds.length > 1 ? 'treatmentZone' : 'lesion',
		ids: normalizedIds,
	};
};

export const createTargetPathScope = () => ( {
	type: 'targetPath',
	ids: [ TARGET_PATH_SCOPE_ID ],
} );

export const normalizePlanScope = ( scope ) => {
	if ( ! scope || typeof scope !== 'object' ) return null;
	if ( scope.type === 'targetPath' ) return createTargetPathScope();
	const ids = uniqueIds( scope.ids );
	if (
		! [ 'lesion', 'treatmentZone' ].includes( scope.type ) ||
		! ids.length
	)
		return null;
	return createLesionScope( ids );
};

export const getPlanScope = ( row = {} ) =>
	normalizePlanScope( row.scope ) ||
	( row.lesionId ? createLesionScope( row.lesionId ) : null );

export const isTargetPathScope = ( rowOrScope = {} ) => {
	const scope = rowOrScope.type
		? normalizePlanScope( rowOrScope )
		: getPlanScope( rowOrScope );
	return scope?.type === 'targetPath';
};

export const getScopeLesionIds = ( rowOrScope = {} ) => {
	const scope = rowOrScope.type
		? normalizePlanScope( rowOrScope )
		: getPlanScope( rowOrScope );
	return scope && scope.type !== 'targetPath' ? scope.ids : [];
};

export const hasPlanItemContent = ( row = {} ) => {
	const hasValue = ( value ) => {
		if ( value === null || value === undefined || value === '' )
			return false;
		if ( typeof value === 'string' ) return value.trim().length > 0;
		if ( Array.isArray( value ) ) return value.some( hasValue );
		if ( typeof value === 'object' )
			return Object.values( value ).some( hasValue );
		return true;
	};

	return Object.entries( row || {} )
		.filter( ( [ key ] ) => ! PLAN_METADATA_KEYS.has( key ) )
		.some( ( [ , value ] ) => hasValue( value ) );
};

export const rowAppliesToLesion = ( row, lesionId, targetPath = [] ) => {
	const scope = getPlanScope( row );
	if ( ! scope ) return false;
	if ( scope.type === 'targetPath' )
		return ( targetPath || [] ).includes( lesionId );
	return scope.ids.includes( lesionId );
};

export const scopeKey = ( rowOrScope = {} ) => {
	const scope = rowOrScope.type
		? normalizePlanScope( rowOrScope )
		: getPlanScope( rowOrScope );
	if ( ! scope ) return 'unassigned';
	return `${ scope.type }:${ scope.ids.join( '|' ) }`;
};

export const scopeToValue = ( rowOrScope = {} ) => scopeKey( rowOrScope );

export const scopeFromValue = ( value ) => {
	const [ type, rawIds = '' ] = String( value || '' ).split( ':' );
	if ( type === 'targetPath' ) return createTargetPathScope();
	if ( ! [ 'lesion', 'treatmentZone' ].includes( type ) ) return null;
	return createLesionScope( rawIds.split( '|' ).filter( Boolean ) );
};

export const formatScopeLabel = ( rowOrScope, lesionOptions = [] ) => {
	const scope = rowOrScope?.type
		? normalizePlanScope( rowOrScope )
		: getPlanScope( rowOrScope );
	if ( ! scope ) return 'UNASSIGNED';
	if ( scope.type === 'targetPath' ) return 'PATH';
	const codeById = new Map(
		lesionOptions.map( ( lesion ) => [ lesion.value, lesion.code ] )
	);
	const codes = scope.ids.map( ( id ) => codeById.get( id ) || id );
	return scope.type === 'treatmentZone'
		? `ZONE ${ codes.join( ' + ' ) }`
		: codes[ 0 ];
};

const targetPathSideLabel = ( targetPath = [] ) =>
	sideFromVesselId( targetPath[ 0 ] ) || 'Primary';

export const buildScopeOptions = (
	lesionOptions = [],
	targetPath = [],
	{ includeTargetPath = false, includeTreatmentZones = true } = {}
) => {
	const options = [];
	if ( includeTargetPath && targetPath.length ) {
		const scope = createTargetPathScope();
		options.push( {
			value: scopeToValue( scope ),
			label: `PATH — ${ targetPathSideLabel(
				targetPath
			) } target arterial path`,
			shortLabel: 'PATH',
			scope,
		} );
	}

	lesionOptions.forEach( ( lesion ) => {
		const scope = createLesionScope( lesion.value );
		options.push( {
			value: scopeToValue( scope ),
			label: `${ lesion.code } — ${ lesion.name }`,
			shortLabel: lesion.code,
			scope,
		} );
	} );

	if ( includeTreatmentZones ) {
		const pathIndex = new Map(
			( targetPath || [] ).map( ( id, index ) => [ id, index ] )
		);
		const orderedPathLesions = lesionOptions
			.filter( ( lesion ) => pathIndex.has( lesion.value ) )
			.sort(
				( left, right ) =>
					pathIndex.get( left.value ) - pathIndex.get( right.value )
			);
		for (
			let index = 0;
			index < orderedPathLesions.length - 1;
			index += 1
		) {
			const pair = orderedPathLesions.slice( index, index + 2 );
			if ( pair[ 0 ].side !== pair[ 1 ].side ) continue;
			const scope = createLesionScope(
				pair.map( ( lesion ) => lesion.value )
			);
			options.push( {
				value: scopeToValue( scope ),
				label: `ZONE ${ pair
					.map( ( lesion ) => lesion.code )
					.join( ' + ' ) } — combined treatment zone`,
				shortLabel: `ZONE ${ pair
					.map( ( lesion ) => lesion.code )
					.join( ' + ' ) }`,
				scope,
			} );
		}
	}
	return options;
};

export const migratePlanRowScopes = (
	rows = [],
	{ defaultLesionId = '', targetPath = [], rowType = 'navigation' } = {}
) =>
	( Array.isArray( rows ) ? rows : [] ).map( ( row ) => {
		const existingScope = getPlanScope( row );
		let scope = existingScope;
		if (
			! scope &&
			rowType === 'navigation' &&
			/support|exchange/i.test(
				String( row.wire?.role || row.wire?.type || '' )
			)
		) {
			scope = targetPath.length ? createTargetPathScope() : null;
		}
		if ( ! scope && defaultLesionId )
			scope = createLesionScope( defaultLesionId );
		const migrated = { ...row };
		delete migrated.lesionId;
		if ( scope ) migrated.scope = scope;
		else delete migrated.scope;
		return migrated;
	} );

export const scopeReferencesMissingLesions = (
	rowOrScope,
	validLesionIds = []
) => {
	const valid = new Set( validLesionIds );
	return getScopeLesionIds( rowOrScope ).filter(
		( id ) => ! valid.has( id )
	);
};
