import React from 'react';

export default function VesselMap({ segmentRefs = {}, segmentColors = {}, onSegmentClick = () => {} }) {
  return (
    <svg width="100%" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
      <g
        id="Aorta"
        ref={segmentRefs.Aorta}
        onClick={() => onSegmentClick('Aorta')}
        style={{ cursor: 'pointer' }}
      >
        <path d="M100 20 L100 80" stroke={segmentColors.Aorta} strokeWidth="8" fill="none" />
      </g>
      <g
        id="Left_iliac"
        ref={segmentRefs.Left_iliac}
        onClick={() => onSegmentClick('Left_iliac')}
        style={{ cursor: 'pointer' }}
      >
        <path d="M100 80 L70 120" stroke={segmentColors.Left_iliac} strokeWidth="8" fill="none" />
      </g>
      <g
        id="Right_iliac"
        ref={segmentRefs.Right_iliac}
        onClick={() => onSegmentClick('Right_iliac')}
        style={{ cursor: 'pointer' }}
      >
        <path d="M100 80 L130 120" stroke={segmentColors.Right_iliac} strokeWidth="8" fill="none" />
      </g>
      <g
        id="Left_femoral"
        ref={segmentRefs.Left_femoral}
        onClick={() => onSegmentClick('Left_femoral')}
        style={{ cursor: 'pointer' }}
      >
        <path d="M70 120 L70 200" stroke={segmentColors.Left_femoral} strokeWidth="8" fill="none" />
      </g>
      <g
        id="Right_femoral"
        ref={segmentRefs.Right_femoral}
        onClick={() => onSegmentClick('Right_femoral')}
        style={{ cursor: 'pointer' }}
      >
        <path d="M130 120 L130 200" stroke={segmentColors.Right_femoral} strokeWidth="8" fill="none" />
      </g>
    </svg>
  );
}
