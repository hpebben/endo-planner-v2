import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as VesselSVG } from '../assets/vessel-map.svg';
import '../styles/style.scss';

export default function VesselMap({
  selectedSegments = [],
  toggleSegment = () => {},
  setTooltip,
}) {
  const svgRef = useRef(null);
  const segmentsRef = useRef([]);
  const [hoverSegment, setHoverSegment] = useState(null);

  useEffect(() => {
    if (hoverSegment) {
      console.log('hover', hoverSegment);
    }
  }, [hoverSegment]);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const groups = Array.from(svgEl.querySelectorAll('g[id$="_Afbeelding"]'));

    segmentsRef.current = groups.map((group) => {
      const id = group.id;
      const name = (group.getAttribute('data-name') || id)
        .replace(/\u00A0?Afbeelding/, '')
        .replace(/_/g, ' ')
        .trim();
      const shapes = Array.from(
        group.querySelectorAll('path, polyline, polygon')
      );

      const enter = (e) => {
        setHoverSegment(id);
        if (setTooltip) {
          const rect = e.target.getBoundingClientRect();
          setTooltip({ name, x: e.clientX, y: rect.top + window.scrollY });
        }
        console.log('hover', id, name);
      };

      const leave = () => {
        setHoverSegment((cur) => (cur === id ? null : cur));
        if (setTooltip) setTooltip(null);
      };

      const click = () => {
        toggleSegment(id);
        console.log('click', id, name);
      };

      shapes.forEach((shape) => {
        shape.classList.add('vessel-path');
        shape.addEventListener('mouseenter', enter);
        shape.addEventListener('mouseleave', leave);
        shape.addEventListener('click', click);
      });

      return { id, name, shapes, handlers: { enter, leave, click } };
    });

    return () => {
      segmentsRef.current.forEach(({ shapes, handlers }) => {
        shapes.forEach((shape) => {
          shape.removeEventListener('mouseenter', handlers.enter);
          shape.removeEventListener('mouseleave', handlers.leave);
          shape.removeEventListener('click', handlers.click);
        });
      });
      segmentsRef.current = [];
    };
  }, [toggleSegment, setTooltip]);

  useEffect(() => {
    segmentsRef.current.forEach(({ id, shapes }) => {
      const isSelected = selectedSegments.includes(id);
      const isHover = hoverSegment === id;
      shapes.forEach((shape) => {
        shape.classList.toggle('selected', isSelected);
        shape.classList.toggle('hovered', isHover);
      });
    });
  }, [selectedSegments, hoverSegment]);

  return (
    <div className="vessel-map-wrapper">
      <VesselSVG ref={svgRef} />
    </div>
  );
}
