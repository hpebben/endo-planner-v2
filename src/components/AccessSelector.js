import React, { useEffect } from "react";
import { SelectControl } from "@wordpress/components";
import { DEFAULTS } from "./defaults";

export default function AccessSelector({
  needle = {},
  sheath = {},
  catheter = {},
  setNeedle,
  setSheath,
  setCatheter,
}) {
  useEffect(() => {
    const empty = !needle.gauge && !sheath.fr && !catheter.model;
    if (empty) {
      setNeedle?.(DEFAULTS.access.needle);
      setSheath?.(DEFAULTS.access.sheath);
      setCatheter?.(DEFAULTS.access.catheter);
    }
  }, []);

  return (
    <>
      <SelectControl
        label="Gauge"
        options={["18 G", "19 G", "21 G"].map((v) => ({ label: v, value: v }))}
        value={needle.gauge || DEFAULTS.access.needle.gauge}
        onChange={(v) => setNeedle?.({ ...needle, gauge: v })}
      />
    </>
  );
}
