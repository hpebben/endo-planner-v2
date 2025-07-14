import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { SelectControl } from "@wordpress/components";
import InlineModal from "./UI/InlineModal";
import SegmentedControl from "./UI/SegmentedControl";
import { DEFAULTS } from "./defaults";

export default function WireModal({
  isOpen,
  anchor,
  onRequestClose,
  values,
  onSave,
}) {
  const defaults = DEFAULTS.navigation.wire;
  const [form, setForm] = useState(() => ({
    platform: values.platform ?? defaults.size,
    length: values.length ?? defaults.length,
    type: values.type ?? defaults.brand,
    body: values.body ?? "",
    support: values.support ?? "",
    technique: values.technique ?? defaults.track,
    product: values.product ?? "",
  }));

  useEffect(() => {
    setForm({
      platform: values.platform ?? defaults.size,
      length: values.length ?? defaults.length,
      type: values.type ?? defaults.brand,
      body: values.body ?? "",
      support: values.support ?? "",
      technique: values.technique ?? defaults.track,
      product: values.product ?? "",
    });
  }, [values]);

  const lengths = ["180 cm", "260 cm", "300 cm"];
  const bodyOpts = ["Light bodied", "Intermediate bodied", "Heavy bodied"];
  const supportOpts = [
    "Rosen wire",
    "Lunderquist wire",
    "Amplatz wire",
    "Bentson wire",
    "Meier wire",
    "Newton wire",
  ];
  const handleChange = (field, val) => {
    const newVals = { ...form, [field]: val };
    setForm(newVals);
    onSave(newVals);
    if (newVals.platform && newVals.length && newVals.type && newVals.technique)
      onRequestClose();
  };
  return (
    <InlineModal
      title="Wire"
      isOpen={isOpen}
      anchor={anchor}
      onRequestClose={onRequestClose}
    >
      <SegmentedControl
        options={["0.014", "0.018", "0.035"].map((v) => ({
          label: v,
          value: v,
        }))}
        value={form.platform}
        onChange={(val) => handleChange("platform", val)}
        ariaLabel="Platform"
      />
      <SelectControl
        label="Length"
        value={form.length}
        options={lengths.map((v) => ({ label: v, value: v }))}
        onChange={(val) => handleChange("length", val)}
      />
      <SegmentedControl
        options={[
          { label: "Glidewire", value: "Glidewire" },
          { label: "CTO wire", value: "CTO wire" },
          { label: "Support wire", value: "Support wire" },
        ]}
        value={form.type}
        onChange={(val) => handleChange("type", val)}
        ariaLabel="Type"
      />
      {form.type === "CTO wire" && (
        <SelectControl
          label="Body type"
          value={form.body}
          options={[
            { label: "Choose body", value: "", disabled: true },
            ...bodyOpts.map((v) => ({ label: v, value: v })),
          ]}
          onChange={(val) => handleChange("body", val)}
        />
      )}
      {form.type === "Support wire" && (
        <SelectControl
          label="Support wire"
          value={form.support}
          options={[
            { label: "Choose wire", value: "", disabled: true },
            ...supportOpts.map((v) => ({ label: v, value: v })),
          ]}
          onChange={(val) => handleChange("support", val)}
        />
      )}
      <SegmentedControl
        options={[
          { label: "Intimal Tracking", value: "Intimal Tracking" },
          {
            label: "Limited sub-intimal dissection and re-entry",
            value: "Limited sub-intimal dissection and re-entry",
          },
        ]}
        value={form.technique}
        onChange={(val) => handleChange("technique", val)}
        ariaLabel="Technique"
      />
      <SelectControl
        label="Product"
        value={form.product}
        options={[
          { label: "Choose product", value: "", disabled: true },
          { label: "None", value: "none" },
        ]}
        onChange={(val) => handleChange("product", val)}
      />
      <div className="popup-close-row">
        <button
          type="button"
          className="circle-btn close-modal-btn"
          onClick={onRequestClose}
        >
          &times;
        </button>
      </div>
    </InlineModal>
  );
}

WireModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchor: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};
