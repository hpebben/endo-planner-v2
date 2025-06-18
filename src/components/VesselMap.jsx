import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as VesselSVG } from '../assets/vessel-map.svg';
import '../styles/style.scss';

export default function VesselMap() {
  const wrapperRef = useRef(null);
  const [hoverSegment, setHoverSegment] = useState(null);
  const [selectedSegments, setSelectedSegments] = useState([]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const svg = wrapper.querySelector('svg');
    if (!svg) return;

    const allEls = Array.from(svg.querySelectorAll('[id$="_Afbeelding"]'));
    const leafEls = allEls.filter(el => el.children.length === 0);

    const normalize = id => id.replace(/^.*__/, '');

    leafEls.forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('mouseenter', () => {
        el.classList.add('hovered');
        setHoverSegment(normalize(el.id));
      });
      el.addEventListener('mouseleave', () => {
        el.classList.remove('hovered');
        setHoverSegment(null);
      });
      el.addEventListener('click', () => {
        el.classList.toggle('selected');
        const key = normalize(el.id);
        setSelectedSegments(prev =>
          prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
        );
      });
    });

    return () => {
      leafEls.forEach(el => {
        el.replaceWith(el.cloneNode(true));
      });
    };
  }, [wrapperRef]);

  return (
    <div className="vessel-map-wrapper" ref={wrapperRef}>
      <VesselSVG />
      <div className="vessel-summary">
        {selectedSegments.length === 0 ? (
          <p>No vessels selected</p>
        ) : (
          <ul>
            {selectedSegments.map(seg => (
              <li key={seg}>
                {seg
                  .replace(/_/g, ' ')
                  .replace(/Afbeelding/, '')
                  .trim()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
