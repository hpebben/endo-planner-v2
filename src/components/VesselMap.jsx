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

  const handleEnter = (id, name) => (e) => {
    console.log('hover event for', id, name);
    setHoverSegment(id);
    if (setTooltip) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({ name, x: e.clientX, y: rect.top + window.scrollY });
    }
  };

  const handleLeave = (id) => () => {
    console.log('leave event for', id);
    setHoverSegment((cur) => (cur === id ? null : cur));
    if (setTooltip) setTooltip(null);
  };

  const handleClick = (id, name) => () => {
    console.log('click event for', id, name);
    toggleSegment(id);
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
