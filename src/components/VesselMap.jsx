import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import rawVesselData from '../assets/vessel-map.json';
import { getLesionExtent, lesionExtentDescription } from '../utils/lesionExtent';
import { moveLesionPosition, lesionMapDirection } from '../utils/lesionLocation';
import '../styles/style.scss';

// Determine the actual segments array regardless of JSON shape.
const parseVesselData = (data) => {
  if (Array.isArray(data?.segments)) {
    return { root: data.root || {}, segments: data.segments };
  }
  if (Array.isArray(data)) {
    return { root: {}, segments: data };
  }
  console.error('Vessel map JSON does not contain a segments array');
  return { root: {}, segments: null };
};

const { root: vesselRoot, segments: vesselSegments } = parseVesselData(rawVesselData);

function VesselShape({ segmentId, shape, classes, selected, targeted, extent, onPositionChange }) {
  const shapeRef = useRef(null);
  const dragRef = useRef(null);
  const clipId = `lesion-${useId().replace(/:/g, '')}`;
  const [axis, setAxis] = useState('y');
  useLayoutEffect(() => {
    if (!selected || !shapeRef.current) return;
    const bounds = shapeRef.current.getBBox();
    setAxis(bounds.width > bounds.height ? 'x' : 'y');
  }, [selected]);
  const attrs = shape.attrs ? { ...shape.attrs } : shape.d ? { d: shape.d } : { points: shape.points };
  const tag = shape.name || (shape.points ? 'polygon' : 'path');
  delete attrs.class;
  const direction = lesionMapDirection(segmentId, axis);
  const start = direction < 0 ? 1 - (extent?.start || 0) - (extent?.fraction || 0) : extent?.start || 0;
  const end = start + (extent?.fraction || 0);
  const clip = axis === 'x' ? `M ${start} 0 H ${end} V 1 H ${start} Z` : `M 0 ${start} H 1 V ${end} H 0 Z`;
  const pointOnShape = (event) => {
    const matrix = shapeRef.current?.getScreenCTM();
    return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()) : null;
  };
  const startDrag = (event) => {
    if (event.button !== 0 || !onPositionChange || extent?.fraction >= 1) return;
    const point = pointOnShape(event), bounds = shapeRef.current.getBBox();
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { active: true, moved: false, point, clientX: event.clientX, clientY: event.clientY, size: axis === 'x' ? bounds.width : bounds.height, position: extent.positionFraction, fraction: extent.fraction };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag?.active || !drag.size) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.clientX, event.clientY - drag.clientY) < 3) return;
    const point = pointOnShape(event);
    if (!point) return;
    drag.moved = true;
    event.preventDefault();
    event.stopPropagation();
    const delta = direction * (point[axis] - drag.point[axis]) / drag.size;
    onPositionChange(Number(moveLesionPosition(drag.position, drag.fraction, delta).toFixed(4)));
  };
  const endDrag = (event) => {
    if (!dragRef.current?.active) return;
    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return (
    <>
      {targeted && React.createElement(tag, { ...attrs, className: 'vessel-target-route', 'aria-hidden': true })}
      {React.createElement(tag, { ...attrs, className: classes, ref: shapeRef })}
      {selected && extent?.fraction > 0 && (
        <>
          <defs><clipPath id={clipId} clipPathUnits="objectBoundingBox"><path d={clip} /></clipPath></defs>
          {React.createElement(tag, { ...attrs, className: 'vessel-lesion-fill', clipPath: `url(#${clipId})`, 'aria-hidden': true })}
          {onPositionChange && extent.fraction < 1 && React.createElement(tag, {
            ...attrs,
            className: 'vessel-lesion-drag-hit',
            clipPath: `url(#${clipId})`,
            'aria-hidden': true,
            onPointerDown: startDrag,
            onPointerMove: moveDrag,
            onPointerUp: endDrag,
            onPointerCancel: endDrag,
            onClick: (event) => { if (dragRef.current?.moved) { event.stopPropagation(); dragRef.current = null; } },
          })}
        </>
      )}
    </>
  );
}

