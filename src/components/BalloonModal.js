import React from "react";
import PropTypes from "prop-types";
import { SelectControl } from "@wordpress/components";
import InlineModal from "./UI/InlineModal";
import SegmentedControl from "./UI/SegmentedControl";
import { useWizard } from "./WizardContext";

export default function BalloonModal({ isOpen, anchor, onRequestClose }) {
  const { state, setState } = useWizard();
  const form = state.vesselPrep.balloon;

  const diameters = {
    0.014: ["1.5", "2", "2.5", "3.5", "4"],
    0.018: ["2", "2.5", "3", "4", "5", "5.5", "6", "7"],
    0.035: ["3", "4", "5", "6", "7", "8", "9", "10", "12", "14"],
  };
  const lengths = [
    "10",
    "12",
    "15",
    "18",
    "20",
    "30",
    "40",
    "50",
    "60",
    "70",
    "80",
    "90",
    "100",
    "110",
    "120",
    "250",
  ];
  const handleChange = (field, val) => {
    const newVals = { ...form, [field]: val };
    if (field === "platform") {
      newVals.diameter = val ? diameters[val][0] : "";
    }
    setState(prev => ({
      ...prev,
      vesselPrep: { ...prev.vesselPrep, balloon: newVals }
    }));
    if (newVals.platform && newVals.diameter && newVals.length && newVals.shaft)
      onRequestClose();
  };

  return (
    <InlineModal
      title="PTA Balloon"
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
        label="Diameter"
        value={form.diameter}
        options={(diameters[form.platform] || []).map((v) => ({
          label: v,
          value: v,
        }))}
        onChange={(val) => handleChange("diameter", val)}
      />
      <SelectControl
        label="Length (mm)"
        value={form.length}
        options={[
          { label: "Choose length", value: "", disabled: true },
          ...lengths.map((v) => ({ label: v, value: v })),
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

BalloonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchor: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
};
