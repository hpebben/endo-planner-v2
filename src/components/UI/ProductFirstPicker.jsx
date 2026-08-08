import React, { useEffect, useId, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

export const CUSTOM_PRODUCT_VALUE = '__custom_product__';

const deduplicateOptions = ( options = [] ) => {
	const seen = new Set();
	return options.filter( ( option ) => {
		if ( ! option?.value || seen.has( option.value ) ) return false;
		seen.add( option.value );
		return true;
	} );
};

export function ProductSelect( {
	value,
	options,
	onChange,
	onCustomChange,
	label = __( 'Product', 'endoplanner' ),
	placeholder = __( 'Choose product', 'endoplanner' ),
	allowCustom = true,
} ) {
	const normalizedOptions = useMemo(
		() => deduplicateOptions( options ),
		[ options ]
	);
	const productId = useId();
	const customProductId = useId();
	const knownValue = normalizedOptions.some(
		( option ) => option.value === value
	);
	const [ customMode, setCustomMode ] = useState(
		Boolean( value && ! knownValue )
	);

	useEffect( () => {
		setCustomMode(
			Boolean(
				value &&
					! normalizedOptions.some(
						( option ) => option.value === value
					)
			)
		);
	}, [ normalizedOptions, value ] );

	const preferred = normalizedOptions.filter(
		( option ) => option.preferred
	);
	const remaining = normalizedOptions.filter(
		( option ) => ! option.preferred
	);
	let selectValue = '';
	if ( customMode ) selectValue = CUSTOM_PRODUCT_VALUE;
	else if ( knownValue ) selectValue = value;

	const handleSelect = ( event ) => {
		const next = event.target.value;
		if ( next === CUSTOM_PRODUCT_VALUE ) {
			setCustomMode( true );
			return;
		}
		setCustomMode( false );
		onChange( next );
	};

	return (
		<div className="product-first-select">
			<label htmlFor={ productId }>
				<span>{ label }</span>
				<select
					id={ productId }
					value={ selectValue }
					onChange={ handleSelect }
				>
					<option value="">{ placeholder }</option>
					{ preferred.length > 0 && (
						<optgroup
							label={ __( 'Preferred devices', 'endoplanner' ) }
						>
							{ preferred.map( ( option ) => (
								<option
									key={ option.value }
									value={ option.value }
									disabled={ option.disabled }
								>
									{ `★ ${ option.label }` }
								</option>
							) ) }
						</optgroup>
					) }
					{ remaining.length > 0 && (
						<optgroup
							label={
								preferred.length
									? __(
											'Other matching products',
											'endoplanner'
									  )
									: __( 'Matching products', 'endoplanner' )
							}
						>
							{ remaining.map( ( option ) => (
								<option
									key={ option.value }
									value={ option.value }
									disabled={ option.disabled }
								>
									{ option.label }
								</option>
							) ) }
						</optgroup>
					) }
					{ allowCustom && (
						<option value={ CUSTOM_PRODUCT_VALUE }>
							{ __( 'Custom product…', 'endoplanner' ) }
						</option>
					) }
				</select>
			</label>
			{ customMode && (
				<label
					className="product-custom-field"
					htmlFor={ customProductId }
				>
					<span>{ __( 'Custom product name', 'endoplanner' ) }</span>
					<input
						id={ customProductId }
						type="text"
						value={ knownValue ? '' : value || '' }
						onChange={ ( event ) =>
							onCustomChange?.( event.target.value )
						}
						placeholder={ __(
							'Manufacturer and product',
							'endoplanner'
						) }
					/>
				</label>
			) }
		</div>
	);
}

ProductSelect.propTypes = {
	value: PropTypes.string,
	options: PropTypes.arrayOf(
		PropTypes.shape( {
			value: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
			preferred: PropTypes.bool,
			disabled: PropTypes.bool,
		} )
	).isRequired,
	onChange: PropTypes.func.isRequired,
	onCustomChange: PropTypes.func,
	label: PropTypes.string,
	placeholder: PropTypes.string,
	allowCustom: PropTypes.bool,
};

export function ChoiceChips( { label, value, options, onChange, testId } ) {
	if ( ! options.length ) return null;

	return (
		<div className="device-choice-group" data-testid={ testId }>
			<span className="device-choice-label">{ label }</span>
			<div
				className="device-choice-chips"
				role="group"
				aria-label={ label }
			>
				{ options.map( ( option ) => {
					const normalized =
						typeof option === 'string'
							? { label: option, value: option }
							: option;
					const active = normalized.value === value;
					return (
						<button
							type="button"
							key={ normalized.value }
							className={ `device-choice-chip${
								active ? ' is-active' : ''
							}` }
							aria-pressed={ active }
							disabled={ normalized.disabled }
							onClick={ () => onChange( normalized.value ) }
						>
							{ normalized.label }
						</button>
					);
				} ) }
			</div>
		</div>
	);
}

ChoiceChips.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.string,
	options: PropTypes.arrayOf(
		PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.shape( {
				label: PropTypes.string.isRequired,
				value: PropTypes.string.isRequired,
				disabled: PropTypes.bool,
			} ),
		] )
	).isRequired,
	onChange: PropTypes.func.isRequired,
	testId: PropTypes.string,
};

export function FilterChips( { label, value, options, onChange, testId } ) {
	return (
		<ChoiceChips
			label={ label }
			value={ value || '' }
			options={ [
				{ label: __( 'Any', 'endoplanner' ), value: '' },
				...options,
			] }
			onChange={ onChange }
			testId={ testId }
		/>
	);
}

FilterChips.propTypes = ChoiceChips.propTypes;

export function ProductFirstLayout( {
	product,
	productOptions,
	onProductChange,
	onCustomProductChange,
	variantGroups = [],
	children,
	matchCount,
	onResetFilters,
} ) {
	let matchText = __( 'Optional filters', 'endoplanner' );
	if ( Number.isInteger( matchCount ) ) {
		const noun =
			matchCount === 1
				? __( 'match', 'endoplanner' )
				: __( 'matches', 'endoplanner' );
		matchText = `${ matchCount } ${ noun }`;
	}

	return (
		<div
			className="product-first-picker"
			data-testid="product-first-picker"
		>
			<div className="product-first-row">
				<ProductSelect
					value={ product }
					options={ productOptions }
					onChange={ onProductChange }
					onCustomChange={ onCustomProductChange }
				/>
				{ variantGroups.length > 0 && (
					<div className="product-variant-groups">
						{ variantGroups.map( ( group ) => (
							<ChoiceChips
								key={ group.key || group.label }
								{ ...group }
							/>
						) ) }
					</div>
				) }
			</div>
			<div className="device-filter-heading">
				<div>
					<strong>{ __( 'Refine products', 'endoplanner' ) }</strong>
					<span>{ matchText }</span>
				</div>
				{ onResetFilters && (
					<button type="button" onClick={ onResetFilters }>
						{ __( 'Clear filters', 'endoplanner' ) }
					</button>
				) }
			</div>
			<div className="device-filter-grid">{ children }</div>
		</div>
	);
}

ProductFirstLayout.propTypes = {
	product: PropTypes.string,
	productOptions: PropTypes.arrayOf( PropTypes.object ).isRequired,
	onProductChange: PropTypes.func.isRequired,
	onCustomProductChange: PropTypes.func,
	variantGroups: PropTypes.arrayOf( PropTypes.object ),
	children: PropTypes.node.isRequired,
	matchCount: PropTypes.number,
	onResetFilters: PropTypes.func,
};