// Calculate tooltip placement relative to the hovered segment
const getTooltipPlacement = (segRect, wrapperRect, tipSize = { width: 0, height: 0 }) => {
  const margin = 8;
  const containerCenter = wrapperRect.left + wrapperRect.width / 2;
  let side = segRect.left + segRect.width / 2 < containerCenter ? 'left' : 'right';
  let x = side === 'left' ? segRect.left - wrapperRect.left - margin : segRect.right - wrapperRect.left + margin;
  let y = segRect.top - wrapperRect.top + segRect.height / 2;

  // Horizontal overflow check
  if (side === 'left' && x - tipSize.width < 0) {
    // Not enough space on the left, flip
    if (segRect.right - wrapperRect.left + margin + tipSize.width <= wrapperRect.width) {
      side = 'right';
      x = segRect.right - wrapperRect.left + margin;
    } else {
      // Clamp within container
      x = tipSize.width;
    }
  } else if (side === 'right' && x + tipSize.width > wrapperRect.width) {
    // Not enough space on the right, flip
    if (segRect.left - wrapperRect.left - margin - tipSize.width >= 0) {
      side = 'left';
      x = segRect.left - wrapperRect.left - margin;
    } else {
      // Clamp within container
      x = wrapperRect.width - tipSize.width;
    }
  }

  // Vertical overflow check
  if (y - tipSize.height / 2 < 0) {
    y = tipSize.height / 2;
  } else if (y + tipSize.height / 2 > wrapperRect.height) {
    y = wrapperRect.height - tipSize.height / 2;
  }

  return { side, x, y };
};

