import { useEffect } from 'react';
import { DEFAULTS } from './defaults';

export default function AccessSelector({ dispatch, state, setNeedle, setSheath, setCatheter, children }) {
  useEffect(() => {
    if (state && !state.needles && !state.sheaths && !state.catheters) {
      if (setNeedle)  dispatch ? dispatch(setNeedle(DEFAULTS.access.needle)) : setNeedle(DEFAULTS.access.needle);
      if (setSheath)  dispatch ? dispatch(setSheath(DEFAULTS.access.sheath)) : setSheath(DEFAULTS.access.sheath);
      if (setCatheter) dispatch ? dispatch(setCatheter(DEFAULTS.access.catheter)) : setCatheter(DEFAULTS.access.catheter);
    }
  }, []); // run once

  return children || null;
}
