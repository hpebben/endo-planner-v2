import React, { useState } from 'react';
import vesselData from '../assets/vessel-map.json';
import '../styles/style.scss';

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

  return (
    <div className="vessel-map-wrapper">
      <svg {...vesselData.root} className="vessel-svg">
        {vesselData.segments.map((seg) => {
          const isSelected = selectedSegments.includes(seg.id);
          const isHover = hoverSegment === seg.id;
          return (
            <g key={seg.id} id={seg.id} data-name={seg.name}>
              {seg.paths.map((p, i) => {
                const attrs = p.attrs ? { ...p.attrs } : { d: p.d };
                const tag = p.name || 'path';
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
