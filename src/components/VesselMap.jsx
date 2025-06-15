import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as MapSvg } from '../assets/vessel-map.svg';
import { vesselSegments } from './steps/Step2_Patency';

export default function VesselMap() {
  const [hoverSegment, setHoverSegment] = useState('');
  const [selectedSegments, setSelectedSegments] = useState([]);
  const containerRef = useRef(null);

  const idToName = useRef(
    vesselSegments.reduce((acc, { id, name }) => {
      acc[id] = name;
      return acc;
    }, {})
  ).current;

  const handleMouseOver = (e) => {
    const g = e.target.closest('g');
    if (!g || !idToName[g.id]) return;
    setHoverSegment(idToName[g.id]);
  };

  const handleMouseOut = (e) => {
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) return;
    setHoverSegment('');
  };

  const handleClick = (e) => {
    const g = e.target.closest('g');
    if (!g || !idToName[g.id]) return;
    const name = idToName[g.id];
    setSelectedSegments((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.querySelectorAll('title').forEach((t) => t.remove());
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    vesselSegments.forEach(({ id, name }) => {
      const group = container.querySelector(`#${id}`);
      if (!group) return;
      const selected = selectedSegments.includes(name);
      group.querySelectorAll('path').forEach((el) => {
        el.classList.add('segment');
        el.classList.toggle('selected', selected);
      });
    });
  }, [selectedSegments]);

  return (
    <div
      ref={containerRef}
      className="vessel-container"
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onClick={handleClick}
    >
      {hoverSegment && <div className="vessel-tooltip">{hoverSegment}</div>}
      <MapSvg />
      <div className="summary-box">
        {selectedSegments.length > 0
          ? selectedSegments.join(', ')
          : 'No segments selected.'}
      </div>
    </div>
  );
}
