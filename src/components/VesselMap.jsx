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

export default function VesselMap({
  selectedSegments = [],
  toggleSegment = () => {},
  setTooltip,
}) {
  const [hoverSegment, setHoverSegment] = useState(null);

  const handleEnter = (id, name) => () => {
    setHoverSegment(id);
  };

  const handleLeave = (id) => () => {
    setHoverSegment((cur) => (cur === id ? null : cur));
  };

  const handleClick = (id, name) => (e) => {
    toggleSegment(id);
    if (setTooltip) {
      const elRect = e.currentTarget.getBoundingClientRect();
      const wrapper = e.currentTarget.closest('.vessel-map-wrapper');
      const wrapperRect = wrapper ? wrapper.getBoundingClientRect() : { left: 0, top: 0 };
      setTooltip({
        name,
        x: elRect.left - wrapperRect.left + elRect.width / 2,
        y: elRect.top - wrapperRect.top,
      });
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
          const isHover = hoverSegment === seg.id;
          const shapes = seg.paths || seg.polygons || [];
          return (
            <g key={seg.id} id={seg.id} data-name={seg.name}>
              {shapes.map((p, i) => {
                const attrs = p.attrs
                  ? { ...p.attrs }
                  : p.d
                  ? { d: p.d }
                  : { points: p.points };
                const tag = p.name || (p.points ? 'polygon' : 'path');
                const classes = [
                  attrs.class,
                  'vessel-segment',
                  isSelected ? 'selected' : '',
                  isHover ? 'hovered' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                delete attrs.class;
                return React.createElement(tag, {
                  key: i,
                  ...attrs,
                  className: classes,
                  onMouseEnter: handleEnter(seg.id, seg.name),
                  onMouseLeave: handleLeave(seg.id),
                  onClick: handleClick(seg.id, seg.name),
                });
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
