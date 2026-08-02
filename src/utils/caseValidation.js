import { getBlockingPlanFindings } from './planAnalysis';
import { territoryFromVesselId, validateTargetArterialPath } from './lesions';

const metadataKeys = new Set( [ 'id', 'lesionId', 'scope' ] );

export const hasCaseValue = ( value ) => {
	if ( value === null || value === undefined || value === '' ) return false;
	if ( typeof value === 'string' ) return value.trim().length > 0;
	if ( Array.isArray( value ) ) return value.some( hasCaseValue );
	if ( typeof value === 'object' ) {
		return Object.entries( value )
			.filter( ( [ key ] ) => ! metadataKeys.has( key ) )
			.some( ( [ , nestedValue ] ) => hasCaseValue( nestedValue ) );
	}
	return true;
};

export const validateCaseStep = (
	step,
	data = {},
	translate = ( message ) => message
) => {
	const errors = [];

	if ( step === 0 ) {
		if ( ! data.stage )
			errors.push(
				translate( 'Select a Fontaine stage.', 'endoplanner' )
			);
		const clinical = data.clinical || {};
		if (
			! [ clinical.wound, clinical.ischemia, clinical.infection ].every(
				Number.isInteger
			)
		) {
			errors.push(
				translate( 'Assess all three WIfI components.', 'endoplanner' )
			);
		}
	}

	if ( step === 1 ) {
		const segmentIds = Object.keys( data.patencySegments || {} );
		if ( ! segmentIds.length ) {
			errors.push(
				translate(
					'Enter at least one affected arterial segment.',
					'endoplanner'
				)
			);
		}
		const hasInfrainguinalDisease = segmentIds.some( ( id ) =>
			[ 'femoropopliteal', 'infrapopliteal', 'pedal' ].includes(
				territoryFromVesselId( id )
			)
		);
		if (
			hasInfrainguinalDisease &&
			! ( data.targetArterialPath || [] ).length
		) {
			errors.push(
				translate(
					'Select the intended target arterial path.',
					'endoplanner'
				)
			);
		} else if ( ( data.targetArterialPath || [] ).length ) {
			const pathValidation = validateTargetArterialPath(
				data.targetArterialPath
			);
			if ( ! pathValidation.isValid )
				errors.push( pathValidation.reason );
		}
	}

	if ( step === 2 ) {
		const hasAccess = ( data.accessRows || [] ).some( hasCaseValue );
		const hasNavigation = ( data.navRows || [] ).some( hasCaseValue );
		const hasTherapy = ( data.therapyRows || [] ).some( hasCaseValue );
		if ( ! hasAccess )
			errors.push(
				translate( 'Enter an access strategy.', 'endoplanner' )
			);
		if ( ! hasNavigation )
			errors.push(
				translate(
					'Enter a navigation or crossing strategy.',
					'endoplanner'
				)
			);
		if ( ! hasTherapy )
			errors.push(
				translate(
					'Enter a vessel preparation or treatment strategy.',
					'endoplanner'
				)
			);
		getBlockingPlanFindings( data ).forEach( ( finding ) =>
			errors.push( finding.title )
		);
	}

	return [ ...new Set( errors ) ];
};
