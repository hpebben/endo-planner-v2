import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

// A portal keeps long product names clear of the planning cards' clipping.
export default function DeviceTooltip({ text, children }) {
  const id = useId();
  const anchor = useRef(null);
  const bubble = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  useLayoutEffect(() => {
    if (!open || !bubble.current || !anchor.current) return;
    const rect = anchor.current.getBoundingClientRect();
    const bounds = bubble.current.getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - bounds.width - 8, rect.left + rect.width / 2 - bounds.width / 2));
    const top = rect.top > bounds.height + 16 ? rect.top - bounds.height - 8 : Math.min(window.innerHeight - bounds.height - 8, rect.bottom + 8);
    setPosition({ left, top: Math.max(8, top) });
  }, [open, text]);
  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    const key = (event) => { if (event.key === 'Escape') close(); };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    document.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      document.removeEventListener('keydown', key);
    };
  }, [open]);
  return (
    <span className="device-tooltip-anchor" ref={anchor}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onClick={() => setOpen(false)}>
      {React.cloneElement(children, { 'aria-describedby': open && text ? id : undefined })}
      {open && text && createPortal(<span className="device-name-tooltip" id={id} ref={bubble} role="tooltip" style={position}>{text}</span>, document.body)}
    </span>
  );
}

DeviceTooltip.propTypes = { text: PropTypes.string, children: PropTypes.element.isRequired };
