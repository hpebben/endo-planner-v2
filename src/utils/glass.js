// GLASS cannot be derived reliably from a flat collection of diseased vessels.
// It requires a selected target arterial path plus validated FP/IP grades and
// the published staging matrix. Until that workflow exists, return an explicit
// incomplete result rather than a misleading stage.
export default function computeGlass(segments = {}, targetPath = null) {
  const hasAnatomy = Object.keys(segments || {}).length > 0;

  return {
    stage: null,
    fpGrade: null,
    ipGrade: null,
    pedalModifier: null,
    isComplete: false,
    hasAnatomy,
    reason: targetPath
      ? 'Validated FP and IP grading has not yet been implemented.'
      : 'Select and grade a target arterial path before calculating GLASS.',
  };
}
