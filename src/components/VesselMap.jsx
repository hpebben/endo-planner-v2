import React, { useState } from 'react';
import rawVesselData from '../assets/vessel-map.json';
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
  targetSegments = [],
  targetEndpointCandidates = [],
  routeEditMode = false,
  planningMode = false,
  planningSegmentIds = [],
  activePlanningSegment = '',
  toggleSegment = () => {},
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
          const shapes = seg.paths || seg.polygons || [];
          return (
            <g
              key={seg.id}
              id={seg.id}
              data-name={seg.name}
              role="button"
              tabIndex={(routeEditMode && !isTargetEndpointCandidate) || (planningMode && !isPlanningSegment) ? -1 : 0}
              aria-label={routeEditMode ? `Set target route to ${seg.name}` : planningMode ? `Plan devices for ${seg.name}` : seg.name}
              aria-pressed={routeEditMode ? isTargeted : planningMode ? isActivePlanningSegment : isSelected}
              aria-disabled={(routeEditMode && !isTargetEndpointCandidate) || (planningMode && !isPlanningSegment)}
              data-route-endpoint={isTargetEndpointCandidate ? 'true' : undefined}
              onMouseEnter={handleEnter(seg.id, seg.name)}
              onMouseLeave={handleLeave(seg.id)}
              onFocus={handleEnter(seg.id, seg.name)}
              onBlur={handleLeave(seg.id)}
              onClick={handleClick(seg.id)}
              onKeyDown={handleKeyDown(seg.id)}
            >
              {shapes.map((p, i) => {
                const attrs = p.attrs ? { ...p.attrs } : p.d ? { d: p.d } : { points: p.points };
                const tag = p.name || (p.points ? 'polygon' : 'path');
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
                delete attrs.class;
                return React.createElement(tag, {
                  key: i,
                  ...attrs,
                  className: classes,
                });
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