export default function VesselMap({
  selectedSegments = [],
  lesions = {},
  targetSegments = [],
  targetEndpointCandidates = [],
  routeEditMode = false,
  planningMode = false,
  planningSegmentIds = [],
  activePlanningSegment = '',
  readOnly = false,
  toggleSegment = () => {},
  onLesionPositionChange,
  setTooltip,
}) {
  const [hoverSegment, setHoverSegment] = useState(null);

  const handleEnter = (id, name) => (e) => {
    setHoverSegment(id);
    if (setTooltip) {
      const segRect = e.currentTarget.getBoundingClientRect();
      const wrapper = e.currentTarget.closest('.vessel-map-wrapper');
      const wrapperRect = wrapper ? wrapper.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
      const { side, x, y } = getTooltipPlacement(segRect, wrapperRect);
      setTooltip({ name, x, y, side, segRect, wrapperRect });
    }
  };

  const handleLeave = (id) => () => {
    setHoverSegment((cur) => (cur === id ? null : cur));
    if (setTooltip) {
      setTooltip(null);
    }
  };

  const handleClick = (id) => () => {
    if (routeEditMode && !targetEndpointCandidates.includes(id)) return;
    if (planningMode && !planningSegmentIds.includes(id)) return;
    toggleSegment(id);
  };

  const handleKeyDown = (id) => (event) => {
    if (routeEditMode && !targetEndpointCandidates.includes(id)) return;
    if (planningMode && !planningSegmentIds.includes(id)) return;
    if (!readOnly && !routeEditMode && !planningMode && onLesionPositionChange && selectedSegments.includes(id)) {
      const extent = getLesionExtent(id, lesions[id]);
      const delta = ['ArrowUp', 'ArrowLeft'].includes(event.key) ? -0.05 : ['ArrowDown', 'ArrowRight'].includes(event.key) ? 0.05 : null;
      if (extent.fraction > 0 && extent.fraction < 1 && (delta !== null || ['Home', 'End'].includes(event.key))) {
        event.preventDefault();
        const bounds = event.currentTarget.querySelector('.vessel-segment')?.getBBox();
        const direction = bounds?.width > bounds?.height && ['ArrowLeft', 'ArrowRight'].includes(event.key) ? lesionMapDirection(id, 'x') : 1;
        const position = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : Math.max(0, Math.min(1, extent.positionFraction + direction * delta));
        onLesionPositionChange(id, Number(position.toFixed(4)));
        return;
      }
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSegment(id);
    }
  };

  if (!Array.isArray(vesselSegments)) {
    return (
      <div className="vessel-map-wrapper">
        <p className="vessel-map-error">Unable to load vessel segments.</p>
      </div>
    );
  }

  return (
    <div className="vessel-map-wrapper">
      <svg {...vesselRoot} className="vessel-svg">
        {vesselSegments.map((seg) => {
          const isSelected = selectedSegments.includes(seg.id);
          const isTargeted = targetSegments.includes(seg.id);
          const isTargetEndpointCandidate = targetEndpointCandidates.includes(seg.id);
          const isPlanningSegment = planningSegmentIds.includes(seg.id);
          const isActivePlanningSegment = activePlanningSegment === seg.id;
          const isHover = hoverSegment === seg.id;
          const extent = isSelected ? getLesionExtent(seg.id, lesions[seg.id]) : null;
          const extentDescription = isSelected ? lesionExtentDescription(seg.id, lesions[seg.id]) : '';
          const shapes = seg.paths || seg.polygons || [];
          return (
            <g
              key={seg.id}
              id={seg.id}
              data-name={seg.name}
              data-lesion-fraction={extent?.fraction ?? undefined}
              data-lesion-position={extent?.positionFraction ?? undefined}
              aria-description={extentDescription || undefined}
              role={readOnly ? undefined : 'button'}
              tabIndex={readOnly ? undefined : (routeEditMode && !isTargetEndpointCandidate) || (planningMode && !isPlanningSegment) ? -1 : 0}
              aria-label={routeEditMode ? `Set target route to ${seg.name}` : planningMode ? `Plan devices for ${seg.name}` : seg.name}
              aria-pressed={readOnly ? undefined : routeEditMode ? isTargeted : planningMode ? isActivePlanningSegment : isSelected}
              aria-disabled={readOnly ? undefined : (routeEditMode && !isTargetEndpointCandidate) || (planningMode && !isPlanningSegment)}
              data-route-endpoint={isTargetEndpointCandidate ? 'true' : undefined}
              onMouseEnter={handleEnter(seg.id, `${seg.name}${extentDescription ? ` — ${extentDescription}` : ''}`)}
              onMouseLeave={handleLeave(seg.id)}
              onFocus={handleEnter(seg.id, `${seg.name}${extentDescription ? ` — ${extentDescription}` : ''}`)}
              onBlur={handleLeave(seg.id)}
              onClick={handleClick(seg.id)}
              onKeyDown={handleKeyDown(seg.id)}
            >
              {shapes.map((p, i) => {
                const attrs = p.attrs ? { ...p.attrs } : p.d ? { d: p.d } : { points: p.points };
                const classes = [
                  attrs.class,
                  'vessel-segment',
                  isSelected ? 'selected' : '',
                  isTargeted ? 'targeted' : '',
                  routeEditMode && isTargetEndpointCandidate ? 'target-endpoint-candidate' : '',
                  routeEditMode && !isTargetEndpointCandidate ? 'route-edit-disabled' : '',
                  planningMode && isPlanningSegment ? 'plan-selectable' : '',
                  planningMode && !isPlanningSegment ? 'plan-edit-disabled' : '',
                  isActivePlanningSegment ? 'plan-active' : '',
                  isHover ? 'hovered' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return <VesselShape key={i} segmentId={seg.id} shape={p} classes={classes} selected={isSelected} targeted={isTargeted} extent={extent} onPositionChange={!readOnly && !routeEditMode && !planningMode && onLesionPositionChange ? (position) => onLesionPositionChange(seg.id, position) : undefined} />;
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
