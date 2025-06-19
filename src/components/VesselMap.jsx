import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as VesselSVG } from '../assets/vessel-map.svg';
import '../styles/style.scss';

export default function VesselMap() {
  const svgRef = useRef(null);
  const segmentsRef = useRef([]);
  const [hoverSegment, setHoverSegment] = useState(null);
  const [selectedSegments, setSelectedSegments] = useState([]);

  useEffect(() => {
    console.log('📦 hoverSegment changed to', hoverSegment);
  }, [hoverSegment]);

  useEffect(() => {
    console.log('📦 selectedSegments changed to', selectedSegments);
  }, [selectedSegments]);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const groups = Array.from(
      svgEl.querySelectorAll('g[id$="_Afbeelding"]')
    );
    console.log(`\u{1F50D} SVG groups found: ${groups.length}`, groups);
    groups.forEach((group) => {
      console.group(`Group ID: ${group.id}`);
      const shapes = Array.from(
        group.querySelectorAll('path, polyline, polygon')
      );
      console.log(`  \u2014 ${shapes.length} shapes in this group`);
      shapes.forEach((shape) => {
        console.log(`    \u2022 ${shape.tagName}#${shape.id}`, shape);
      });
      console.groupEnd();
    });

    segmentsRef.current = [];

    groups.forEach((group) => {
      const shapes = Array.from(
        group.querySelectorAll('path, polyline, polygon')
      );
      shapes.forEach((shape) => {
        shape.classList.add('vessel-path');
        const enter = () => setHoverSegment(group.id);
        const leave = () => setHoverSegment(null);
        const click = () => {
          setSelectedSegments((prev) => {
            const exists = prev.includes(group.id);
            return exists
              ? prev.filter((id) => id !== group.id)
              : [...prev, group.id];
          });
        };
        shape.addEventListener('mouseenter', enter);
        shape.addEventListener('mouseleave', leave);
        shape.addEventListener('click', click);
        shape.__handlers = { enter, leave, click };
      });
      segmentsRef.current.push({ id: group.id, shapes });
    });

    return () => {
      segmentsRef.current.forEach(({ shapes }) => {
        shapes.forEach((shape) => {
          const h = shape.__handlers;
          if (!h) return;
          shape.removeEventListener('mouseenter', h.enter);
          shape.removeEventListener('mouseleave', h.leave);
          shape.removeEventListener('click', h.click);
        });
      });
      segmentsRef.current = [];
    };
  }, []);

  useEffect(() => {
    segmentsRef.current.forEach(({ id, shapes }) => {
      shapes.forEach((shape) => {
        shape.classList.toggle('selected', selectedSegments.includes(id));
      });
    });
  }, [selectedSegments]);

  return (
    <div className="vessel-map-wrapper">
      <VesselSVG ref={svgRef} />
      <div className="selected-segments">
        <h4>Selected segments</h4>
        {selectedSegments.length ? (
          selectedSegments.map((id) => <div key={id}>{id}</div>)
        ) : (
          <div>No segments selected.</div>
        )}
      </div>
    </div>
  );
}
