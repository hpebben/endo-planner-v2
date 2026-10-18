import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import SegmentedControl from './SegmentedControl';
import { getLesionExtent, lengthCategoryForCm, lesionExtentDescription, positiveLength } from '../../utils/lesionExtent';
import { isPoplitealSegment, normalizePoplitealSegments, normalizeLesionPosition, POPLITEAL_SEGMENTS, POPLITEAL_SEGMENT_REFERENCE } from '../../utils/lesionLocation';

const lengthLabels = ['<3cm', '3–10cm', '10–15cm', '15–20cm', '>20cm'];
const lengthValues = ['<3', '3-10', '10-15', '15-20', '>20'];

export default function ParameterPopup({ segmentId, segmentName, initialValues, onSave, onCancel }) {
  const [condition, setCondition] = useState(initialValues.type || '');
  const [length, setLength] = useState(initialValues.length || '');
  const [calcium, setCalcium] = useState(initialValues.calcium || '');
  const [measuredLength, setMeasuredLength] = useState(initialValues.measuredLengthCm || '');
  const [referenceLength, setReferenceLength] = useState(initialValues.referenceLengthCm || '');
  const [position, setPosition] = useState(normalizeLesionPosition(initialValues.positionFraction));
  const [poplitealParts, setPoplitealParts] = useState(normalizePoplitealSegments(initialValues.poplitealSegments));
  const popliteal = isPoplitealSegment(segmentId);
  const boxRef = useRef(null);

  useEffect(() => {
    setCondition(initialValues.type || '');
    setLength(initialValues.length || '');
    setCalcium(initialValues.calcium || '');
    setMeasuredLength(initialValues.measuredLengthCm || '');
    setReferenceLength(initialValues.referenceLengthCm || '');
    setPosition(normalizeLesionPosition(initialValues.positionFraction));
    setPoplitealParts(normalizePoplitealSegments(initialValues.poplitealSegments));
  }, [initialValues]);

  useEffect(() => {
    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onCancel]);

  const values = {
    ...initialValues,
    type: condition,
    length: measuredLength ? lengthCategoryForCm(measuredLength) : length,
    calcium,
    measuredLengthCm: measuredLength,
    referenceLengthCm: referenceLength,
    positionFraction: position ?? undefined,
    ...(popliteal ? { poplitealSegments: poplitealParts } : {}),
  };
  const validLengths = (!measuredLength || positiveLength(measuredLength)) && (!referenceLength || positiveLength(referenceLength));
  const reference = getLesionExtent(segmentId, values);
  const canSave = condition && values.length && calcium && validLengths;

  return (
    <div className="param-box" ref={boxRef}>
      <h4>{segmentName}</h4>

      {popliteal && <div className="param-section">
        <div className="param-title">{__('Popliteal segments', 'endoplanner')}</div>
        <div className="popliteal-segment-buttons" role="group" aria-label={__('Popliteal segments', 'endoplanner')}>
          {POPLITEAL_SEGMENTS.map((part) => <button type="button" key={part.value} className={`stage-btn${poplitealParts.includes(part.value) ? ' is-active' : ''}`} aria-pressed={poplitealParts.includes(part.value)} title={part.description} onClick={() => setPoplitealParts((parts) => parts.includes(part.value) ? parts.filter((value) => value !== part.value) : [...parts, part.value])}>{part.value}</button>)}
        </div>
      </div>}

      <div className="param-section">
        {/* Updated label to remove trailing colon */}
        <div className="param-title">{__('Patency', 'endoplanner')}</div>
        <SegmentedControl
          options={[
            { label: __('Stenosis', 'endoplanner'), value: 'stenosis' },
            { label: __('Occlusion', 'endoplanner'), value: 'occlusion' },
          ]}
          ariaLabel={__('Patency', 'endoplanner')}
          value={condition}
          onChange={(val) => {
            setCondition(val);
          }}
        />
      </div>

      <div className="param-section">
        <div className="param-title">{__('Length', 'endoplanner')}</div>
        <SegmentedControl
          options={lengthValues.map((val, i) => ({ label: lengthLabels[i], value: val }))}
          value={measuredLength ? lengthCategoryForCm(measuredLength) : length}
          onChange={(val) => { setLength(val); setMeasuredLength(''); }}
          ariaLabel={__('Length', 'endoplanner')}
        />
      </div>

      <div className="param-section">
        <div className="param-title">{__('Calcium', 'endoplanner')}</div>
        <SegmentedControl
          options={[
            { label: __('None', 'endoplanner'), value: 'none' },
            { label: __('Moderate', 'endoplanner'), value: 'moderate' },
            { label: __('Heavy', 'endoplanner'), value: 'heavy' },
          ]}
          value={calcium}
          onChange={setCalcium}
          ariaLabel={__('Calcium', 'endoplanner')}
        />
      </div>

      <details className="lesion-map-settings">
        <summary>{__('Lesion extent on map (optional)', 'endoplanner')}</summary>
        <div className="lesion-position-control">
          <span>{__('Schematic lesion position', 'endoplanner')}</span>
          <SegmentedControl ariaLabel={__('Schematic lesion position', 'endoplanner')} options={[{ label: __('Proximal', 'endoplanner'), value: '0' }, { label: __('Middle', 'endoplanner'), value: '0.5' }, { label: __('Distal', 'endoplanner'), value: '1' }]} value={String(position ?? 0.5)} onChange={(next) => setPosition(Number(next))} />
          <input type="range" aria-label={__('Lesion position within arterial segment', 'endoplanner')} min="0" max="100" step="1" value={Math.round((position ?? 0.5) * 100)} onChange={(event) => setPosition(Number(event.target.value) / 100)} />
        </div>
        <label>
          <span>{__('Measured lesion length (cm)', 'endoplanner')}</span>
          <input type="number" min="0.1" step="any" value={measuredLength} onChange={(event) => setMeasuredLength(event.target.value)} placeholder={__('Use length range', 'endoplanner')} />
        </label>
        <label>
          <span>{__('Arterial segment reference length (cm)', 'endoplanner')}</span>
          <input type="number" min="0.1" step="any" value={referenceLength} onChange={(event) => setReferenceLength(event.target.value)} placeholder={String(getLesionExtent(segmentId).referenceCm || '')} />
        </label>
        {reference.referenceCm && <p>{`${__('Drawing reference', 'endoplanner')}: ${reference.referenceCm} cm (${reference.basis}).`}{reference.sourceUrl && <> <a href={reference.sourceUrl} target="_blank" rel="noreferrer">{__('Source', 'endoplanner')}</a></>}</p>}

        <p>{lesionExtentDescription(segmentId, values)}</p>
        {popliteal && <p><a href={POPLITEAL_SEGMENT_REFERENCE} target="_blank" rel="noreferrer">{__('P1–P3 anatomical definitions (ESR)', 'endoplanner')}</a></p>}
        {!validLengths && <p role="alert">{__('Enter a positive length in centimetres.', 'endoplanner')}</p>}
      </details>
      <div className="lesion-save-actions">
        <button type="button" className="target-path-clear" onClick={onCancel}>{__('Cancel', 'endoplanner')}</button>
        <button type="button" className="target-path-save" disabled={!canSave} onClick={() => onSave(values)}>{__('Save lesion', 'endoplanner')}</button>
      </div>
    </div>
  );
}

ParameterPopup.propTypes = {
  segmentId: PropTypes.string.isRequired,
  segmentName: PropTypes.string.isRequired,
  initialValues: PropTypes.shape({
    type: PropTypes.string,
    length: PropTypes.string,
    calcium: PropTypes.string,
    measuredLengthCm: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    referenceLengthCm: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    positionFraction: PropTypes.number,
    poplitealSegments: PropTypes.arrayOf(PropTypes.string),
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
