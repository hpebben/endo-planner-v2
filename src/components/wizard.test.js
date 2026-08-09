import { validateCaseStep as validateStep } from '../utils/caseValidation';
import { createLesionScope } from '../utils/planScopes';

const lesionId = 'Left_superficial_femoral_artery';
const validTargetPath = [
	'Left_common_femoral_artery',
	lesionId,
	'Left_popliteal_artery_artery',
	'Left_anterior_tibial_artery',
	'Left_dorsal_pedal_artery',
];

describe( 'wizard validation with explicit route and device scopes', () => {
	test( 'requires a wound location for Fontaine IV', () => {
		const errors = validateStep( 0, {
			stage: 'iv',
			clinical: { wound: 2, ischemia: 2, infection: 1, woundLocations: [] },
		} );
		expect( errors ).toContain( 'Select at least one wound or gangrene location.' );
		expect( validateStep( 0, {
			stage: 'iv',
			clinical: { wound: 2, ischemia: 2, infection: 1, woundLocations: [ 'dorsum' ] },
		} ) ).toEqual( [] );
	} );

	test( 'accepts a continuous same-limb target arterial path', () => {
		expect(
			validateStep( 1, {
				patencySegments: {
					[ lesionId ]: {
						type: 'occlusion',
						length: '>20',
						calcium: 'heavy',
					},
				},
				targetArterialPath: validTargetPath,
			} )
		).toEqual( [] );
	} );

	test( 'blocks a disconnected target path', () => {
		const errors = validateStep( 1, {
			patencySegments: {
				[ lesionId ]: {
					type: 'occlusion',
					length: '>20',
					calcium: 'heavy',
				},
			},
			targetArterialPath: [
				'Left_common_femoral_artery',
				lesionId,
				'Left_posterior_tibial_artery',
			],
		} );
		expect( errors.join( ' ' ) ).toMatch( /does not connect directly/i );
	} );

	test( 'does not treat an inherited scope chip as a selected device', () => {
		const errors = validateStep( 2, {
			patencySegments: {
				[ lesionId ]: {
					type: 'stenosis',
					length: '3-10',
					calcium: 'none',
				},
			},
			targetArterialPath: validTargetPath,
			accessRows: [ { id: 'a1', approach: 'Antegrade' } ],
			navRows: [
				{ id: 'n1', scope: createLesionScope( lesionId ), wire: {} },
			],
			therapyRows: [
				{ id: 't1', scope: createLesionScope( lesionId ), balloon: {} },
			],
		} );
		expect( errors ).toEqual(
			expect.arrayContaining( [
				'Enter a navigation or crossing strategy.',
				'Enter a vessel preparation or treatment strategy.',
			] )
		);
	} );
} );
