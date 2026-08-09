import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import {
  catalogItemMatches,
  clearCatalogFilters,
  getCatalogFilterOptions,
  getCatalogProduct,
  getCatalogProductOptions,
  reconcileCatalogProduct,
} from '../../data/deviceCatalog';
import { FilterChips, ProductFirstLayout } from './ProductFirstPicker';

const singleton = (value) => (value ? [String(value)] : []);

const profileLabel = (profile, mirrorSpecific) => (
  mirrorSpecific ? profile.specific || profile.product : profile.product
);

const profileCatalogItem = (profile, mirrorSpecific) => ({
  manufacturer: '',
  name: profileLabel(profile, mirrorSpecific),
  label: profileLabel(profile, mirrorSpecific),
  categories: singleton(profile.category),
  platforms: singleton(profile.platform),
  functionalRoles: singleton(profile.functionalRole),
  types: singleton(profile.type),
  materials: singleton(profile.material),
  sizes: singleton(profile.size),
  diameters: singleton(profile.diameter),
  lengths: singleton(profile.length),
  shafts: singleton(profile.shaft),
  deliveryModes: singleton(profile.deliveryMode),
  minimumSheaths: singleton(profile.minimumSheathFr),
});

export default function CatalogProductPicker({
  catalog,
  form,
  onChange,
  filters,
  preferredProfiles = [],
  mirrorSpecific = false,
  productLegend,
}) {
  const extendedCatalog = useMemo(() => {
    const labels = new Set(catalog.map((item) => item.label));
    const localProducts = preferredProfiles
      .filter((profile) => profileLabel(profile, mirrorSpecific) && !labels.has(profileLabel(profile, mirrorSpecific)))
      .map((profile) => profileCatalogItem(profile, mirrorSpecific));
    return [...catalog, ...localProducts];
  }, [catalog, mirrorSpecific, preferredProfiles]);

  const selectedLabel = form.product || (mirrorSpecific ? form.specific : '') || '';
  const preferredLabels = preferredProfiles.map((profile) => profileLabel(profile, mirrorSpecific)).filter(Boolean);
  const productOptions = getCatalogProductOptions(extendedCatalog, form, preferredLabels);

  const commitProduct = (value) => {
    const matchingPreference = preferredProfiles.find((profile) => (
      profileLabel(profile, mirrorSpecific) === value && catalogItemMatches(
        profileCatalogItem(profile, mirrorSpecific),
        form,
      )
    ));
    const reconciled = reconcileCatalogProduct(extendedCatalog, form, value, { mirrorSpecific });
    onChange(matchingPreference
      ? { ...reconciled, ...matchingPreference, product: value, ...(mirrorSpecific ? { specific: value } : {}) }
      : reconciled);
  };

  const changeFilter = (field, value) => onChange({ ...form, [field]: value });
  const resetFilters = () => onChange(clearCatalogFilters(form, filters.map((filter) => filter.field)));
  const cataloguedProduct = Boolean(getCatalogProduct(extendedCatalog, selectedLabel));

  return (
    <>
      <ProductFirstLayout
        product={selectedLabel}
        productOptions={productOptions}
        onProductChange={commitProduct}
        onCustomProductChange={(value) => onChange({
          ...form,
          product: value,
          ...(mirrorSpecific ? { specific: value } : {}),
        })}
        productLegend={productLegend}
        matchCount={new Set(productOptions.map((option) => option.value)).size}
        onResetFilters={resetFilters}
      >
        {filters.map((filter) => (
          <FilterChips
            key={filter.field}
            label={filter.label}
            value={form[filter.field] || ''}
            options={getCatalogFilterOptions(extendedCatalog, { ...form, product: selectedLabel }, filter.field)}
            onChange={(value) => changeFilter(filter.field, value)}
            testId={filter.testId}
          />
        ))}
      </ProductFirstLayout>
      {selectedLabel && !cataloguedProduct && (
        <p className="wire-catalog-note">
          {__('Custom/local product selected. Enter its specifications manually and confirm them against the current IFU.', 'endoplanner')}
        </p>
      )}
    </>
  );
}

CatalogProductPicker.propTypes = {
  catalog: PropTypes.arrayOf(PropTypes.object).isRequired,
  form: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(PropTypes.shape({
    field: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    testId: PropTypes.string,
  })).isRequired,
  preferredProfiles: PropTypes.arrayOf(PropTypes.object),
  mirrorSpecific: PropTypes.bool,
  productLegend: PropTypes.string,
};
