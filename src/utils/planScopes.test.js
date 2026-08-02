import {
	buildScopeOptions,
	createLesionScope,
	createTargetPathScope,
	formatScopeLabel,
	getPlanScope,
	hasPlanItemContent,
	migratePlanRowScopes,
	rowAppliesToLesion,
	scopeFromValue,
	scopeToValue,
} from './planScopes';

const targetPath = [
	'Left_common_femoral_artery',
	'Left_superficial_femoral_artery',
	'Left_popliteal_artery_artery',
	'Left_anterior_tibial_artery',
];

const lesions = [
	{
		value: 'Left_superficial_femoral_artery',
		code: 'L1',
		name: 'Left superficial femoral artery',
		side: 'Left',
	},
	{
		value: 'Left_anterior_tibial_artery',
		code: 'L2',
		name: 'Left anterior tibial artery',
		side: 'Left',
	},
];

describe( 'plan device scopes', () => {
	test( 'round-trips path, lesion and combined treatment-zone scopes', () => {
		[
			createTargetPathScope(),
			createLesionScope( lesions[ 0 ].value ),
			createLesionScope( lesions.map( ( lesion ) => lesion.value ) ),
		].forEach( ( scope ) =>
			expect( scopeFromValue( scopeToValue( scope ) ) ).toEqual( scope )
		);
		expect( formatScopeLabel( createTargetPathScope(), lesions ) ).toBe(
			'PATH'
		);
		expect(
			formatScopeLabel(
				createLesionScope( lesions.map( ( lesion ) => lesion.value ) ),
				lesions
			)
		).toBe( 'ZONE L1 + L2' );
	} );

	test( 'offers the target path, individual lesions and an adjacent combined zone', () => {
		const options = buildScopeOptions( lesions, targetPath, {
			includeTargetPath: true,
		} );
		expect( options.map( ( option ) => option.shortLabel ) ).toEqual( [
			'PATH',
			'L1',
			'L2',
			'ZONE L1 + L2',
		] );
	} );

	test( 'migrates legacy lesionId rows and path-scopes unlinked support wires', () => {
		const [ legacy ] = migratePlanRowScopes( [
			{
				id: 'n1',
				lesionId: lesions[ 0 ].value,
				wire: { role: 'CTO crossing' },
			},
		] );
		expect( legacy ).not.toHaveProperty( 'lesionId' );
		expect( getPlanScope( legacy ) ).toEqual(
			createLesionScope( lesions[ 0 ].value )
		);

		const [ support ] = migratePlanRowScopes(
			[ { id: 'n2', wire: { role: 'Support / exchange' } } ],
			{ targetPath, rowType: 'navigation' }
		);
		expect( getPlanScope( support ) ).toEqual( createTargetPathScope() );
	} );

	test( 'scope metadata alone is not treated as a device entry', () => {
		const row = {
			id: 'n1',
			scope: createLesionScope( lesions[ 0 ].value ),
			wire: {},
		};
		expect( hasPlanItemContent( row ) ).toBe( false );
		expect(
			hasPlanItemContent( { ...row, wire: { platform: '0.018' } } )
		).toBe( true );
	} );

	test( 'path-scoped rows apply only to lesions on the selected target path', () => {
		const row = {
			scope: createTargetPathScope(),
			wire: { role: 'Support / exchange' },
		};
		expect(
			rowAppliesToLesion( row, lesions[ 0 ].value, targetPath )
		).toBe( true );
		expect(
			rowAppliesToLesion(
				row,
				'Right_superficial_femoral_artery',
				targetPath
			)
		).toBe( false );
	} );
} );
