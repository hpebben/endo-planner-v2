import React from "react";
import PropTypes from "prop-types";
import { SelectControl } from "@wordpress/components";
import InlineModal from "./UI/InlineModal";
import SegmentedControl from "./UI/SegmentedControl";
import { useWizard } from "./WizardContext";

const stentDia = {
  0.014: ["2", "3", "4", "5"],
  0.018: ["4", "5", "6", "7"],
  0.035: ["5", "6", "7", "8", "9", "10"],
};
const stentLen = {
  0.014: ["20", "40", "60", "80"],
  0.018: ["40", "60", "80", "100"],
  0.035: ["40", "60", "80", "100", "120"],
};

export default function StentModal({ isOpen, anchor, onRequestClose }) {
  const { state, setState } = useWizard();
  const form = state.vesselPrep?.stent || {
    platform: '',
    type: '',
    material: '',
    diameter: '',
    length: '',
    shaft: ''
  };

  const handleChange = (field, val) => {
    const newVals = { ...form, [field]: val };
    if (field === "platform") {
      newVals.diameter = val ? stentDia[val][0] : "";
      newVals.length = val ? stentLen[val][0] : "";
    }
    setState(prev => ({
      ...prev,
      vesselPrep: { ...prev.vesselPrep, stent: newVals }
    }));
    if (
      newVals.platform &&
      newVals.type &&
      newVals.material &&
      newVals.diameter &&
      newVals.length &&
      newVals.shaft
    )
      onRequestClose();
  };

  return (
    <InlineModal
      title="Stent"
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
      <SegmentedControl
        options={[
          { label: "self expandable", value: "self expandable" },
          { label: "balloon expandable", value: "balloon expandable" },
        ]}
        value={form.type}
        onChange={(val) => handleChange("type", val)}
        ariaLabel="Stent type"
      />
      <SegmentedControl
        options={[
          { label: "bare metal", value: "bare metal" },
          { label: "covered", value: "covered" },
        ]}
        value={form.material}
        onChange={(val) => handleChange("material", val)}
        ariaLabel="Stent material"
      />
      <SelectControl
        label="Diameter"
        value={form.diameter}
        options={[
          { label: "Choose diameter", value: "", disabled: true },
          ...(stentDia[form.platform] || []).map((v) => ({
            label: v,
            value: v,
          })),
        ]}
        onChange={(val) => handleChange("diameter", val)}
      />
      <SelectControl
        label="Length"
        value={form.length}
        options={[
          { label: "Choose length", value: "", disabled: true },
          ...(stentLen[form.platform] || []).map((v) => ({
            label: v,
            value: v,
          })),
        ]}
        onChange={(val) => handleChange("length", val)}
      />
      <SelectControl
        label="Shaft length"
        value={form.shaft}
        className="selector--sm"
        options={[
          { label: "80 cm", value: "80 cm" },
          { label: "135 cm", value: "135 cm" },
        ]}
        onChange={(val) => handleChange("shaft", val)}
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

StentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchor: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
};
