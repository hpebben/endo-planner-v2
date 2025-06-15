import React, { useEffect, useState } from 'react';
import { ReactComponent as MapSvg } from '../assets/vessel-map.svg';
import { vesselSegments } from './steps/Step2_Patency';

export default function VesselMap() {
  const [hoverSegment, setHoverSegment] = useState('');
  const [selectedSegments, setSelectedSegments] = useState([]);

  useEffect(() => {
    const handlers = [];
    vesselSegments.forEach(({ id, name }) => {
      const group = document.getElementById(id);
      if (!group) return;
      group.querySelectorAll('path').forEach((el) => {
        el.classList.add('segment');
        el.classList.toggle('selected', selectedSegments.includes(name));

        const title = el.querySelector('title');
        if (title) title.remove();

        const clickHandler = () => {
          setSelectedSegments((prev) =>
            prev.includes(name)
              ? prev.filter((n) => n !== name)
              : [...prev, name]
          );
        };
        const enterHandler = () => setHoverSegment(name);
        const leaveHandler = () => setHoverSegment('');

        el.addEventListener('click', clickHandler);
        el.addEventListener('mouseenter', enterHandler);
        el.addEventListener('mouseleave', leaveHandler);

        handlers.push({ el, clickHandler, enterHandler, leaveHandler });
      });
    });
    return () => {
      handlers.forEach(({ el, clickHandler, enterHandler, leaveHandler }) => {
        el.removeEventListener('click', clickHandler);
        el.removeEventListener('mouseenter', enterHandler);
        el.removeEventListener('mouseleave', leaveHandler);
      });
    };
  }, [selectedSegments]);

  return (
    <div className="vessel-container">
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
