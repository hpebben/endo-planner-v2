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
      console.log('Hovering segment:', hoverSegment);
    } else {
      console.log('Hover cleared');
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
        console.log('hover event for', id, name);
        setHoverSegment(id);
        if (setTooltip) {
          const rect = e.target.getBoundingClientRect();
          setTooltip({ name, x: e.clientX, y: rect.top + window.scrollY });
        }
      };

      const leave = () => {
        setHoverSegment((cur) => (cur === id ? null : cur));
        if (setTooltip) setTooltip(null);
      };

      const click = () => {
        console.log('click event for', id, name);
        toggleSegment(id);
      };

      console.log('Attaching handlers to', id);
      group.addEventListener('mouseover', enter);
      group.addEventListener('mouseout', leave);
      group.addEventListener('click', click);

      shapes.forEach((shape) => {
        shape.classList.add('vessel-path');
      });

      return { id, name, shapes, el: group, handlers: { enter, leave, click } };
    });

    return () => {
      segmentsRef.current.forEach(({ el, handlers }) => {
        el.removeEventListener('mouseover', handlers.enter);
        el.removeEventListener('mouseout', handlers.leave);
        el.removeEventListener('click', handlers.click);
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
        console.log(
          'Apply classes for',
          id,
          shape.getAttribute('class')
        );
      });
    });
  }, [selectedSegments, hoverSegment]);

  return (
    <div className="vessel-map-wrapper">
      <VesselSVG ref={svgRef} />
    </div>
  );
}
